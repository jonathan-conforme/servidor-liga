<?php

namespace App\Services\Tenant;

use App\Models\Tenant\EventoPartido;
use App\Models\Tenant\Partido;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class EventoPartidoService
{
    /**
     * Carga las relaciones necesarias para el panel en vivo.
     */
    public function cargarDatosPartido(Partido $partido): Partido
    {
        return $partido->load([
            'torneo',
            'jornada',
            'equipoLocal',
            'equipoVisitante',
            'eventos.jugador',
            'eventos.jugadorIngresa',
            'eventos.equipo',
        ]);
    }

    /**
     * Consulta los jugadores inscritos en el torneo para un equipo específico.
     */
    public function obtenerJugadoresInscritos(int $torneoId, int $equipoId): Collection
    {
        return DB::table('equipo_torneo_jugador')
            ->join('equipo_torneo', 'equipo_torneo_jugador.equipo_torneo_id', '=', 'equipo_torneo.id')
            ->join('jugadores', 'equipo_torneo_jugador.jugador_id', '=', 'jugadores.id')
            ->where('equipo_torneo.torneo_id', $torneoId)
            ->where('equipo_torneo.equipo_id', $equipoId)
            ->select(
                'jugadores.id',
                DB::raw("TRIM(CONCAT(COALESCE(jugadores.nombres, ''), ' ', COALESCE(jugadores.apellidos, ''))) as name"),
                'equipo_torneo_jugador.numero_camiseta as numero'
            )
            ->get();
    }

    /**
     * Registra un evento de partido y actualiza el marcador/estado dentro de una transacción.
     */
    public function registrarEvento(Partido $partido, array $datos): EventoPartido
    {
        return DB::transaction(function () use ($partido, $datos) {
            // Asigna tenant_id si el modelo lo requiere
            if (auth()->check() && auth()->user()->tenant_id) {
                $datos['tenant_id'] = auth()->user()->tenant_id;
            }

            $evento = $partido->eventos()->create($datos);
            $this->recalcularPartido($partido, $datos['tipo']);

            return $evento;
        });
    }

    /**
     * Elimina un evento y recalcula el marcador del partido.
     */
    public function eliminarEvento(Partido $partido, EventoPartido $evento): void
    {
        if ($partido->estado === 'FINALIZADO') {
            abort(403, 'No se pueden eliminar eventos de un partido que ya ha sido finalizado.');
        }

        DB::transaction(function () use ($partido, $evento) {
            $tipoEliminado = $evento->tipo;
            $evento->delete();
            $this->recalcularPartido($partido, $tipoEliminado);
        });
    }

    /**
     * Lógica de dominio para recalcular marcadores y cambiar estados.
     */
    public function recalcularPartido(Partido $partido, string $ultimoTipo): void
    {
        if ($ultimoTipo === 'INICIO') {
            $partido->estado = 'EN_JUEGO';
        } elseif ($ultimoTipo === 'ENTRETIEMPO') {
            $partido->estado = 'ENTRETIEMPO';
        } elseif ($ultimoTipo === 'FIN') {
            $partido->estado = 'FINALIZADO';
        }

        $golesLocal = 0;
        $golesVisitante = 0;

        $eventosGoles = $partido->eventos()->whereIn('tipo', ['GOL', 'AUTOGOL'])->get();

        foreach ($eventosGoles as $ev) {
            if ($ev->tipo === 'GOL') {
                if ($ev->equipo_id == $partido->equipo_local_id) {
                    $golesLocal++;
                }
                if ($ev->equipo_id == $partido->equipo_visitante_id) {
                    $golesVisitante++;
                }
            } elseif ($ev->tipo === 'AUTOGOL') {
                if ($ev->equipo_id == $partido->equipo_local_id) {
                    $golesVisitante++;
                }
                if ($ev->equipo_id == $partido->equipo_visitante_id) {
                    $golesLocal++;
                }
            }
        }

        $partido->goles_local = $golesLocal;
        $partido->goles_visitante = $golesVisitante;
        $partido->save();
    }
}
