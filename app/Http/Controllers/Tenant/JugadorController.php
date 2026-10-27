<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Jugador;
use App\Http\Requests\Tenant\Jugador\StoreJugadorRequest;
use App\Http\Requests\Tenant\Jugador\UpdateJugadorRequest;
use App\Services\Tenant\JugadorService;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class JugadorController extends Controller
{
    protected $jugadorService;

    public function __construct(JugadorService $jugadorService)
    {
        $this->jugadorService = $jugadorService;
    }

    public function index(): Response
    {
        return Inertia::render('Tenant/Jugadores/Index', [
            'jugadores' => $this->jugadorService->index(10)
        ]);
    }

    public function store(StoreJugadorRequest $request): RedirectResponse
    {
        $this->jugadorService->create($request->validated());

        return back()->with('success', 'Jugador registrado exitosamente.');
    }

    public function update(UpdateJugadorRequest $request, Jugador $jugador): RedirectResponse
    {
        $this->jugadorService->update($jugador, $request->validated());

        return back()->with('success', 'Datos del jugador actualizados correctamente.');
    }

    public function destroy(Jugador $jugador): RedirectResponse
    {
        $jugador->delete();

        return back()->with('success', 'Jugador eliminado correctamente.');
    }
}
