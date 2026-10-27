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
        Schema::create('plans', function (Blueprint $table) {

    $table->id();

    $table->string('nombre')->unique();
    $table->text('descripcion')->nullable();
    $table->decimal('precio', 10, 2);
    $table->integer('duracion_dias')->default(30);
    $table->integer('limite_usuarios')->default(1);
    $table->integer('max_equipos')->nullable();
    $table->integer('max_jugadores')->nullable();
    $table->integer('max_torneos')->nullable();
    $table->boolean('permite_noticias')->default(true);
    $table->boolean('permite_galerias')->default(true);
    $table->boolean('permite_estadisticas')->default(true);
    $table->boolean('soporte_prioritario')->default(false);
    $table->boolean('activo')->default(true);

    $table->index('activo');

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
