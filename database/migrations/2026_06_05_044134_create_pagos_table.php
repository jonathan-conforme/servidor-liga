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
        Schema::create('pagos', function (Blueprint $table) {

            $table->id();
            //relaciones
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('suscripcion_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained()->cascadeOnDelete();
            $table->decimal('monto', 10, 2);
            $table->string('referencia')->nullable();
            $table->dateTime('fecha_pago');
            $table->text('observacion')->nullable();

            $table->enum('metodo_pago', [
                'EFECTIVO',
                'TRANSFERENCIA',
                'PAYPAL',
                'STRIPE',
            ]);

            $table->enum('estado', [
                'PENDIENTE',
                'PAGADO',
                'ANULADO',
                'FALLIDO'
            ])->default('PENDIENTE');


            $table->index('tenant_id');
            $table->index('suscripcion_id');
            $table->index('fecha_pago');
            $table->index('estado');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};
