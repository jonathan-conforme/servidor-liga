<?php

namespace App\Services\Tenant;

use App\Models\Tenant\Equipo;
use Illuminate\Support\Str;

class EquipoService
{
    public function index()
    {
        return Equipo::latest()->paginate(5);
    }

    public function create(array $data)
    {
        // Forzamos el amarre al tenant del usuario autenticado
        $data['tenant_id'] = auth()->user()->tenant_id;
        $data['slug'] = Str::slug($data['nombre']);

        return Equipo::create($data);
    }

    public function update(Equipo $equipo, array $data)
    {
        $data['slug'] = Str::slug($data['nombre']);
        $equipo->update($data);

        return $equipo;
    }

    public function destroy(Equipo $equipo)
    {
        $equipo->delete();
    }
}
