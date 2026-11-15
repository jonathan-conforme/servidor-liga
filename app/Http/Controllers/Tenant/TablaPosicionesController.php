<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Categoria;
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
        $torneos = Torneo::select('id', 'nombre', 'anio', 'tipo_competicion', 'cantidad_grupos', 'clasificados_por_grupo')
            ->orderBy('created_at', 'desc')
            ->get();

        $torneoIdSeleccionado = $request->integer('torneo_id') ?: $torneos->first()?->id;
        $torneoSeleccionado = $torneos->firstWhere('id', $torneoIdSeleccionado);

        $categorias = collect();
        $categoriaIdSeleccionada = null;
        $clasificacion = [
            'es_grupos'              => false,
            'clasificados_por_grupo' => 0,
            'grupos'                 => [],
        ];

        if ($torneoSeleccionado) {
            $categorias = Categoria::whereIn('id', function ($q) use ($torneoSeleccionado) {
                $q->select('categoria_id')
                    ->from('equipo_torneo')
                    ->where('torneo_id', $torneoSeleccionado->id)
                    ->whereNotNull('categoria_id');
            })
                ->orderBy('nombre')
                ->get(['id', 'nombre']);

            if ($categorias->isNotEmpty()) {
                $reqCat = $request->integer('categoria_id');
                $categoriaIdSeleccionada = $categorias->contains('id', $reqCat)
                    ? $reqCat
                    : $categorias->first()->id;
            }

            $clasificacion = $this->tablaPosicionesService->obtenerClasificacion(
                $torneoSeleccionado,
                $categoriaIdSeleccionada
            );
        }

        return Inertia::render('Tenant/Tablas/Index', [
            'torneos'                 => $torneos,
            'torneoIdSeleccionado'    => $torneoIdSeleccionado ?? '',
            'torneoSeleccionado'      => $torneoSeleccionado,
            'categorias'              => $categorias,
            'categoriaIdSeleccionada' => $categoriaIdSeleccionada ?? '',
            'clasificacion'           => $clasificacion,
        ]);
    }
}
