<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Equipo;
use App\Http\Requests\Tenant\Equipo\StoreEquipoRequest;
use App\Http\Requests\Tenant\Equipo\UpdateEquipoRequest;
use App\Services\Tenant\EquipoService;
use Inertia\Inertia;

class EquipoController extends Controller
{
    protected $equipoService;

    public function __construct(EquipoService $equipoService)
    {
        $this->equipoService = $equipoService;
    }

    public function index()
    {
        return Inertia::render('Tenant/Equipos/Index', [
            'equipos' => $this->equipoService->index()
        ]);
    }

    public function store(StoreEquipoRequest $request)
    {
        $this->equipoService->create($request->validated());

        // Cambiado a back() igual que en Categorías
        return back()->with('success', 'Equipo creado exitosamente.');
    }

    public function update(UpdateEquipoRequest $request, Equipo $equipo)
    {
        $this->equipoService->update($equipo, $request->validated());

        // Cambiado a back() igual que en Categorías
        return back()->with('info', 'Equipo actualizado exitosamente.');
    }

    public function destroy(Equipo $equipo)
    {
        $equipo->delete();

        // Cambiado a back() igual que en Categorías
        return back()->with('success', 'Equipo eliminado exitosamente.');
    }
}
