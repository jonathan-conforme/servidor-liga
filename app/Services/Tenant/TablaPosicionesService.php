<?php

namespace App\Services\Tenant;

use App\Models\Tenant\Grupo;
use App\Models\Tenant\Partido;
use App\Models\Tenant\Torneo;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TablaPosicionesService
{
    /**
     * Devuelve la clasificación adaptada al formato del torneo (LIGA o GRUPOS_ELIMINACION).
     */
    public function obtenerClasificacion(Torneo $torneo, ?int $categoriaId = null): array
    {
        if ($torneo->tipo_competicion === 'GRUPOS_ELIMINACION') {
            return [
                'es_grupos'              => true,
                'clasificados_por_grupo' => (int) ($torneo->clasificados_por_grupo ?? 0),
                'grupos'                 => $this->calcularTablasPorGrupo($torneo, $categoriaId),
            ];
        }

        return [
            'es_grupos'              => false,
            'clasificados_por_grupo' => 0,
            'grupos'                 => [
                [
                    'grupo_id' => null,
                    'nombre'   => 'Tabla General',
                    'tabla'    => $this->calcularTabla($torneo->id, $categoriaId),
                ],
            ],
        ];
    }

    /**
     * Calcula la tabla general de un torneo (formato LIGA).
     */
    public function calcularTabla(int $torneoId, ?int $categoriaId = null): Collection
    {
        $queryInscritos = DB::table('equipo_torneo')
            ->join('equipos', 'equipo_torneo.equipo_id', '=', 'equipos.id')
            ->where('equipo_torneo.torneo_id', $torneoId);

        if ($categoriaId) {
            $queryInscritos->where('equipo_torneo.categoria_id', $categoriaId);
        }

        $equiposInscritos = $queryInscritos
            ->select('equipos.id', 'equipos.nombre', 'equipos.escudo')
            ->distinct()
            ->get();

        $tabla = [];
        foreach ($equiposInscritos as $equipo) {
            $tabla[$equipo->id] = $this->inicializarFila($equipo);
        }

        $queryPartidos = Partido::where('torneo_id', $torneoId)
            ->where('estado', 'FINALIZADO')
            ->where(function ($q) {
                $q->where('fase', 'REGULAR')->orWhereNull('fase');
            });

        if ($categoriaId) {
            $queryPartidos->where('categoria_id', $categoriaId);
        }

        foreach ($queryPartidos->get() as $partido) {
            $this->aplicarPartido($tabla, $partido);
        }

        return $this->ordenarTabla($tabla);
    }

    /**
     * Calcula una tabla independiente por cada grupo del torneo.
     */
    private function calcularTablasPorGrupo(Torneo $torneo, ?int $categoriaId = null): array
    {
        $grupos = Grupo::where('torneo_id', $torneo->id)
            ->orderBy('id')
            ->get();

        $queryInscritos = DB::table('equipo_torneo')
            ->join('equipos', 'equipo_torneo.equipo_id', '=', 'equipos.id')
            ->where('equipo_torneo.torneo_id', $torneo->id);

        if ($categoriaId) {
            $queryInscritos->where('equipo_torneo.categoria_id', $categoriaId);
        }

        $inscritos = $queryInscritos
            ->select('equipos.id', 'equipos.nombre', 'equipos.escudo', 'equipo_torneo.grupo_id')
            ->get();

        $tablasPorGrupo = [];
        foreach ($grupos as $grupo) {
            $tablasPorGrupo[$grupo->id] = [];
        }

        $sinGrupo = [];
        foreach ($inscritos as $equipo) {
            if ($equipo->grupo_id && isset($tablasPorGrupo[$equipo->grupo_id])) {
                $tablasPorGrupo[$equipo->grupo_id][$equipo->id] = $this->inicializarFila($equipo);
            } else {
                $sinGrupo[$equipo->id] = $this->inicializarFila($equipo);
            }
        }

        $queryPartidos = Partido::where('torneo_id', $torneo->id)
            ->where('estado', 'FINALIZADO')
            ->where('fase', 'GRUPOS');

        if ($categoriaId) {
            $queryPartidos->where('categoria_id', $categoriaId);
        }

        foreach ($queryPartidos->get() as $partido) {
            $grupoId = $partido->grupo_id;
            if ($grupoId && isset($tablasPorGrupo[$grupoId])) {
                $this->aplicarPartido($tablasPorGrupo[$grupoId], $partido);
            }
        }

        $resultado = [];
        foreach ($grupos as $grupo) {
            $filas = $this->ordenarTabla($tablasPorGrupo[$grupo->id] ?? []);
            // Si hay filtro de categoría y este grupo no tiene equipos en esa categoría, se omite
            if ($categoriaId && $filas->isEmpty()) {
                continue;
            }

            $resultado[] = [
                'grupo_id' => $grupo->id,
                'nombre'   => $grupo->nombre,
                'tabla'    => $filas,
            ];
        }

        if (! empty($sinGrupo)) {
            $resultado[] = [
                'grupo_id' => null,
                'nombre'   => 'Sin grupo asignado',
                'tabla'    => $this->ordenarTabla($sinGrupo),
            ];
        }

        return $resultado;
    }

    private function inicializarFila(object $equipo): array
    {
        return [
            'equipo_id' => $equipo->id,
            'nombre'    => $equipo->nombre,
            'escudo'    => $equipo->escudo,
            'pj'        => 0,
            'pg'        => 0,
            'pe'        => 0,
            'pp'        => 0,
            'gf'        => 0,
            'gc'        => 0,
            'dg'        => 0,
            'pts'       => 0,
        ];
    }

    private function aplicarPartido(array &$tabla, Partido $partido): void
    {
        $localId = $partido->equipo_local_id;
        $visitanteId = $partido->equipo_visitante_id;
        $golesLocal = (int) $partido->goles_local;
        $golesVisitante = (int) $partido->goles_visitante;

        if (isset($tabla[$localId])) {
            $tabla[$localId]['pj'] += 1;
            $tabla[$localId]['gf'] += $golesLocal;
            $tabla[$localId]['gc'] += $golesVisitante;

            if ($golesLocal > $golesVisitante) {
                $tabla[$localId]['pg'] += 1;
                $tabla[$localId]['pts'] += 3;
            } elseif ($golesLocal === $golesVisitante) {
                $tabla[$localId]['pe'] += 1;
                $tabla[$localId]['pts'] += 1;
            } else {
                $tabla[$localId]['pp'] += 1;
            }
        }

        if (isset($tabla[$visitanteId])) {
            $tabla[$visitanteId]['pj'] += 1;
            $tabla[$visitanteId]['gf'] += $golesVisitante;
            $tabla[$visitanteId]['gc'] += $golesLocal;

            if ($golesVisitante > $golesLocal) {
                $tabla[$visitanteId]['pg'] += 1;
                $tabla[$visitanteId]['pts'] += 3;
            } elseif ($golesVisitante === $golesLocal) {
                $tabla[$visitanteId]['pe'] += 1;
                $tabla[$visitanteId]['pts'] += 1;
            } else {
                $tabla[$visitanteId]['pp'] += 1;
            }
        }
    }

    private function ordenarTabla(array $tabla): Collection
    {
        return collect($tabla)
            ->map(function ($row) {
                $row['dg'] = $row['gf'] - $row['gc'];
                return $row;
            })
            ->sort(function ($a, $b) {
                if ($a['pts'] !== $b['pts']) {
                    return $b['pts'] <=> $a['pts'];
                }
                if ($a['dg'] !== $b['dg']) {
                    return $b['dg'] <=> $a['dg'];
                }
                if ($a['gf'] !== $b['gf']) {
                    return $b['gf'] <=> $a['gf'];
                }
                return strcmp($a['nombre'], $b['nombre']);
            })
            ->values();
    }
}
