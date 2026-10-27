<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SuperAdmin\Tenant;
use App\Models\Tenant\Categoria;
use App\Models\Tenant\Equipo;
use App\Models\Tenant\Jugador;
use App\Models\Tenant\Torneo;
use App\Models\Tenant\Grupo;
use App\Models\Tenant\EquipoTorneo;
use App\Models\Tenant\EquipoTorneoJugador;
use Illuminate\Support\Str;

class DatosPruebaTenantSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Obtener o tomar el primer Tenant registrado
        $tenant = Tenant::first();

        if (!$tenant) {
            $this->command->error('Primero debes ejecutar el SuperAdminSeeder para crear un Tenant.');
            return;
        }

        $tenantId = $tenant->id;

        // 2. CREAR CATEGORÍAS DE PRUEBA
        $catMaxima = Categoria::create([
            'tenant_id'   => $tenantId,
            'nombre'      => 'Máxima Categoría',
            'descripcion' => 'División de honor de la liga',
            'activo'      => true,
        ]);

        $catSub18 = Categoria::create([
            'tenant_id'   => $tenantId,
            'nombre'      => 'Sub 18',
            'descripcion' => 'Formativa juvenil',
            'edad_max'    => 18,
            'activo'      => true,
        ]);

        // 3. CREAR EQUIPOS DE PRUEBA
        $nombresEquipos = ['Club Deportivo Central', 'Atlético San José', 'Real Barrial FC', 'Deportivo El Valle'];
        $equiposCreados = [];

        foreach ($nombresEquipos as $nombre) {
            $equiposCreados[] = Equipo::create([
                'tenant_id'        => $tenantId,
                'nombre'           => $nombre,
                'slug'             => Str::slug($nombre),
                'presidente'       => 'Don Carlos Perez',
                'director_tecnico' => 'Prof. Juan Gomez',
                'telefono'         => '0991234567',
                'email'            => Str::slug($nombre) . '@mail.com',
                'activo'           => true,
            ]);
        }

        // 4. CREAR JUGADORES DE PRUEBA
        $posiciones = ['ARQUERO', 'DEFENSA', 'MEDIOCAMPO', 'DELANTERO'];
        $jugadoresCreados = [];

        for ($i = 1; $i <= 12; $i++) {
            $jugadoresCreados[] = Jugador::create([
                'tenant_id'        => $tenantId,
                'nombres'          => "Jugador {$i}",
                'apellidos'        => "Apellido {$i}",
                'fecha_nacimiento' => '1998-05-15',
                'cedula'           => "17200000" . str_pad($i, 2, '0', STR_PAD_LEFT),
                'posicion'         => $posiciones[array_rand($posiciones)],
                'activo'           => true,
            ]);
        }

        // 5. CREAR UN TORNEO
        $torneo = Torneo::create([
            'tenant_id'              => $tenantId,
            'nombre'                 => 'Copa Apertura 2026',
            'anio'                   => 2026,
            'fecha_inicio'           => now()->format('Y-m-d'),
            'estado'                 => 'INSCRIPCIONES',
            'tipo_competicion'       => 'GRUPOS_ELIMINACION',
            'cantidad_grupos'        => 2,
            'clasificados_por_grupo' => 2,
            'ida_vuelta'             => true,
            'penales'                => true,
        ]);

        // 6. CREAR GRUPOS EN EL TORNEO (Con tenant_id explícito)
        $grupoA = Grupo::create([
            'tenant_id' => $tenantId,
            'torneo_id' => $torneo->id,
            'nombre'    => 'Grupo A',
        ]);

        $grupoB = Grupo::create([
            'tenant_id' => $tenantId,
            'torneo_id' => $torneo->id,
            'nombre'    => 'Grupo B',
        ]);

        // 7. INSCRIBIR EQUIPOS EN EL TORNEO (Con tenant_id explícito si la tabla lo contiene)
        $inscripcion1 = EquipoTorneo::create([
            'tenant_id'    => $tenantId,
            'torneo_id'    => $torneo->id,
            'equipo_id'    => $equiposCreados[0]->id,
            'categoria_id' => $catMaxima->id,
            'grupo_id'     => $grupoA->id,
        ]);

        $inscripcion2 = EquipoTorneo::create([
            'tenant_id'    => $tenantId,
            'torneo_id'    => $torneo->id,
            'equipo_id'    => $equiposCreados[1]->id,
            'categoria_id' => $catMaxima->id,
            'grupo_id'     => $grupoA->id,
        ]);

        // 8. FICHAR JUGADORES AL EQUIPO EN ESTE TORNEO (Con tenant_id explícito si aplica)
        foreach (array_slice($jugadoresCreados, 0, 3) as $key => $jugador) {
            EquipoTorneoJugador::create([
                'tenant_id'        => $tenantId,
                'equipo_torneo_id' => $inscripcion1->id,
                'jugador_id'       => $jugador->id,
                'numero_camiseta'  => ($key + 1) * 10,
            ]);
        }

        foreach (array_slice($jugadoresCreados, 3, 3) as $key => $jugador) {
            EquipoTorneoJugador::create([
                'tenant_id'        => $tenantId,
                'equipo_torneo_id' => $inscripcion2->id,
                'jugador_id'       => $jugador->id,
                'numero_camiseta'  => $key + 7,
            ]);
        }
    }
}
