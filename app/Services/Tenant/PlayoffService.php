<?php

namespace App\Services\Tenant;

use App\Models\Tenant\Equipo;
use App\Models\Tenant\Jornada;
use App\Models\Tenant\Partido;
use App\Models\Tenant\Torneo;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PlayoffService
{
    public const FASES_PLAYOFF = ['OCTAVOS', 'CUARTOS', 'SEMIFINAL', 'FINAL'];

    public function __construct(
        protected TablaPosicionesService $tablaService
    ) {}

    /**
     * Evalúa el estado de los Play-offs y prepara los cruces sugeridos para el modal híbrido.
     */
    public function estadoPlayoffs(Torneo $torneo, ?int $categoriaId = null): array
    {
        if ($torneo->tipo_competicion !== 'GRUPOS_ELIMINACION') {
            return ['aplica' => false];
        }

        $queryGrupos = Partido::where('torneo_id',$torneo->id)->where('fase', 'GRUPOS');
        if ($categoriaId) {
            $queryGrupos->where('categoria_id',$categoriaId);
        }

        $totalGrupos = (clone$queryGrupos)->count();
        if ($totalGrupos === 0) {
            return [
                'aplica'       => true,
                'puede_generar'=> false,
                'motivo'       => 'Aún no se ha generado el fixture de grupos.',
            ];
        }

        $pendientesGrupos = (clone$queryGrupos)->where('estado', '!=', 'FINALIZADO')->count();
        if ($pendientesGrupos > 0) {
            return [
                'aplica'        => true,
                'puede_generar' => false,
                'motivo'        => "Faltan {$pendientesGrupos} partido(s) de fase de grupos por finalizar.",
            ];
        }

        // Equipos elegibles en el torneo/categoría para los selectores manuales
        $equiposDisponibles = Equipo::whereIn('id', function ($q) use ($torneo, $categoriaId) {$q->select('equipo_id')
                ->from('equipo_torneo')
                ->where('torneo_id', $torneo->id);
            if ($categoriaId) {
                $q->where('categoria_id',$categoriaId);
            }
        })
            ->orderBy('nombre')
            ->get(['id', 'nombre']);

        // Buscar partidos eliminatorios ya existentes
        $queryPlayoff = Partido::with(['equipoLocal', 'equipoVisitante'])
            ->where('torneo_id', $torneo->id)
            ->whereIn('fase', self::FASES_PLAYOFF);

        if ($categoriaId) {
            $queryPlayoff->where('categoria_id',$categoriaId);
        }

        $partidosPlayoff =$queryPlayoff->get();

        // Caso 1: Aún no hay ninguna fase de Play-off -> venimos directo de GRUPOS
        if ($partidosPlayoff->isEmpty()) {
            $clasificacion =$this->tablaService->obtenerClasificacion($torneo,$categoriaId);
            $grupos =$clasificacion['grupos'] ?? [];
            $porGrupo = (int)$torneo->clasificados_por_grupo;
            $totalClasificados = count($grupos) *$porGrupo;
            $faseSiguiente = $this->fasePorCantidadEquipos($totalClasificados);

            if (! $faseSiguiente) {
                return [
                    'aplica'        => true,
                    'puede_generar' => false,
                    'motivo'        => "La cantidad de clasificados ({$totalClasificados}) no forma una llave válida (2, 4, 8 o 16).",
                ];
            }

            [$llavesSugeridas, $alertasEmpate] =$this->construirLlavesDesdeGrupos($grupos,$porGrupo);
            $esIdaVuelta =$faseSiguiente === 'FINAL'
                ? (bool) $torneo->final_ida_vuelta
                : (bool) $torneo->ida_vuelta;

            return [
                'aplica'              => true,
                'puede_generar'       => true,
                'puede_deshacer'      => false,
                'fase_siguiente'      => $faseSiguiente,
                'fase_label'          => $this->etiquetaFase($faseSiguiente),
                'es_ida_vuelta'       => $esIdaVuelta,
                'llaves_sugeridas'    => $llavesSugeridas,
                'alertas'             => $alertasEmpate,
                'equipos_disponibles' => $equiposDisponibles,
            ];
        }

        // Caso 2: Ya existen fases eliminatorias -> determinar la más avanzada
        $faseActual = collect(self::FASES_PLAYOFF)
            ->reverse()
            ->first(fn ($f) => $partidosPlayoff->contains('fase',$f));

        $partidosFaseActual = $partidosPlayoff->where('fase',$faseActual);
        $pendientesFase =$partidosFaseActual->where('estado', '!=', 'FINALIZADO')->count();

        $puedeDeshacer =$partidosFaseActual->every(
            fn ($p) =>$p->estado === 'PROGRAMADO' && $p->goles_local === null &&$p->goles_visitante === null
        );

        if ($pendientesFase > 0) {
            return [
                'aplica'         => true,
                'puede_generar'  => false,
                'puede_deshacer' => $puedeDeshacer,
                'fase_actual'    => $faseActual,
                'fase_label'     => $this->etiquetaFase($faseActual),
                'motivo'         => "En curso: {$this->etiquetaFase($faseActual)} ({$pendientesFase} partido(s) pendiente(s)).",
            ];
        }

        // La fase actual ya terminó
        if ($faseActual === 'FINAL') {
            return [
                'aplica'         => true,
                'puede_generar'  => false,
                'puede_deshacer' => false,
                'finalizado'     => true,
                'motivo'         => 'Play-offs finalizados.',
            ];
        }

        $faseSiguiente = $this->siguienteFase($faseActual);
        [$llavesSugeridas, $alertas] =$this->construirLlavesDesdeRondaAnterior($torneo,$partidosFaseActual);
        $esIdaVuelta =$faseSiguiente === 'FINAL'
            ? (bool) $torneo->final_ida_vuelta
            : (bool) $torneo->ida_vuelta;

        return [
            'aplica'              => true,
            'puede_generar'       => true,
            'puede_deshacer'      => false,
            'fase_siguiente'      => $faseSiguiente,
            'fase_label'          => $this->etiquetaFase($faseSiguiente),
            'es_ida_vuelta'       => $esIdaVuelta,
            'llaves_sugeridas'    => $llavesSugeridas,
            'alertas'             => $alertas,
            'equipos_disponibles' => $equiposDisponibles,
        ];
    }

    /**
     * Crea las jornadas y partidos de la fase eliminatoria según la configuración confirmada en el modal.
     */
    public function generarRonda(int $torneoId, string$fase, array $llaves, ?int $categoriaId = null): int
    {
        if (! in_array($fase, self::FASES_PLAYOFF, true)) {
            throw ValidationException::withMessages(['playoffs' => 'Fase eliminatoria no válida.']);
        }

        return DB::transaction(function () use ($torneoId,$fase, $llaves,$categoriaId) {
            $torneo = Torneo::lockForUpdate()->findOrFail($torneoId);

            // Evitar duplicar la misma fase en la misma categoría
            $yaExiste = Partido::where('torneo_id',$torneoId)
                ->where('fase', $fase)
                ->when($categoriaId, fn ($q) => $q->where('categoria_id',$categoriaId))
                ->exists();

            if ($yaExiste) {
                throw ValidationException::withMessages([
                    'playoffs' => "La fase {$this->etiquetaFase($fase)} ya fue generada.",
                ]);
            }

            // Validar que no haya equipos repetidos ni enfrentándose contra sí mismos
            $equiposUsados = [];
            foreach ($llaves as $idx =>$llave) {
                $local = (int) ($llave['equipo_local_id'] ?? 0);
                $visitante = (int) ($llave['equipo_visitante_id'] ?? 0);
                $numLlave =$idx + 1;

                if (! $local || !$visitante) {
                    throw ValidationException::withMessages([
                        'playoffs' => "Debes seleccionar ambos equipos en la Llave {$numLlave}.",
                    ]);
                }

                if ($local ===$visitante) {
                    throw ValidationException::withMessages([
                        'playoffs' => "Un equipo no puede enfrentarse a sí mismo (Llave {$numLlave}).",
                    ]);
                }

                if (in_array($local,$equiposUsados, true) || in_array($visitante,$equiposUsados, true)) {
                    throw ValidationException::withMessages([
                        'playoffs' => 'Un mismo equipo no puede estar asignado en dos llaves a la vez.',
                    ]);
                }

                $equiposUsados[] =$local;
                $equiposUsados[] =$visitante;
            }

            $esIdaVuelta =$fase === 'FINAL'
                ? (bool) $torneo->final_ida_vuelta
                : (bool) $torneo->ida_vuelta;

            $ultimoNumero = (int) Jornada::where('torneo_id',$torneoId)
                ->when($categoriaId, fn ($q) => $q->where('categoria_id',$categoriaId))
                ->max('numero');

            $etiqueta = $this->etiquetaFase($fase);

            $jornadaIda = Jornada::create([
                'torneo_id'    => $torneoId,
                'categoria_id' => $categoriaId,
                'numero'       => $ultimoNumero + 1, 'fase'         =>$fase,
                'nombre'       => $esIdaVuelta ? "{$etiqueta} - Ida" : $etiqueta,
                'estado'       => 'PROGRAMADA',
            ]);

            $jornadaVuelta =$esIdaVuelta
                ? Jornada::create([
                    'torneo_id'    => $torneoId,
                    'categoria_id' => $categoriaId,
                    'numero'       => $ultimoNumero + 2, 'fase'         =>$fase,
                    'nombre'       => "{$etiqueta} - Vuelta",
                    'estado'       => 'PROGRAMADA',
                ])
                : null;

            $total = 0;
            foreach ($llaves as $idx =>$llave) {
                $numLlave =$idx + 1;
                $local = (int)$llave['equipo_local_id'];
                $visitante = (int)$llave['equipo_visitante_id'];

                Partido::create([
                    'torneo_id'           => $torneoId,
                    'jornada_id'          => $jornadaIda->id,
                    'categoria_id'        => $categoriaId,
                    'grupo_id'            => null,
                    'fase'                => $fase,
                    'llave'               => $numLlave,
                    'equipo_local_id'     => $local,
                    'equipo_visitante_id' => $visitante,
                    'estado'              => 'PROGRAMADO',
                ]);
                $total++;

                if ($jornadaVuelta) {
                    Partido::create([
                        'torneo_id'           => $torneoId,
                        'jornada_id'          => $jornadaVuelta->id,
                        'categoria_id'        => $categoriaId,
                        'grupo_id'            => null,
                        'fase'                => $fase,
                        'llave'               => $numLlave,
                        'equipo_local_id'     => $visitante,
                        'equipo_visitante_id' => $local,
                        'estado'              => 'PROGRAMADO',
                    ]);
                    $total++;
                }
            }

            $torneo->update(['estado' => 'EN_CURSO']);

            return $total;
        });
    }

    /**
     * Elimina la última fase de Play-offs si aún no tiene ningún partido iniciado o con marcador.
     */
    public function deshacerUltimaRonda(int $torneoId, ?int $categoriaId = null): void
    {
        DB::transaction(function () use ($torneoId,$categoriaId) {
            $query = Partido::where('torneo_id',$torneoId)
                ->whereIn('fase', self::FASES_PLAYOFF)
                ->when($categoriaId, fn ($q) => $q->where('categoria_id',$categoriaId));

            $partidos =$query->get();
            if ($partidos->isEmpty()) {
                return;
            }

            $faseActual = collect(self::FASES_PLAYOFF)
                ->reverse()
                ->first(fn ($f) => $partidos->contains('fase',$f));

            $deFase = $partidos->where('fase',$faseActual);
            $hayJugados =$deFase->contains(
                fn ($p) =>$p->estado !== 'PROGRAMADO' || $p->goles_local !== null || $p->goles_visitante !== null
            );

            if ($hayJugados) {
                throw ValidationException::withMessages([
                    'playoffs' => 'No se puede deshacer: esta fase ya tiene partidos iniciados o con marcador.',
                ]);
            }

            $jornadaIds =$deFase->pluck('jornada_id')->unique();
            Partido::whereIn('id', $deFase->pluck('id'))->delete();
            Jornada::whereIn('id', $jornadaIds)->delete();
        });
    }

    /**
     * Cruza los clasificados de la fase de grupos y detecta empates en puntos/goles.
     */
    private function construirLlavesDesdeGrupos(array $grupos, int$porGrupo): array
    {
        $alertas = [];

        foreach ($grupos as$g) {
            $tabla = collect($g['tabla'] ?? [])->values();

            // Detectar empate en el límite de clasificación (ej: 4° vs 5° puesto)
            if ($tabla->count() >$porGrupo) {
                $ultimoClasificado =$tabla[$porGrupo - 1];$primerEliminado = $tabla[$porGrupo];

                if (
                    $ultimoClasificado['pts'] ===$primerEliminado['pts'] &&
                    $ultimoClasificado['dg'] ===$primerEliminado['dg'] &&
                    $ultimoClasificado['gf'] ===$primerEliminado['gf']
                ) {
                    $alertas[] = "{$g['nombre']}: empate exacto en el puesto #{$porGrupo} entre {$ultimoClasificado['nombre']} y {$primerEliminado['nombre']}. Verifica el clasificado.";
                }
            }

            // Detectar empate entre posiciones internas que afectan los cruces (ej: 1° vs 2°)
            for ($i = 0; $i < min($porGrupo - 1, $tabla->count() - 1);$i++) {
                $a =$tabla[$i];$b = $tabla[$i + 1];
                if ($a['pts'] ===$b['pts'] && $a['dg'] ===$b['dg'] && $a['gf'] ===$b['gf']) {
                    $pos1 =$i + 1;
                    $pos2 =$i + 2;
                    $alertas[] = "{$g['nombre']}: {$a['nombre']} (#{$pos1}) y {$b['nombre']} (#{$pos2}) empatan en puntos y goles.";
                }
            }
        }

        // Armado de cruces cruzados (evitando duelos del mismo grupo y separando líderes)
        $llaves = [];
        $numGrupos = count($grupos);

        if ($numGrupos === 2) {
            $tA = collect($grupos[0]['tabla'] ?? [])->values();
            $tB = collect($grupos[1]['tabla'] ?? [])->values();
            $nA =$grupos[0]['nombre'];
            $nB =$grupos[1]['nombre'];

            if ($porGrupo === 4) {
                // Orden del bracket: Llave 1 vs Llave 2 en Semifinal 1; Llave 3 vs Llave 4 en Semifinal 2$parejas = [
                $parejas = [
                    [$tA[0] ?? null, "1° {$nA}", $tB[3] ?? null, "4° {$nB}"],
                    [$tB[1] ?? null, "2° {$nB}", $tA[2] ?? null, "3° {$nA}"],
                    [$tB[0] ?? null, "1° {$nB}", $tA[3] ?? null, "4° {$nA}"],
                    [$tA[1] ?? null, "2° {$nA}", $tB[2] ?? null, "3° {$nB}"],
                ];
            } else {
                // Para 2 o 1 clasificado por grupo (ej: 1°A vs 2°B y 1°B vs 2°A)
                $parejas = [];
                for ($p = 0; $p <$porGrupo; $p++) {$rivalIdx = $porGrupo - 1 -$p;
                    $g1 =$p % 2 === 0 ? $tA :$tB;
                    $g2 =$p % 2 === 0 ? $tB :$tA;
                    $nom1 =$p % 2 === 0 ? $nA :$nB;
                    $nom2 =$p % 2 === 0 ? $nB :$nA;
                    $parejas[] = [
                        $g1[$p] ?? null, ($p + 1) . "° {$nom1}",
                        $g2[$rivalIdx] ?? null, ($rivalIdx + 1) . "° {$nom2}",
                    ];
                }
            }

            foreach ($parejas as $idx => [$eq1, $tag1,$eq2, $tag2]) {$llaves[] = [
                    'llave'               => $idx + 1, 'etiqueta_local'      =>$tag1,
                    'etiqueta_visitante'  => $tag2,
                    'equipo_local_id'     => $eq1['equipo_id'] ?? '',
                    'equipo_visitante_id' => $eq2['equipo_id'] ?? '',
                ];
            }

            return [$llaves,$alertas];
        }

        // Para 4 u 8 grupos: empareja grupos adyacentes (A vs B, C vs D...) cruzando 1° vs último clasificado
        $numLlave = 1;
        for ($g = 0; $g < $numGrupos; $g += 2) {
            $t1 = collect($grupos[$g]['tabla'] ?? [])->values();$t2 = collect($grupos[$g + 1]['tabla'] ?? [])->values();
            $n1 =$grupos[$g]['nombre'];$n2 = $grupos[$g + 1]['nombre'] ?? '';

            for ($p = 0; $p <$porGrupo; $p++) {$rivalIdx = $porGrupo - 1 -$p;
                $eq1 = $t1[$p] ?? null;
                $eq2 = $t2[$rivalIdx] ?? null;
                $llaves[] = [
                    'llave'               => $numLlave++,
                    'etiqueta_local'      => ($p + 1) . "° {$n1}",
                    'etiqueta_visitante'  => ($rivalIdx + 1) . "° {$n2}",
                    'equipo_local_id'     => $eq1['equipo_id'] ?? '',
                    'equipo_visitante_id' => $eq2['equipo_id'] ?? '',
                ];
            }
        }

        return [$llaves,$alertas];
    }

    /**
     * Resuelve los ganadores de cada llave de la ronda anterior y arma la siguiente ronda.
     */
    private function construirLlavesDesdeRondaAnterior(Torneo $torneo, Collection $partidosFase): array
    {
        $alertas = [];
        $porLlave = $partidosFase->sortBy('id')->groupBy('llave')->sortKeys();
        $ganadores = [];

        foreach ($porLlave as $numLlave => $encuentros) {
            $primero = $encuentros->first();
            $ultimo = $encuentros->last();

            $eqA = $primero->equipo_local_id;
            $eqB = $primero->equipo_visitante_id;
            $nomA = $primero->equipoLocal?->nombre ?? "Equipo #{$eqA}";
            $nomB = $primero->equipoVisitante?->nombre ?? "Equipo #{$eqB}";

            $golesA = 0;
            $golesB = 0;
            $visitaA = 0;
            $visitaB = 0;

            foreach ($encuentros as $p) {
                if ($p->equipo_local_id === $eqA) {
                    $golesA += (int) $p->goles_local;
                    $golesB += (int) $p->goles_visitante;
                    $visitaB += (int) $p->goles_visitante;
                } else {
                    $golesB += (int) $p->goles_local;
                    $golesA += (int) $p->goles_visitante;
                    $visitaA += (int) $p->goles_visitante;
                }
            }

            $ganadorId = null;

            if ($golesA > $golesB) {
                $ganadorId = $eqA;
            } elseif ($golesB > $golesA) {
                $ganadorId = $eqB;
            } else {
                // Empate en el marcador global
                if ($torneo->gol_visitante && $encuentros->count() > 1 && $visitaA !== $visitaB) {
                    $ganadorId = $visitaA > $visitaB ? $eqA : $eqB;
                } elseif ($ultimo->penales_local !== null && $ultimo->penales_visitante !== null && $ultimo->penales_local !== $ultimo->penales_visitante) {
                    $ganadorId = $ultimo->equipo_local_id === $eqA
                        ? ($ultimo->penales_local > $ultimo->penales_visitante ? $eqA : $eqB)
                        : ($ultimo->penales_visitante > $ultimo->penales_local ? $eqA : $eqB);
                } else {
                    $ganadorId = $eqA; // Sugerencia por defecto editable
                    $alertas[] = "Llave {$numLlave} ({$nomA} vs {$nomB}) terminó empatada ({$golesA}-{$golesB}) sin definición por penales. Confirma el ganador manualmente.";
                }
            }

            $ganadores[] = [
                'llave'     => $numLlave,
                'equipo_id' => $ganadorId,
            ];
        }

        $llaves = [];
        $idxLlave = 1;
        for ($i = 0; $i < count($ganadores); $i += 2) {
            $g1 = $ganadores[$i] ?? null;
            $g2 = $ganadores[$i + 1] ?? null;

            $llaves[] = [
                'llave'               => $idxLlave++,
                'etiqueta_local'      => $g1 ? "Ganador Llave {$g1['llave']}" : 'Por definir',
                'etiqueta_visitante'  => $g2 ? "Ganador Llave {$g2['llave']}" : 'Por definir',
                'equipo_local_id'     => $g1['equipo_id'] ?? '',
                'equipo_visitante_id' => $g2['equipo_id'] ?? '',
            ];
        }

        return [$llaves, $alertas];
    }

    private function fasePorCantidadEquipos(int $n): ?string
    {
        return match ($n) {
            16      => 'OCTAVOS',
            8       => 'CUARTOS',
            4       => 'SEMIFINAL',
            2       => 'FINAL',
            default => null,
        };
    }

    private function siguienteFase(string $faseActual): ?string
    {
        return match ($faseActual) {
            'OCTAVOS'   => 'CUARTOS',
            'CUARTOS'   => 'SEMIFINAL',
            'SEMIFINAL' => 'FINAL',
            default     => null,
        };
    }

    private function etiquetaFase(string $fase): string
    {
        return match ($fase) {
            'OCTAVOS'   => 'Octavos de Final',
            'CUARTOS'   => 'Cuartos de Final',
            'SEMIFINAL' => 'Semifinales',
            'FINAL'     => 'Final',
            default     => $fase,
        };
    }
}
