<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Torneo;
use App\Services\Tenant\GoleadorService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GoleadorController extends Controller
{
    public function __construct(
        protected GoleadorService $goleadorService
    ) {}

    public function index(Request $request)
    {
        $torneos = Torneo::select('id', 'nombre')->get();
        $torneoIdSeleccionado = $request->integer('torneo_id') ?: $torneos->first()?->id;

        $goleadores = [];
        if ($torneoIdSeleccionado) {
            $goleadores = $this->goleadorService->obtenerGoleadores($torneoIdSeleccionado);
        }

        return Inertia::render('Tenant/Goleadores/Index', [
            'torneos'              => $torneos,
            'torneoIdSeleccionado' => $torneoIdSeleccionado,
            'goleadores'           => $goleadores,
        ]);
    }
}