<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('partidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('torneo_id')->constrained('torneos')->onDelete('cascade');
            $table->foreignId('jornada_id')->constrained('jornadas')->onDelete('cascade'); // <-- Enlace a la Jornada
            $table->foreignId('equipo_local_id')->constrained('equipos')->onDelete('cascade');
            $table->foreignId('equipo_visitante_id')->constrained('equipos')->onDelete('cascade');

            $table->dateTime('fecha_partido')->nullable(); // Hora exacta del cotejo
            $table->string('cancha')->nullable();

            $table->unsignedSmallInteger('goles_local')->nullable();
            $table->unsignedSmallInteger('goles_visitante')->nullable();
            $table->enum('estado', ['PROGRAMADO', 'EN_JUEGO', 'FINALIZADO', 'SUSPENDIDO'])->default('PROGRAMADO');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('partidos');
    }
};
