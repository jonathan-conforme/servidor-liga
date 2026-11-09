<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Torneo;
use App\Services\Tenant\TablaPosicionesService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TablaPosicionesController extends Controller
{
    public function __construct(
        protected TablaPosicionesService $tablaPosicionesService
    ) {}

    public function index(Request $request)
    {
        $torneos = Torneo::select('id', 'nombre')->get();
        $torneoIdSeleccionado = $request->integer('torneo_id') ?: $torneos->first()?->id;

        $tabla = [];
        if ($torneoIdSeleccionado) {
            $tabla = $this->tablaPosicionesService->calcularTabla($torneoIdSeleccionado);
        }

        return Inertia::render('Tenant/Tablas/Index', [
            'torneos'              => $torneos,
            'torneoIdSeleccionado' => $torneoIdSeleccionado,
            'tabla'                => $tabla,
        ]);
    }
}