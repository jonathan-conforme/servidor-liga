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
        Schema::create('eventos_partido', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('partido_id')->constrained('partidos')->cascadeOnDelete();
            
            $table->enum('tipo', ['INICIO', 'ENTRETIEMPO', 'GOL', 'AUTOGOL', 'AMARILLA', 'ROJA', 'CAMBIO', 'FIN']);
            $table->integer('minuto')->nullable();

            // Relaciones dinámicas
            $table->foreignId('jugador_id')->nullable()->constrained('jugadores')->nullOnDelete();
            $table->foreignId('jugador_ingresa_id')->nullable()->constrained('jugadores')->nullOnDelete();
            $table->foreignId('equipo_id')->nullable()->constrained('equipos')->nullOnDelete();

            $table->text('descripcion')->nullable();
            $table->timestamps();

            // Índices de alta velocidad
            $table->index(['partido_id', 'minuto']);
            $table->index(['jugador_id', 'tipo']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('eventos_partido');
    }
};
