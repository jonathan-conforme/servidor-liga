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
        Schema::create('jornadas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('torneo_id')->constrained('torneos')->onDelete('cascade');

            $table->unsignedInteger('numero'); // 1, 2, 3...
            $table->string('nombre')->nullable(); // "Jornada 1", "Fecha Inaugural"
            $table->date('fecha_programada')->nullable(); // Ej: Domingo 15 de Noviembre

            $table->enum('estado', ['PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'SUSPENDIDA'])
                  ->default('PROGRAMADA');

            $table->text('motivo_suspension')->nullable(); // Ej: "Inclemencia del tiempo / Lluvia"
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jornadas');
    }
};
