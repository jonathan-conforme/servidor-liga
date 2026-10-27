<?php

namespace App\Services\Tenant;

use App\Models\Tenant\EquipoTorneo;
use App\Models\Tenant\EquipoTorneoJugador;
use App\Models\Tenant\Jugador;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class InscripcionService
{
    public function inscribirEquipo(array $data): EquipoTorneo
    {
        return EquipoTorneo::create($data);
    }

    public function eliminarInscripcion(EquipoTorneo $equipoTorneo): void
    {
        $equipoTorneo->delete();
    }

    public function guardarRoster(int $equipoTorneoId, array $jugadoresData): void
    {
        DB::transaction(function () use ($equipoTorneoId, $jugadoresData) {
            $equipoTorneo = EquipoTorneo::with('categoria')->findOrFail($equipoTorneoId);
            $categoria = $equipoTorneo->categoria;
            $idsSeleccionados = collect($jugadoresData)->pluck('jugador_id')->toArray();

            // 1. VALIDAR JUGADOR DUPICADO EN OTRO EQUIPO DE LA MISMA CATEGORÍA
            $jugadorOcupado = DB::table('equipo_torneo_jugador')
                ->join('equipo_torneo', 'equipo_torneo.id', '=', 'equipo_torneo_jugador.equipo_torneo_id')
                ->join('jugadores', 'jugadores.id', '=', 'equipo_torneo_jugador.jugador_id')
                ->join('equipos', 'equipos.id', '=', 'equipo_torneo.equipo_id')
                ->where('equipo_torneo.torneo_id', $equipoTorneo->torneo_id)
                ->where('equipo_torneo.categoria_id', $equipoTorneo->categoria_id)
                ->where('equipo_torneo.id', '!=', $equipoTorneoId)
                ->whereIn('equipo_torneo_jugador.jugador_id', $idsSeleccionados)
                ->select('jugadores.nombres', 'jugadores.apellidos', 'equipos.nombre as equipo_nombre')
                ->first();

            if ($jugadorOcupado) {
                throw ValidationException::withMessages([
                    'jugadores' => "El jugador {$jugadorOcupado->nombres} {$jugadorOcupado->apellidos} ya está fichado en '{$jugadorOcupado->equipo_nombre}' para esta categoría.",
                ]);
            }

            // 2. VALIDAR EDAD MÍNIMA Y MÁXIMA SEGÚN LA CATEGORÍA
            if ($categoria && (count($idsSeleccionados) > 0)) {
                $jugadores = Jugador::whereIn('id', $idsSeleccionados)->get();

                foreach ($jugadores as $jugador) {
                    if (!$jugador->fecha_nacimiento) continue;

                    $edad = Carbon::parse($jugador->fecha_nacimiento)->age;

                    // Validar Edad Mínima (ej: Sub 30 exige al menos 30 años)
                    if (!is_null($categoria->edad_min) && $categoria->edad_min !== '' && $edad < $categoria->edad_min) {
                        throw ValidationException::withMessages([
                            'jugadores' => "El jugador {$jugador->nombres} {$jugador->apellidos} tiene {$edad} años y la categoría '{$categoria->nombre}' exige un mínimo de {$categoria->edad_min} años.",
                        ]);
                    }

                    // Validar Edad Máxima (ej: Sub 18 exige máximo 18 años)
                    if (!is_null($categoria->edad_max) && $categoria->edad_max !== '' && $edad > $categoria->edad_max) {
                        throw ValidationException::withMessages([
                            'jugadores' => "El jugador {$jugador->nombres} {$jugador->apellidos} tiene {$edad} años y la categoría '{$categoria->nombre}' permite un máximo de {$categoria->edad_max} años.",
                        ]);
                    }
                }
            }

            // 3. GUARDAR PLANTILLA
            EquipoTorneoJugador::where('equipo_torneo_id', $equipoTorneoId)->delete();

            foreach ($jugadoresData as $item) {
                EquipoTorneoJugador::create([
                    'equipo_torneo_id' => $equipoTorneoId,
                    'jugador_id'       => $item['jugador_id'],
                    'numero_camiseta'  => $item['numero_camiseta'] ?? null,
                ]);
            }
        });
    }

    public function buscarJugadoresDisponibles(string $query, int $torneoId): Collection
    {
        if (strlen($query) < 2 || !$torneoId) {
            return collect();
        }

        $cleanQuery = ltrim($query, '0');

        $jugadoresOcupadosIds = DB::table('equipo_torneo_jugador')
            ->join('equipo_torneo', 'equipo_torneo.id', '=', 'equipo_torneo_jugador.equipo_torneo_id')
            ->where('equipo_torneo.torneo_id', $torneoId)
            ->pluck('equipo_torneo_jugador.jugador_id');

        return Jugador::where('activo', true)
            ->whereNotIn('id', $jugadoresOcupadosIds)
            ->where(function ($q) use ($query, $cleanQuery) {
                $q->where('nombres', 'LIKE', "%{$query}%")
                  ->orWhere('apellidos', 'LIKE', "%{$query}%")
                  ->orWhere('cedula', 'LIKE', "%{$query}%")
                  ->orWhere('cedula', 'LIKE', "%{$cleanQuery}%");
            })
            ->limit(10)
            ->get(['id', 'nombres', 'apellidos', 'cedula', 'posicion', 'fecha_nacimiento']);
    }
}
