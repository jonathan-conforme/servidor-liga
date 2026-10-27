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
        Schema::create('torneos', function (Blueprint $table) {
            $table->id();$table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('nombre');
            $table->year('anio');
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();

            $table->enum('estado', [
                'BORRADOR',
                'INSCRIPCIONES',
                'EN_CURSO',
                'FINALIZADO',
            ])->default('BORRADOR');

            $table->enum('tipo_competicion', [
                'LIGA',
                'GRUPOS_ELIMINACION',
                'ELIMINACION_DIRECTA',
            ])->default('LIGA');

            // Configuración de grupos y formato barrial
            $table->unsignedTinyInteger('cantidad_grupos')->nullable();
            $table->unsignedTinyInteger('clasificados_por_grupo')->nullable();

            // Reglas de juego
            $table->boolean('ida_vuelta')->default(false);
            $table->boolean('gol_visitante')->default(false);
            $table->boolean('penales')->default(true);
            $table->boolean('final_ida_vuelta')->default(false);

            $table->softDeletes();
            $table->timestamps();

            $table->index(['tenant_id', 'estado']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('torneos');
    }
};
