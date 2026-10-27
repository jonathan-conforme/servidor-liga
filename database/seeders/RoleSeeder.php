<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::create(['name' => 'Super Admin']);
        Role::create(['name' => 'Administrador Liga']);
        Role::create(['name' => 'Editor']);
        Role::create(['name' => 'Operador']);
        Role::create(['name' => 'Dirigente']);


    }
}
