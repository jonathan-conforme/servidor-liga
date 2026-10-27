<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\SuperAdmin\Plan;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // PLAN 1: GRATUITO (Para enganchar usuarios y que prueben la plataforma)
        Plan::create([
            'nombre' => 'Plan Inicial / Gratuito',
            'descripcion' => 'Perfecto para ligas pequeñas o torneos de barrio que están empezando.',
            'precio' => 0.00,
            'limite_usuarios' => 0,
            'duracion_dias' => 30,
            'max_equipos' => 10,
            'max_jugadores' => 150,
            'max_torneos' => 1,
            'permite_noticias' => true,
            'permite_galerias' => false,
            'permite_estadisticas' => true,
            'soporte_prioritario' => false,
            'activo' => true
        ]);

        // PLAN 2: BÁSICO / AMATEUR (El más económico para ligas medianas independientes)
        Plan::create([
            'nombre' => 'Plan Amateur',
            'descripcion' => 'Diseñado para ligas en crecimiento que necesitan más control y galerías visuales.',
            'precio' => 19.99,
            'limite_usuarios' => 2,
            'duracion_dias' => 30,
            'max_equipos' => 24,
            'max_jugadores' => 400,
            'max_torneos' => 2,
            'permite_noticias' => true,
            'permite_galerias' => true,
            'permite_estadisticas' => true,
            'soporte_prioritario' => false,
            'activo' => true
        ]);

        // PLAN 3: PRO / RECOMENDADO (Tu mina de oro, el más rentable y atractivo)
        Plan::create([
            'nombre' => 'Plan Pro Liga',
            'descripcion' => 'Ideal para organizaciones deportivas profesionales. Torneos ilimitados y soporte rápido.',
            'precio' => 49.99,
            'limite_usuarios' => 5,
            'duracion_dias' => 30,
            'max_equipos' => 60,
            'max_jugadores' => 1200,
            'max_torneos' => 999, // Prácticamente ilimitados
            'permite_noticias' => true,
            'permite_galerias' => true,
            'permite_estadisticas' => true,
            'soporte_prioritario' => true, // ◄ Característica Premium
            'activo' => true
        ]);

        // PLAN 4: ANUAL / PREMIUM (Para asegurar ingresos a largo plazo con descuento)
        Plan::create([
            'nombre' => 'Plan Élite Anual',
            'descripcion' => 'Todo el poder del Plan Pro garantizado por un año completo con un super descuento.',
            'precio' => 399.99, // Descuentazo (en lugar de pagar $600 si pagara mes a mes)
            'duracion_dias' => 365, // ◄ Un año completo de duración
            'limite_usuarios' => 25,
            'max_equipos' => 120,
            'max_jugadores' => 2500,
            'max_torneos' => 999,
            'permite_noticias' => true,
            'permite_galerias' => true,
            'permite_estadisticas' => true,
            'soporte_prioritario' => true,
            'activo' => true
        ]);
    }
}
