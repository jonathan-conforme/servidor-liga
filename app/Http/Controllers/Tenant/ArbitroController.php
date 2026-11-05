<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\Arbitro\StoreArbitroRequest;
use App\Http\Requests\Tenant\Arbitro\UpdateArbitroRequest;
use App\Models\Tenant\Arbitro;
use App\Services\Tenant\ArbitroService;
use Inertia\Inertia;

class ArbitroController extends Controller
{
    public function __construct(protected ArbitroService $service) {}

    public function index()
    {
        return Inertia::render('Tenant/Arbitros/Index', [
            'arbitros' => Arbitro::orderBy('apellidos')->orderBy('nombres')->get(),
        ]);
    }

    public function store(StoreArbitroRequest $request)
    {
        $this->service->crear($request->validated());

        return back()->with('success', 'Árbitro creado correctamente.');
    }

    public function update(UpdateArbitroRequest $request, Arbitro $arbitro)
    {
        $this->service->actualizar($arbitro, $request->validated());

        return back()->with('success', 'Árbitro actualizado correctamente.');
    }

    public function destroy(Arbitro $arbitro)
    {
        $this->service->eliminar($arbitro);

        return back()->with('success', 'Árbitro eliminado correctamente.');
    }
}
