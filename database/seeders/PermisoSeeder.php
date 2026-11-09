<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermisoSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $todos = [];
        foreach (config('permisos.modulos') as $modulo => $def) {
            foreach (array_keys($def['acciones']) as $accion) {
                $todos[] = "{$modulo}.{$accion}";
            }
        }

        foreach ($todos as $p) {
            Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
        }

        Role::findByName('Administrador Liga')->syncPermissions($todos);

        foreach (config('permisos.roles') as $rol => $permisos) {
            Role::findByName($rol)->syncPermissions($permisos);
        }
    }
}
