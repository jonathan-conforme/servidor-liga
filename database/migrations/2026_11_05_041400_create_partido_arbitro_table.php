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
        Schema::create('partido_arbitro', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('partido_id')->constrained()->cascadeOnDelete();
            $table->foreignId('arbitro_id')->constrained()->cascadeOnDelete();
            $table->enum('rol', ['PRINCIPAL', 'ASISTENTE_1', 'ASISTENTE_2', 'CUARTO']);
            $table->timestamps();
            
            $table->unique(['partido_id', 'arbitro_id']);
            $table->unique(['partido_id', 'rol']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('partido_arbitro');
    }
};
