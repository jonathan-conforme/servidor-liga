<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Torneo;
use App\Models\Tenant\Equipo;
use App\Models\Tenant\Categoria;
use App\Models\Tenant\EquipoTorneo;
use App\Models\Tenant\Jugador;
use App\Http\Requests\Tenant\Inscripcion\StoreInscripcionEquipoRequest;
use App\Http\Requests\Tenant\Inscripcion\StoreRosterRequest;
use App\Services\Tenant\InscripcionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InscripcionController extends Controller
{
    protected InscripcionService $service;

    public function __construct(InscripcionService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $torneoId = $request->input('torneo_id');

        $torneos = Torneo::orderBy('created_at', 'desc')->get();
        $torneoSeleccionado = $torneoId ? Torneo::find($torneoId) : $torneos->first();

        $inscripciones = [];
        if ($torneoSeleccionado) {
            $inscripciones = EquipoTorneo::with(['equipo', 'categoria', 'grupo', 'jugadores'])
                ->where('torneo_id', $torneoSeleccionado->id)
                ->get();
        }

        return Inertia::render('Tenant/Inscripciones/Index', [
            'torneos'            => $torneos,
            'torneoSeleccionado' => $torneoSeleccionado,
            'inscripciones'      => $inscripciones,
            'equipos'            => Equipo::where('activo', true)->get(),
            'categorias'         => Categoria::where('activo', true)->get(),
            'jugadoresMaestros'  => Jugador::orderBy('apellidos', 'asc')
                                    ->get(['id', 'nombres', 'apellidos', 'cedula', 'posicion','fecha_nacimiento', 'activo']),
        ]);
    }

    public function store(StoreInscripcionEquipoRequest $request)
    {
        $this->service->inscribirEquipo($request->validated());
        return back()->with('success', 'Equipo inscrito correctamente en el torneo.');
    }

    public function destroy(EquipoTorneo $inscripcion)
    {
        $this->service->eliminarInscripcion($inscripcion);
        return back()->with('info', 'Inscripción eliminada.');
    }

    public function storeRoster(StoreRosterRequest $request)
    {
        $this->service->guardarRoster(
            $request->validated('equipo_torneo_id'),
            $request->validated('jugadores')
        );
        return back()->with('success', 'Plantilla de jugadores actualizada.');
    }

    /**
     * Endpoint AJAX para el buscador asíncrono de React
     */
    public function buscarJugadoresDisponibles(Request $request)
    {
        $jugadores = $this->service->buscarJugadoresDisponibles(
            (string) $request->input('q', ''),
            (int) $request->input('torneo_id')
        );

        return response()->json($jugadores);
    }
}
