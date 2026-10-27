<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipo_torneo_jugador', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');

            // Relaciona con la inscripción del equipo en el torneo
            $table->foreignId('equipo_torneo_id')->constrained('equipo_torneo')->cascadeOnDelete();

            // Relaciona con el jugador maestro
            $table->foreignId('jugador_id')->constrained('jugadores')->cascadeOnDelete();

            // Número de dorsal único para este torneo
            $table->integer('numero_camiseta')->nullable();

            $table->timestamps();

            // Evita que el mismo jugador sea fichado dos veces en el mismo equipo para el mismo torneo
            $table->unique(['equipo_torneo_id', 'jugador_id'], 'eq_tor_jug_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipo_torneo_jugador');
    }
};
