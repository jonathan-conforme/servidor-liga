<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\Partido\UpdatePartidoRequest;
use App\Models\Tenant\Torneo;
use App\Models\Tenant\Jornada;
use App\Models\Tenant\Partido;
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
            $jornadasConPartidos = Jornada::with(['partidos.equipoLocal', 'partidos.equipoVisitante'])
                ->where('torneo_id', $torneoSeleccionado->id)
                ->orderBy('numero', 'asc')
                ->get();
        }

        return Inertia::render('Tenant/Partidos/Index', [
            'torneos'             => $torneos,
            'torneoSeleccionado'  => $torneoSeleccionado,
            'jornadasConPartidos' => $jornadasConPartidos,
        ]);
    }

    public function generarFixture(Request $request)
    {
        $request->validate([
            'torneo_id' => ['required', 'integer', 'exists:torneos,id'],
        ]);

        $total = $this->fixtureService->generarFixture($request->input('torneo_id'));

        return back()->with('success', "¡Fixture generado con éxito! Se programaron {$total} partidos.");
    }

    public function update(UpdatePartidoRequest $request, Partido $partido)
    {
        $partido->update($request->validated());

        return back()->with('success', 'Partido actualizado correctamente.');
    }
}
