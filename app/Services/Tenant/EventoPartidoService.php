<?php

namespace App\Services\Tenant;

use App\Models\Tenant\EventoPartido;
use App\Models\Tenant\Partido;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
        // [PENALES - IMPLEMENTADO] Bloquea el registro si el acta ya está cerrada definitivamente
        if ($partido->estado === 'FINALIZADO') {
            abort(403, 'El partido ya está finalizado y no admite más eventos.');
        }

        return DB::transaction(function () use ($partido, $datos) {
            // Asigna tenant_id si el modelo lo requiere
            if (auth()->check() && auth()->user()->tenant_id) {
                $datos['tenant_id'] = auth()->user()->tenant_id;
            }

            // [PENALES - IMPLEMENTADO] Los eventos de tanda de penales no llevan minuto reglamentario
            if (in_array($datos['tipo'], ['PENAL_ANOTADO', 'PENAL_FALLADO', 'FIN_PENALES'], true)) {
                $datos['minuto'] = null;
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

            $this->recalcularPartido($partido, $tipoEliminado, true);
        });
    }

    /**
     * Lógica de dominio para recalcular marcadores y cambiar estados.
     */
    public function recalcularPartido(Partido $partido, string $ultimoTipo, bool $fueEliminacion = false): void
    {
        // [PENALES - IMPLEMENTADO] Movemos el cálculo de goles antes del cambio de estado para evaluar empates al recibir 'FIN'
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

        // [PENALES - IMPLEMENTADO] Recalcula el marcador de la tanda de penales si está en curso o tiene cobros registrados
        $eventosPenales = $partido->eventos()->whereIn('tipo', ['PENAL_ANOTADO', 'PENAL_FALLADO'])->get();
        if ($partido->estado === 'EN_PENALES' || $eventosPenales->isNotEmpty()) {
            $partido->penales_local = $eventosPenales
                ->where('tipo', 'PENAL_ANOTADO')
                ->where('equipo_id', $partido->equipo_local_id)
                ->count();

            $partido->penales_visitante = $eventosPenales
                ->where('tipo', 'PENAL_ANOTADO')
                ->where('equipo_id', $partido->equipo_visitante_id)
                ->count();
        }

        // [PENALES - MODIFICADO] Transiciones de estado (contemplando eliminación de eventos, empate global y cierre de penales)
        if ($fueEliminacion) {
            // Si se elimina el evento FIN estando en penales, regresa el partido a EN_JUEGO y limpia penales
            if ($ultimoTipo === 'FIN' && $partido->estado === 'EN_PENALES') {
                $partido->estado = 'EN_JUEGO';
                $partido->penales_local = null;
                $partido->penales_visitante = null;
            }
        } else {
            if ($ultimoTipo === 'INICIO') {
                $partido->estado = 'EN_JUEGO';
            } elseif ($ultimoTipo === 'ENTRETIEMPO') {
                $partido->estado = 'ENTRETIEMPO';
            } elseif ($ultimoTipo === 'FIN') {
                // [PENALES - IMPLEMENTADO] Verifica si es cierre de llave eliminatoria empatada antes de finalizar
                if ($this->debeIrAPenales($partido, $golesLocal, $golesVisitante)) {
                    $partido->estado = 'EN_PENALES';
                    $partido->penales_local = $partido->penales_local ?? 0;
                    $partido->penales_visitante = $partido->penales_visitante ?? 0;
                } else {
                    $partido->estado = 'FINALIZADO';
                }
            } elseif ($ultimoTipo === 'FIN_PENALES') {
                // [PENALES - IMPLEMENTADO] Cierra el acta solo si existe un ganador en la tanda
                if ($partido->penales_local === $partido->penales_visitante) {
                    throw ValidationException::withMessages([
                        'penales' => 'La tanda de penales está empatada. Debe haber un ganador antes de finalizar.',
                    ]);
                }
                $partido->estado = 'FINALIZADO';
            }
        }

        $partido->save();
        // [PENALES - IMPLEMENTADO] Marca la jornada como FINALIZADA automáticamente cuando todos sus partidos terminan
        if ($partido->estado === 'FINALIZADO' && $partido->jornada_id) {
            $quedanPendientes = Partido::where('jornada_id', $partido->jornada_id)
                ->where('estado', '!=', 'FINALIZADO')
                ->exists();

            if (! $quedanPendientes) {
                $partido->jornada()->update(['estado' => 'FINALIZADA']);
            }
        }
    }

    /**
     * [PENALES - IMPLEMENTADO] Evalúa si el partido corresponde al cierre de una llave de Play-Off empatada en el global.
     */
    private function debeIrAPenales(Partido $partido, int $golesLocalActual, int $golesVisitanteActual): bool
    {
        // Solo aplica en fases eliminatorias (OCTAVOS, CUARTOS, SEMIFINAL, FINAL)
        if (! in_array($partido->fase, PlayoffService::FASES_PLAYOFF, true)) {
            return false;
        }

        $partido->loadMissing('torneo');

        // Obtiene los partidos de la misma llave (Ida y Vuelta, o partido único) ordenados por creación
        $encuentros = Partido::where('torneo_id', $partido->torneo_id)
            ->where('fase', $partido->fase)
            ->when($partido->categoria_id, fn ($q) => $q->where('categoria_id', $partido->categoria_id))
            ->when(
                $partido->llave,
                fn ($q) => $q->where('llave', $partido->llave),
                fn ($q) => $q->where('id', $partido->id)
            )
            ->orderBy('id')
            ->get();

        // Solo el partido decisivo (la Vuelta o el partido único) puede ir a penales; la Ida nunca va a penales
        $ultimoEncuentro = $encuentros->last();
        if (! $ultimoEncuentro || $ultimoEncuentro->id !== $partido->id) {
            return false;
        }

        $primero = $encuentros->first();
        $eqA = $primero->equipo_local_id;
        $golesA = 0;
        $golesB = 0;
        $visitaA = 0;
        $visitaB = 0;

        // Suma el marcador global de la llave usando los goles recién recalculados del partido actual
        foreach ($encuentros as $enc) {
            $gl = $enc->id === $partido->id ? $golesLocalActual : (int) $enc->goles_local;
            $gv = $enc->id === $partido->id ? $golesVisitanteActual : (int) $enc->goles_visitante;

            if ($enc->equipo_local_id === $eqA) {
                $golesA += $gl;
                $golesB += $gv;
                $visitaB += $gv;
            } else {
                $golesB += $gl;
                $golesA += $gv;
                $visitaA += $gv;
            }
        }

        // Si hay ganador en el marcador global, no hay penales
        if ($golesA !== $golesB) {
            return false;
        }

        // Si el torneo tiene activado el criterio de gol de visitante y desempata la serie, tampoco va a penales
        if ($partido->torneo?->gol_visitante && $encuentros->count() > 1 && $visitaA !== $visitaB) {
            return false;
        }

        return true;
    }
}
