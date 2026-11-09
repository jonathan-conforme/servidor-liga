<?php

namespace App\Services\Tenant;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class GoleadorService
{
    /**
     * Obtiene el ranking de goleadores para un torneo específico.
     */
    public function obtenerGoleadores(int $torneoId): Collection
    {
        return DB::table('eventos_partido')
            ->join('partidos', 'eventos_partido.partido_id', '=', 'partidos.id')
            ->join('jugadores', 'eventos_partido.jugador_id', '=', 'jugadores.id')
            ->leftJoin('equipos', 'eventos_partido.equipo_id', '=', 'equipos.id')
            ->where('partidos.torneo_id', $torneoId)
            ->where('eventos_partido.tipo', 'GOL')
            ->select(
                'jugadores.id as jugador_id',
                DB::raw("TRIM(CONCAT(COALESCE(jugadores.nombres, ''), ' ', COALESCE(jugadores.apellidos, ''))) as jugador_nombre"),
                'equipos.id as equipo_id',
                'equipos.nombre as equipo_nombre',
                'equipos.escudo as equipo_escudo',
                DB::raw('COUNT(eventos_partido.id) as total_goles')
            )
            ->groupBy(
                'jugadores.id',
                'jugadores.nombres',
                'jugadores.apellidos',
                'equipos.id',
                'equipos.nombre',
                'equipos.escudo'
            )
            ->orderByDesc('total_goles')
            ->orderBy('jugadores.nombres')
            ->get();
    }
}