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
        Schema::create('suscripcions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained()->cascadeOnDelete();
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->enum('estado', [
                'ACTIVA',
                'VENCIDA',
                'SUSPENDIDA',
                'CANCELADA',
            ])->default('ACTIVA');

            $table->decimal('precio_pagado', 10, 2)->nullable();
            
            $table->index('tenant_id');
            $table->index('plan_id');
            $table->index('estado');
            $table->index(['tenant_id','estado',]);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suscripcions');
    }
};
