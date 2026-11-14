<?php

namespace App\Services\Tenant;

use App\Models\Tenant\EquipoTorneo;
use App\Models\Tenant\Jornada;
use App\Models\Tenant\Partido;
use App\Models\Tenant\Torneo;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FixtureService
{
    public function estadoFixture(int $torneoId): array
    {
        $existe = Partido::where('torneo_id', $torneoId)->exists();

        $bloqueado = Partido::where('torneo_id', $torneoId)
            ->where(function ($q) {
                $q->where('estado', '!=', 'PROGRAMADO')
                  ->orWhereNotNull('goles_local')
                  ->orWhereNotNull('goles_visitante');
            })->exists();

        return ['existe' => $existe, 'bloqueado' => $bloqueado];
    }

    public function generarFixture(int $torneoId, bool $regenerar = false): int
    {
        return DB::transaction(function () use ($torneoId, $regenerar) {
            $torneo = Torneo::lockForUpdate()->findOrFail($torneoId);
            $estado = $this->estadoFixture($torneoId);

            if ($estado['bloqueado']) {
                throw ValidationException::withMessages([
                    'fixture' => 'No se puede regenerar: el torneo ya tiene partidos jugados o con marcador.',
                ]);
            }

            if ($estado['existe'] && ! $regenerar) {
                throw ValidationException::withMessages(['fixture' => 'El fixture ya fue generado para este torneo.']);
            }

            if ($torneo->tipo_competicion === 'ELIMINACION_DIRECTA') {
                throw ValidationException::withMessages([
                    'fixture' => 'La eliminación directa todavía no está soportada.',
                ]);
            }

            $esGrupos = $torneo->tipo_competicion === 'GRUPOS_ELIMINACION';
            $fase     = $esGrupos ? 'GRUPOS' : 'REGULAR';

            $porCategoria = EquipoTorneo::where('torneo_id', $torneoId)->get()->groupBy('categoria_id');

            if ($porCategoria->flatten()->count() < 2) {
                throw ValidationException::withMessages([
                    'fixture' => 'Se necesitan al menos 2 equipos inscritos para generar el fixture.',
                ]);
            }

            if ($esGrupos && $porCategoria->flatten()->contains(fn ($i) => ! $i->grupo_id)) {
                throw ValidationException::withMessages([
                    'fixture' => 'Hay equipos sin grupo. Sortea o asigna los grupos antes de generar el fixture.',
                ]);
            }

            Partido::where('torneo_id', $torneoId)->delete();
            Jornada::where('torneo_id', $torneoId)->delete();

            $total = 0;

            foreach ($porCategoria as $categoriaId => $inscripciones) {
                if ($inscripciones->count() < 2) {
                    continue;
                }

                $bloques  = $esGrupos ? $inscripciones->groupBy('grupo_id') : collect([0 => $inscripciones]);
                $porRonda = [];

                foreach ($bloques as $grupoId => $miembros) {
                    if ($miembros->count() < 2) {
                        throw ValidationException::withMessages([
                            'fixture' => 'Hay un grupo con menos de 2 equipos. Reparte los equipos de nuevo.',
                        ]);
                    }

                    $rondas = $this->calcularRoundRobin(
                        $miembros->pluck('equipo_id')->shuffle()->all(),
                        (bool) $torneo->ida_vuelta
                    );

                    foreach ($rondas as $numero => $partidos) {
                        foreach ($partidos as $p) {
                            $porRonda[$numero][] = $p + ['grupo_id' => $esGrupos ? $grupoId : null];
                        }
                    }
                }

                ksort($porRonda);

                foreach ($porRonda as $numero => $partidos) {
                    $jornada = Jornada::create([
                        'torneo_id'    => $torneoId,
                        'categoria_id' => $categoriaId,
                        'numero'       => $numero,
                        'nombre'       => "Jornada {$numero}",
                        'fase'         => $fase,
                        'estado'       => 'PROGRAMADA',
                    ]);

                    foreach ($partidos as $p) {
                        Partido::create([
                            'torneo_id'           => $torneoId,
                            'jornada_id'          => $jornada->id,
                            'categoria_id'        => $categoriaId,
                            'grupo_id'            => $p['grupo_id'],
                            'fase'                => $fase,
                            'equipo_local_id'     => $p['local'],
                            'equipo_visitante_id' => $p['visitante'],
                            'estado'              => 'PROGRAMADO',
                        ]);
                        $total++;
                    }
                }
            }

            $torneo->update(['estado' => 'EN_CURSO']);

            return $total;
        });
    }

    /** Devuelve [numeroRonda => [['local'=>id,'visitante'=>id], ...]] empezando en 1. */
    private function calcularRoundRobin(array $equipos, bool $idaYVuelta): array
    {
        if (count($equipos) % 2 !== 0) {
            $equipos[] = null;
        }

        $n = count($equipos);
        $rondasIda = [];

        for ($r = 0; $r < $n - 1; $r++) {
            $partidos = [];

            for ($i = 0; $i < $n / 2; $i++) {
                $a = $equipos[$i];
                $b = $equipos[$n - 1 - $i];

                if ($a === null || $b === null) {
                    continue;
                }

                $partidos[] = $r % 2 === 1
                    ? ['local' => $b, 'visitante' => $a]
                    : ['local' => $a, 'visitante' => $b];
            }

            $rondasIda[$r + 1] = $partidos;

            $ultimo = array_pop($equipos);
            array_splice($equipos, 1, 0, [$ultimo]);
        }

        if (! $idaYVuelta) {
            return $rondasIda;
        }

        $todas  = $rondasIda;
        $numero = count($rondasIda);

        foreach ($rondasIda as $partidos) {
            $numero++;
            $todas[$numero] = array_map(
                fn ($p) => ['local' => $p['visitante'], 'visitante' => $p['local']],
                $partidos
            );
        }

        return $todas;
    }
}