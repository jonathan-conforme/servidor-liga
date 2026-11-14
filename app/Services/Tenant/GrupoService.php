<?php

namespace App\Services\Tenant;

use App\Models\Tenant\EquipoTorneo;
use App\Models\Tenant\Grupo;
use App\Models\Tenant\Partido;
use App\Models\Tenant\Torneo;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class GrupoService
{
    public function asegurarGrupos(Torneo $torneo): Collection
    {
        $n = (int) $torneo->cantidad_grupos;

        if ($torneo->tipo_competicion !== 'GRUPOS_ELIMINACION' || $n < 2) {
            throw ValidationException::withMessages([
                'grupos' => 'El torneo no es de grupos o tiene menos de 2 grupos configurados.',
            ]);
        }

        $existentes = Grupo::where('torneo_id', $torneo->id)->count();

        for ($i = $existentes; $i < $n; $i++) {
            Grupo::create([
                'tenant_id' => $torneo->tenant_id,
                'torneo_id' => $torneo->id,
                'nombre'    => 'Grupo ' . chr(65 + $i),
            ]);
        }

        return Grupo::where('torneo_id', $torneo->id)->orderBy('id')->take($n)->get();
    }

    public function sortear(Torneo $torneo): void
    {
        $this->exigirSinFixture($torneo->id);

        DB::transaction(function () use ($torneo) {
            $grupos = $this->asegurarGrupos($torneo)->values();

            $porCategoria = EquipoTorneo::where('torneo_id', $torneo->id)->get()->groupBy('categoria_id');

            foreach ($porCategoria as $inscripciones) {
                foreach ($inscripciones->shuffle()->values() as $i => $insc) {
                    $insc->update(['grupo_id' => $grupos[$i % $grupos->count()]->id]);
                }
            }
        });
    }

    public function asignar(EquipoTorneo $inscripcion, ?int $grupoId): void
    {
        $this->exigirSinFixture($inscripcion->torneo_id);

        if ($grupoId) {
            $valido = Grupo::where('id', $grupoId)->where('torneo_id', $inscripcion->torneo_id)->exists();

            if (! $valido) {
                throw ValidationException::withMessages(['grupos' => 'El grupo no pertenece a este torneo.']);
            }
        }

        $inscripcion->update(['grupo_id' => $grupoId]);
    }

    private function exigirSinFixture(int $torneoId): void
    {
        if (Partido::where('torneo_id', $torneoId)->exists()) {
            throw ValidationException::withMessages([
                'grupos' => 'El fixture ya fue generado. Regénéralo antes de cambiar los grupos.',
            ]);
        }
    }
}