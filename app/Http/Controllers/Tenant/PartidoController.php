<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\Partido\UpdatePartidoRequest;
use App\Models\Tenant\Arbitro;
use App\Models\Tenant\Jornada;
use App\Models\Tenant\Partido;
use App\Models\Tenant\Torneo;
use App\Models\Tenant\Equipo;
use App\Models\Tenant\EquipoTorneo;
use App\Services\Tenant\FixtureService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PartidoController extends Controller
{
    protected FixtureService $fixtureService;

    public function __construct(FixtureService $fixtureService)
    {
        $this->fixtureService = $fixtureService;
    }

    public function index(Request $request)
    {
        $torneos = Torneo::orderBy('created_at', 'desc')->get();
        $torneoId = $request->input('torneo_id');
        $torneoSeleccionado = $torneoId ? Torneo::find($torneoId) : $torneos->first();

        $jornadasConPartidos = [];

        if ($torneoSeleccionado) {
            $jornadasConPartidos = Jornada::with([
                'partidos.equipoLocal',
                'partidos.equipoVisitante',
                'partidos.arbitros',
            ])
                ->where('torneo_id', $torneoSeleccionado->id)
                ->orderBy('numero', 'asc')
                ->get();
        }
        // Equipos inscritos en el torneo
    $idsInscritos = EquipoTorneo::where('torneo_id', $torneoSeleccionado->id)->pluck('equipo_id');
    $inscritos = Equipo::whereIn('id', $idsInscritos)->get();

    // Por cada jornada, los que no juegan descansan
    $jornadasConPartidos->each(function ($jornada) use ($inscritos) {
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

        $fixture = $torneoSeleccionado
            ? $this->fixtureService->estadoFixture($torneoSeleccionado->id)
            : ['existe' => false, 'bloqueado' => false];

        return Inertia::render('Tenant/Partidos/Index', [
            'torneos' => $torneos,
            'torneoSeleccionado' => $torneoSeleccionado,
            'jornadasConPartidos' => $jornadasConPartidos,
            'fixture' => $fixture,
            'arbitros' => Arbitro::where('activo', true)
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

    public function update(UpdatePartidoRequest $request, Partido $partido)
    {
        $partido->update($request->validated());

        // Si ya no queda ningún partido pendiente, cerrar el torneo
        $pendientes = Partido::where('torneo_id', $partido->torneo_id)
            ->where('estado', '!=', 'FINALIZADO')
            ->exists();

        if (! $pendientes) {
            Torneo::where('id', $partido->torneo_id)->update(['estado' => 'FINALIZADO']);
        }

        return back()->with('success', 'Partido actualizado correctamente.');
    }
}
