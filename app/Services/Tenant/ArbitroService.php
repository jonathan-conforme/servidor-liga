<?php

namespace App\Services\Tenant;

use App\Models\Tenant\Arbitro;
use Illuminate\Validation\ValidationException;

class ArbitroService
{
    public function crear(array $data): Arbitro
    {
        return Arbitro::create($data); // el trait asigna tenant_id
    }

    public function actualizar(Arbitro $arbitro, array $data): Arbitro
    {
        $arbitro->update($data);

        return $arbitro;
    }

    public function eliminar(Arbitro $arbitro): void
    {
        // No borrar árbitros con historial: se desactivan
        if ($arbitro->partidos()->exists()) {
            throw ValidationException::withMessages([
                'arbitro' => 'Este árbitro tiene partidos asignados. Desactívalo en lugar de eliminarlo.',
            ]);
        }

        $arbitro->delete();
    }
}
