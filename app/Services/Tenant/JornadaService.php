<?php

namespace App\Services\Tenant;

use App\Models\Tenant\Jornada;
use Illuminate\Database\Eloquent\Collection;

class JornadaService
{
    public function obtenerPorTorneo(int $torneoId): Collection
    {
        return Jornada::where('torneo_id', $torneoId)
            ->orderBy('numero', 'asc')
            ->get();
    }

    public function actualizarJornada(Jornada $jornada, array $data): Jornada
    {
        if (isset($data['estado']) && $data['estado'] !== 'SUSPENDIDA') {
            $data['motivo_suspension'] = null;
        }

        $jornada->update($data);

        return $jornada;
    }
}
