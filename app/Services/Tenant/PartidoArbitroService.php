<?php

namespace App\Services\Tenant;

use App\Models\Tenant\Partido;
use App\Models\Tenant\PartidoArbitro;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PartidoArbitroService
{
    private const VENTANA_HORAS = 2; // un árbitro no puede tener dos partidos con menos de 2 h de diferencia

    /**
     * @param array<string,int|null> $roles ['PRINCIPAL' => 3, 'ASISTENTE_1' => 5, ...]
     */
    public function asignar(Partido $partido, array $roles): void
    {
        $roles = array_filter($roles); // quita roles vacíos
        $ids = array_values($roles);

        if (count($ids) !== count(array_unique($ids))) {
            throw ValidationException::withMessages([
                'arbitros' => 'Un mismo árbitro no puede tener dos roles en el mismo partido.',
            ]);
        }

        DB::transaction(function () use ($partido, $roles, $ids) {
            if ($partido->fecha_partido && $ids) {
                $ocupados = PartidoArbitro::whereIn('arbitro_id', $ids)
                    ->where('partido_id', '!=', $partido->id)
                    ->whereHas('partido', function ($q) use ($partido) {
                        $q->whereBetween('fecha_partido', [
                            $partido->fecha_partido->copy()->subHours(self::VENTANA_HORAS),
                            $partido->fecha_partido->copy()->addHours(self::VENTANA_HORAS),
                        ]);
                    })
                    ->with('arbitro')
                    ->get();

                if ($ocupados->isNotEmpty()) {
                    $nombres = $ocupados
                        ->map(fn ($pa) => $pa->arbitro->apellidos . ' ' . $pa->arbitro->nombres)
                        ->unique()
                        ->implode(', ');

                    throw ValidationException::withMessages([
                        'arbitros' => "Árbitros con otro partido en ese horario: {$nombres}.",
                    ]);
                }
            }

            $partido->arbitros()->detach();

            foreach ($roles as $rol => $arbitroId) {
                $partido->arbitros()->attach($arbitroId, [
                    'rol'       => $rol,
                    'tenant_id' => $partido->tenant_id,
                ]);
            }
        });
    }
}
