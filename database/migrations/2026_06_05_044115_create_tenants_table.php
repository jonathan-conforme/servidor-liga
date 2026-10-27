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
        Schema::create('tenants', function (Blueprint $table) {

            $table->id();

            $table->string('nombre');
            $table->string('slug')->unique();
            $table->string('subdominio')->unique();
            $table->string('logo')->nullable();
            $table->string('email')->unique();
            $table->string('telefono')->nullable();
            $table->string('administrador')->unique();
            $table->string('cedula')->unique();
            // $table->string('pais')->nullable(); migrar si el proyecto se expande a otros países
            $table->string('ciudad')->nullable();
            $table->string('provincia')->nullable();
            $table->string('canton')->nullable();
            $table->boolean('activo')->default(true);

            $table->timestamps();

            $table->index('activo');
            $table->index('cedula');
            $table->index('ciudad');

        });
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Al revertir, primero rompemos la relación para evitar errores de restricción
        if (Schema::hasColumn('users', 'tenant_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropForeign(['tenant_id']);
            });
        }

        Schema::dropIfExists('tenants');
    }
};
