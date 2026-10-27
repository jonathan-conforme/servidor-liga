<?php

namespace App\Services\Tenant;

use App\Models\Tenant\Torneo;
use App\Models\Tenant\EquipoTorneo;
use App\Models\Tenant\Jornada;
use App\Models\Tenant\Partido;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FixtureService
{
    public function generarFixture(int $torneoId): int
    {
        return DB::transaction(function () use ($torneoId) {
            $torneo = Torneo::findOrFail($torneoId);

            // Obtener IDs de equipos inscritos
            $equiposIds = EquipoTorneo::where('torneo_id', $torneoId)
                ->pluck('equipo_id')
                ->toArray();

            if (count($equiposIds) < 2) {
                throw ValidationException::withMessages([
                    'fixture' => 'Se necesitan al menos 2 equipos inscritos para generar el fixture.',
                ]);
            }

            // Limpiar partidos y jornadas previas si se regenera
            Partido::where('torneo_id', $torneoId)->delete();
            Jornada::where('torneo_id', $torneoId)->delete();

            // Mezclar aleatoriamente para el sorteo
            shuffle($equiposIds);

            // Calcular cruces con Algoritmo de Berger / Round Robin
            $fechasGeneradas = $this->calcularRoundRobin($equiposIds, $torneo->ida_vuelta ?? false);
            $totalPartidos = 0;

            foreach ($fechasGeneradas as $numeroFecha => $partidosDeLaFecha) {
                // 1. Crear la Jornada
                $jornada = Jornada::create([
                    'torneo_id' => $torneoId,
                    'numero'    => $numeroFecha,
                    'nombre'    => "Jornada {$numeroFecha}",
                    'estado'    => 'PROGRAMADA',
                ]);

                // 2. Crear los Partidos asociados a esa Jornada
                foreach ($partidosDeLaFecha as $p) {
                    Partido::create([
                        'torneo_id'           => $torneoId,
                        'jornada_id'          => $jornada->id,
                        'equipo_local_id'     => $p['local'],
                        'equipo_visitante_id' => $p['visitante'],
                        'estado'              => 'PROGRAMADO',
                    ]);
                    $totalPartidos++;
                }
            }

            $torneo->update(['estado' => 'EN_CURSO']);

            return $totalPartidos;
        });
    }

    private function calcularRoundRobin(array $equipos, bool $idaYVuelta = false): array
    {
        if (count($equipos) % 2 !== 0) {
            $equipos[] = null; // Equipo 'null' representa descanso
        }

        $totalEquipos = count($equipos);
        $totalRondas = $totalEquipos - 1;
        $partidosPorRonda = $totalEquipos / 2;

        $fechasIda = [];

        for ($ronda = 0; $ronda < $totalRondas; $ronda++) {
            $partidosRonda = [];

            for ($i = 0; $i < $partidosPorRonda; $i++) {
                $local = $equipos[$i];
                $visitante = $equipos[$totalEquipos - 1 - $i];

                if ($local !== null && $visitante !== null) {
                    if ($ronda % 2 === 1) {
                        $partidosRonda[] = ['local' => $visitante, 'visitante' => $local];
                    } else {
                        $partidosRonda[] = ['local' => $local, 'visitante' => $visitante];
                    }
                }
            }

            $fechasIda[$ronda + 1] = $partidosRonda;

            $ultimo = array_pop($equipos);
            array_splice($equipos, 1, 0, [$ultimo]);
        }

        if (!$idaYVuelta) {
            return $fechasIda;
        }

        $fechasVuelta = [];
        $numeroFechaActual = $totalRondas + 1;

        foreach ($fechasIda as $partidosVuelta1) {
            $partidosInvertidos = [];
            foreach ($partidosVuelta1 as $partido) {
                $partidosInvertidos[] = [
                    'local'     => $partido['visitante'],
                    'visitante' => $partido['local'],
                ];
            }
            $fechasVuelta[$numeroFechaActual] = $partidosInvertidos;
            $numeroFechaActual++;
        }

        return $fechasIda + $fechasVuelta;
    }
}
