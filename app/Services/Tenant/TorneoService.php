<?php

namespace App\Services\Tenant;

use App\Models\Tenant\Torneo;
use App\Models\Tenant\EquipoTorneo;
use Illuminate\Support\Facades\DB;

class TorneoService
{
    public function index()
    {
        return Torneo::withCount('equipoTorneos')
            ->latest()
            ->paginate(10);
    }

    public function create(array $data): Torneo
    {
        // El trait BelongsToTenant se encarga del tenant_id si aplica en la creación
        $data['tenant_id'] = auth()->user()->tenant_id;
        $data['estado'] = $data['estado'] ?? 'BORRADOR';

        return Torneo::create($data);
    }

    public function update(Torneo $torneo, array $data): Torneo
    {
        $torneo->update($data);

        return $torneo;
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
}
