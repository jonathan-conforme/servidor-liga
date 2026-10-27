<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\SuperAdmin\Tenant;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\PermissionRegistrar; // ◄ Importante para limpiar caché

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Limpiar la caché de roles y permisos de Spatie antes de asignar
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Tu usuario Super Admin original
        $user = User::create([
            'name' => 'Jonas',
            'email' => 'admin@sistema.com',
            'cedula' => '0980659712',
            'password' => Hash::make('Admin123456'),
        ]);
        $user->assignRole('Super Admin');

        // 2. Crear el Tenant (Liga) de prueba
        $tenant = Tenant::create([
            'nombre'        => 'Liga Barrial Guayaquil',
            'slug'          => 'liga-barrial-guayaquil',
            'subdominio'    => 'guayaquil',
            'email'         => 'contacto@ligaguayaquil.com',
            'administrador' => 'Jonas Liga',
            'cedula'        => '0980659713',
            'activo'        => true,
        ]);

        // 2. NUEVO: Tu usuario para entrar directo a TENANT (Evita el error de Dashboard)
        $tenantUser = User::create([
            'name' => 'Jonas Liga',
            'email' => 'liga@sistema.com', // ◄ Usa este email para tus pruebas de Tenant
            'cedula' => '0980659713',
            'tenant_id' => 1, // ◄ Asegúrate de que este ID exista en tu tabla tenants
            'password' => Hash::make('Admin123456'),
        ]);
        $tenantUser->assignRole('Administrador Liga');
    }
}
