<?php

namespace App\Services\Tenant;

use App\Models\Tenant\EquipoTorneo;
use App\Models\Tenant\Partido;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TablaPosicionesService
{
    /**
     * Calcula la tabla de posiciones de un torneo específico.
     */
    public function calcularTabla(int $torneoId, ?int $categoriaId = null): Collection
    {
        // 1. Obtener equipos inscritos en el torneo (y categoría opcional)
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

        // 2. Inicializar acumuladores para cada equipo registrado
        $tabla = [];
        foreach ($equiposInscritos as $equipo) {
            $tabla[$equipo->id] = [
                'equipo_id' => $equipo->id,
                'nombre'    => $equipo->nombre,
                'escudo'    => $equipo->escudo,
                'pj'        => 0, // Partidos Jugados
                'pg'        => 0, // Ganados
                'pe'        => 0, // Empatados
                'pp'        => 0, // Perdidos
                'gf'        => 0, // Goles a Favor
                'gc'        => 0, // Goles en Contra
                'dg'        => 0, // Diferencia de Goles
                'pts'       => 0, // Puntos
            ];
        }

        // 3. Consultar únicamente partidos finalizados
        $queryPartidos = Partido::where('torneo_id', $torneoId)
            ->where('estado', 'FINALIZADO');

        $partidosFinalizados = $queryPartidos->get();

        // 4. Acumular estadísticas partido a partido
        foreach ($partidosFinalizados as $partido) {
            $localId = $partido->equipo_local_id;
            $visitanteId = $partido->equipo_visitante_id;
            $golesLocal = (int) $partido->goles_local;
            $golesVisitante = (int) $partido->goles_visitante;

            // Procesar equipo local si está en el listado
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

            // Procesar equipo visitante si está en el listado
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

        // 5. Calcular Diferencia de Goles y ordenar por criterios oficiales
        $coleccion = collect($tabla)->map(function ($row) {
            $row['dg'] = $row['gf'] - $row['gc'];
            return $row;
        });

        // Criterios de ordenación: 1. Puntos, 2. Diferencia de Goles, 3. Goles a Favor, 4. Nombre
        return $coleccion->sort(function ($a, $b) {
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
        })->values();
    }
}