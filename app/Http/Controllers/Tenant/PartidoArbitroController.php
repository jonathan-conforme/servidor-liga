<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\Partido\AsignarArbitrosRequest;
use App\Models\Tenant\Partido;
use App\Services\Tenant\PartidoArbitroService;

class PartidoArbitroController extends Controller
{
    public function __construct(protected PartidoArbitroService $service) {}

    public function sync(AsignarArbitrosRequest $request, Partido $partido)
    {
        if ($partido->estado === 'FINALIZADO') {
            return back()->withErrors(['arbitros' => 'No se pueden cambiar árbitros de un partido finalizado.']);
        }

        $this->service->asignar($partido, $request->validated());

        return back()->with('success', 'Árbitros asignados correctamente.');
    }
}
