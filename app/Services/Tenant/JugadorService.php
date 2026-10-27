<?php

namespace App\Services\Tenant;

use App\Models\Tenant\Jugador;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class JugadorService
{
    /**
     * Listar jugadores paginados y ordenados por apellidos
     */
    public function index(int $perPage = 10): LengthAwarePaginator
    {
        return Jugador::orderBy('apellidos', 'asc')
            ->orderBy('nombres', 'asc')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Crear un nuevo jugador
     */
    public function create(array $data): Jugador
    {
        return Jugador::create($data);
    }

    /**
     * Actualizar los datos de un jugador
     */
    public function update(Jugador $jugador, array $data): bool
    {
        return $jugador->update($data);
    }
}
