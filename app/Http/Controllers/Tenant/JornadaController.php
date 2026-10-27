<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\Jornada\UpdateJornadaRequest;
use App\Models\Tenant\Jornada;
use App\Models\Tenant\Torneo;
use App\Services\Tenant\JornadaService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JornadaController extends Controller
{
    protected JornadaService $jornadaService;

    public function __construct(JornadaService $jornadaService)
    {
        $this->jornadaService = $jornadaService;
    }

    public function index(Request $request)
    {
        $torneos = Torneo::orderBy('created_at', 'desc')->get();
        $torneoId = $request->input('torneo_id');
        $torneoSeleccionado = $torneoId ? Torneo::find($torneoId) : $torneos->first();

        $jornadas = $torneoSeleccionado
            ? $this->jornadaService->obtenerPorTorneo($torneoSeleccionado->id)
            : collect();

        return Inertia::render('Tenant/Jornadas/Index', [
            'torneos' => $torneos,
            'torneoSeleccionado' => $torneoSeleccionado,
            'jornadas' => $jornadas->values(), // <-- .values() asegura formato JSON de array
        ]);
    }

    public function update(UpdateJornadaRequest $request, Jornada $jornada)
    {
        $this->jornadaService->actualizarJornada($jornada, $request->validated());

        return back()->with('success', 'Jornada actualizada con éxito.');
    }
}
