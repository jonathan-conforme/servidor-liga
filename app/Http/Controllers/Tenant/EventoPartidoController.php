<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\Partido\StoreEventoPartidoRequest;
use App\Models\Tenant\EventoPartido;
use App\Models\Tenant\Partido;
use App\Services\Tenant\EventoPartidoService;
use Inertia\Inertia;

class EventoPartidoController extends Controller
{
    public function __construct(
        protected EventoPartidoService $eventoPartidoService
    ) {}

    public function show(Partido $partido)
    {
        $partidoCargado = $this->eventoPartidoService->cargarDatosPartido($partido);

        $jugadoresLocal = $this->eventoPartidoService->obtenerJugadoresInscritos(
            $partido->torneo_id,
            $partido->equipo_local_id
        );

        $jugadoresVisitante = $this->eventoPartidoService->obtenerJugadoresInscritos(
            $partido->torneo_id,
            $partido->equipo_visitante_id
        );

        return Inertia::render('Tenant/Partidos/EnVivo', [
            'partido' => $partidoCargado,
            'jugadoresLocal' => $jugadoresLocal,
            'jugadoresVisitante' => $jugadoresVisitante,
        ]);
    }

    public function store(StoreEventoPartidoRequest $request, Partido $partido)
    {
        $this->eventoPartidoService->registrarEvento($partido, $request->validated());

        return back()->with('success', 'Evento registrado correctamente.');
    }

    public function destroy(Partido $partido, EventoPartido $evento)
    {
        if ($partido->estado === 'FINALIZADO') {
            return back()->withErrors(['error' => 'El partido está finalizado y sus eventos no se pueden modificar.']);
        }

        $this->eventoPartidoService->eliminarEvento($partido, $evento);

        return back()->with('success', 'Evento eliminado.');
    }
}
