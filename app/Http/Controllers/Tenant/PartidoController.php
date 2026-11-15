<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\Partido\UpdatePartidoRequest;
use App\Models\Tenant\Arbitro;
use App\Models\Tenant\Categoria;
use App\Models\Tenant\Equipo;
use App\Models\Tenant\EquipoTorneo;
use App\Models\Tenant\Jornada;
use App\Models\Tenant\Partido;
use App\Models\Tenant\Torneo;
use App\Services\Tenant\FixtureService;
use App\Services\Tenant\PlayoffService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PartidoController extends Controller
{
    public function __construct(
        protected FixtureService $fixtureService,
        protected PlayoffService $playoffService
    ) {}

    public function index(Request $request)
    {
        $torneos = Torneo::orderBy('created_at', 'desc')->get();
        $torneoId = $request->input('torneo_id');
        $torneoSeleccionado = $torneoId ? Torneo::find($torneoId) : $torneos->first();

        $jornadasConPartidos = collect();
        $categorias = collect();
        $categoriaIdSeleccionada = null;

        if ($torneoSeleccionado) {
            $categorias = Categoria::whereIn('id', function ($q) use ($torneoSeleccionado) {
                $q->select('categoria_id')
                    ->from('equipo_torneo')
                    ->where('torneo_id', $torneoSeleccionado->id)
                    ->whereNotNull('categoria_id');
            })
                ->orderBy('nombre')
                ->get(['id', 'nombre']);

            if ($categorias->isNotEmpty()) {
                $reqCat = $request->integer('categoria_id');
                $categoriaIdSeleccionada = $categorias->contains('id', $reqCat)
                    ? $reqCat
                    : $categorias->first()->id;
            }

            $jornadasConPartidos = Jornada::with([
                'partidos.equipoLocal',
                'partidos.equipoVisitante',
                'partidos.arbitros',
                'partidos.grupo',
                'partidos.categoria',
            ])
                ->where('torneo_id', $torneoSeleccionado->id)
                ->when($categoriaIdSeleccionada, fn ($q) => $q->where('categoria_id', $categoriaIdSeleccionada))
                ->orderBy('numero', 'asc')
                ->get();

            $idsInscritos = EquipoTorneo::where('torneo_id', $torneoSeleccionado->id)
                ->when($categoriaIdSeleccionada, fn ($q) => $q->where('categoria_id', $categoriaIdSeleccionada))
                ->pluck('equipo_id');

            $inscritos = Equipo::whereIn('id', $idsInscritos)->get();

            $jornadasConPartidos->each(function ($jornada) use ($inscritos) {
                if (! in_array($jornada->fase, ['REGULAR', 'GRUPOS'], true)) {
                    $jornada->setAttribute('descansan', []);
                    return;
                }

                $juegan = $jornada->partidos
                    ->flatMap(fn ($p) => [$p->equipo_local_id, $p->equipo_visitante_id]);

                $jornada->setAttribute(
                    'descansan',
                    $inscritos
                        ->reject(fn ($e) => $juegan->contains($e->id))
                        ->map(fn ($e) => ['id' => $e->id, 'nombre' => $e->nombre])
                        ->values()
                );
            });
        }

        $fixture = $torneoSeleccionado
            ? $this->fixtureService->estadoFixture($torneoSeleccionado->id)
            : ['existe' => false, 'bloqueado' => false];

        $playoffs = $torneoSeleccionado
            ? $this->playoffService->estadoPlayoffs($torneoSeleccionado, $categoriaIdSeleccionada)
            : ['aplica' => false];

        return Inertia::render('Tenant/Partidos/Index', [
            'torneos'                 => $torneos,
            'torneoSeleccionado'      => $torneoSeleccionado,
            'categorias'              => $categorias,
            'categoriaIdSeleccionada' => $categoriaIdSeleccionada ?? '',
            'jornadasConPartidos'     => $jornadasConPartidos,
            'fixture'                 => $fixture,
            'playoffs'                => $playoffs,
            'arbitros'                => Arbitro::where('activo', true)
                ->orderBy('apellidos')
                ->get(['id', 'nombres', 'apellidos']),
        ]);
    }

    public function generarFixture(Request $request)
    {
        $data = $request->validate([
            'torneo_id' => ['required', 'integer', 'exists:torneos,id'],
            'regenerar' => ['sometimes', 'boolean'],
        ]);

        $total = $this->fixtureService->generarFixture(
            $data['torneo_id'],
            (bool) ($data['regenerar'] ?? false)
        );

        return back()->with('success', "¡Fixture generado con éxito! Se programaron {$total} partidos.");
    }

    public function generarPlayoffs(Request $request)
    {
        $data = $request->validate([
            'torneo_id'                    => ['required', 'integer', 'exists:torneos,id'],
            'categoria_id'                 => ['nullable', 'integer', 'exists:categorias,id'],
            'fase'                         => ['required', 'string', 'in:OCTAVOS,CUARTOS,SEMIFINAL,FINAL'],
            'llaves'                       => ['required', 'array', 'min:1'],
            'llaves.*.equipo_local_id'     => ['required', 'integer', 'exists:equipos,id'],
            'llaves.*.equipo_visitante_id' => ['required', 'integer', 'exists:equipos,id'],
        ]);

        $total = $this->playoffService->generarRonda(
            $data['torneo_id'],
            $data['fase'],
            $data['llaves'],
            $data['categoria_id'] ?? null
        );

        return back()->with('success', "¡Fase eliminatoria generada! Se crearon {$total} partido(s).");
    }

    public function deshacerPlayoffs(Request $request)
    {
        $data = $request->validate([
            'torneo_id'    => ['required', 'integer', 'exists:torneos,id'],
            'categoria_id' => ['nullable', 'integer', 'exists:categorias,id'],
        ]);

        $this->playoffService->deshacerUltimaRonda(
            $data['torneo_id'],
            $data['categoria_id'] ?? null
        );

        return back()->with('info', 'La última fase de Play-offs fue eliminada.');
    }

    public function update(UpdatePartidoRequest $request, Partido $partido)
    {
        $partido->update($request->validated());

        $torneo = Torneo::find($partido->torneo_id);
        $pendientes = Partido::where('torneo_id', $partido->torneo_id)
            ->where('estado', '!=', 'FINALIZADO')
            ->exists();

        if (! $pendientes && $torneo) {
            if ($torneo->tipo_competicion === 'LIGA') {
                $torneo->update(['estado' => 'FINALIZADO']);
            } else {
                // En torneos eliminatorios, solo se finaliza cuando ya se jugó la FINAL
                $finalJugada = Partido::where('torneo_id', $torneo->id)
                    ->where('fase', 'FINAL')
                    ->where('estado', 'FINALIZADO')
                    ->exists();

                if ($finalJugada) {
                    $torneo->update(['estado' => 'FINALIZADO']);
                }
            }
        }

        return back()->with('success', 'Partido actualizado correctamente.');
    }
}
