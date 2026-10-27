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


            Schema::create('categorias', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
                $table->string('nombre'); // Ej: "Máster 40", "Sub 17"
                $table->text('descripcion')->nullable();
                $table->integer('edad_min')->nullable();
                $table->integer('edad_max')->nullable();
                $table->boolean('activo')->default(true);
                $table->timestamps();

                $table->unique(['tenant_id', 'nombre']);
                
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categorias');
    }
};
