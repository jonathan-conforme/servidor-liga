<?php

namespace App\Services\Tenant;

use App\Models\Tenant\EquipoTorneo;
use App\Models\Tenant\Partido;
use App\Models\Tenant\Grupo;
use App\Models\Tenant\Torneo;
use Illuminate\Support\Facades\DB;

class TorneoService
{
    public function index()
    {
        return Torneo::withCount('equipoTorneos')
            ->latest()
            ->paginate(15);
    }

    public function create(array $data): Torneo
    {
        // El trait BelongsToTenant se encarga del tenant_id si aplica en la creación
        $data['tenant_id'] = auth()->user()->tenant_id;
        $data['estado'] = $data['estado'] ?? 'BORRADOR';

        return DB::transaction(function () use ($data) {
            $torneo = Torneo::create($data);
            $this->sincronizarGrupos($torneo);

        return $torneo;
         });
    }

    public function update(Torneo $torneo, array $data): Torneo
    {
        return DB::transaction(function () use ($torneo, $data) {
            $torneo->update($data);
            $this->sincronizarGrupos($torneo->fresh());

            return $torneo;
        });
    }

    public function destroy(Torneo $torneo): void
    {
        $torneo->delete();
    }

    /**
     * Inscribe equipos en el torneo asignándoles categoría y grupo (opcional)
     */
    public function inscribirEquipos(Torneo $torneo, array $inscripciones): void
    {
        DB::transaction(function () use ($torneo, $inscripciones) {
            foreach ($inscripciones as $registro) {
                EquipoTorneo::updateOrCreate(
                    [
                        'torneo_id'    => $torneo->id,
                        'equipo_id'    => $registro['equipo_id'],
                        'categoria_id' => $registro['categoria_id'],
                    ],
                    [
                        'grupo_id' => $registro['grupo_id'] ?? null,
                    ]
                );
            }
        });
    }
    /**
     * Crea Grupo A, B, C... según cantidad_grupos y borra los sobrantes.
     * Con fixture generado no toca nada.
     */
    private function sincronizarGrupos(Torneo $torneo): void
    {
        if (Partido::where('torneo_id', $torneo->id)->exists()) {
            return;
        }

        $n = $torneo->tipo_competicion === 'GRUPOS_ELIMINACION'
            ? (int) $torneo->cantidad_grupos
            : 0;

        $existentes = Grupo::where('torneo_id', $torneo->id)->orderBy('id')->get();

        for ($i = $existentes->count(); $i < $n; $i++) {
            Grupo::create([
                'tenant_id' => $torneo->tenant_id,
                'torneo_id' => $torneo->id,
                'nombre'    => 'Grupo ' . chr(65 + $i),
            ]);
        }

        // Los equipos de un grupo borrado quedan sin grupo (nullOnDelete)
        $existentes->slice($n)->each->delete();
    }
}