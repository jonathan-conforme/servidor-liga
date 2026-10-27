<?php

namespace App\Services\SuperAdmin;

use App\Models\SuperAdmin\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TenantService
{
    public function getAll()
    {
        return Tenant::latest()->paginate(10);
    }

    public function create(array $data)
    {
        // Envolvemos ambas creaciones en una transacción para mayor seguridad
        return DB::transaction(function () use ($data) {

            // 1. Creamos la Liga
            $tenant = Tenant::create($data);

            // 2. Creamos al Usuario Administrador vinculado a esta liga
            $user = User::create([
                'name' => $data['administrador'],
                'cedula' => $data['cedula'],
                'email' => $data['email'],
                'telefono' => $data['telefono'],
                'password' => Hash::make($data['cedula']), // La cédula es la clave temporal
                'tenant_id' => $tenant->id, // Vinculamos el usuario a la liga recién creada
            ]);
            $user->refresh();

            $user->assignRole('Administrador Liga');

            return $tenant;
        });
    }

    public function update(Tenant $tenant, array $data)
    {
        $tenant->update($data);

        return $tenant;
    }

    public function delete(Tenant $tenant)
    {
        return $tenant->delete();
    }
}
