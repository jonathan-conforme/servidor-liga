<?php

namespace App\Services\SuperAdmin;

use App\Models\SuperAdmin\Pago;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PagoService
{
   public function create(array $data): Pago
    {
        // Usamos una transacción de Base de Datos para asegurarnos de que se guarden AMBAS cosas o ninguna
        return DB::transaction(function () use ($data) {
            // 1. Crear el pago
            $pago = Pago::create($data);

            // 2. Si el pago se registra directamente como 'PAGADO', renovamos la suscripción
            if ($pago->estado === 'PAGADO') {
                $this->actualizarYRenovarSuscripcion($pago);
            }

            return $pago;
        });
    }

    public function update(Pago $pago, array $data): Pago
    {
        DB::transaction(function () use ($pago, $data) {
            $estadoAnterior = $pago->estado;
            $pago->update($data);

            // Si el estado cambió de PENDIENTE a PAGADO durante la edición
            if ($estadoAnterior !== 'PAGADO' && $pago->estado === 'PAGADO') {
                $this->actualizarYRenovarSuscripcion($pago);
            }
        });

        return $pago;
    }

   public function delete(Pago $pago): void
    {
        $pago->delete();
    }

    public function aprobar(Pago $pago): void
    {
        DB::transaction(function () use ($pago) {
            $pago->update([
                'estado' => 'PAGADO',
                'fecha_pago' => now() // Seteamos la fecha real de aprobación
            ]);

            // Al aprobar desde el listado, se renueva la suscripción automáticamente
            $this->actualizarYRenovarSuscripcion($pago);
        });
    }



    public function anular(Pago $pago): void
    {
        $pago->update([
            'estado' => 'ANULADO'
        ]);

        // Opcional: Aquí podrías decidir si pasas la suscripción a 'SUSPENDIDA'
        // si resulta que el pago anulado era el único que tenía.
    }

    /**
     * Lógica centralizada para renovar las fechas y el estado de la suscripción
     */
    protected function actualizarYRenovarSuscripcion(Pago $pago): void
    {
        // Cargamos la relación de la suscripción y su plan
        $suscripcion = $pago->suscripcion()->with('plan')->first();

        if (!$suscripcion || !$suscripcion->plan) {
            return;
        }

        // Asumimos que tu tabla 'planes' tiene una columna 'meses' (ej: 1, 3, 12)
        // Si no la tiene, puedes cambiarlo por la lógica de tiempo que uses por defecto (ej: 1 mes)
        $mesesAAgregar = $suscripcion->plan->meses ?? 1;

        // Convertimos a instancias Carbon para operar fechas de forma segura
        $fechaFinActual = Carbon::parse($suscripcion->fecha_fin);
        $hoy = Carbon::now();

        // Lógica de fechas:
        // Si la suscripción ya expiró (es menor a hoy), el nuevo periodo inicia HOY.
        // Si la suscripción sigue activa, le sumamos los meses al vencimiento actual (acumulativa).
        if ($fechaFinActual->isPast()) {
            $nuevaFechaInicio = $hoy->format('Y-m-d');
            $nuevaFechaFin = $hoy->addMonths($mesesAAgregar)->format('Y-m-d');
        } else {
            $nuevaFechaInicio = $suscripcion->fecha_inicio; // Mantiene su inicio original
            $nuevaFechaFin = $fechaFinActual->addMonths($mesesAAgregar)->format('Y-m-d');
        }

        // Actualizamos la suscripción
        $suscripcion->update([
            'estado' => 'ACTIVA',
            'fecha_inicio' => $nuevaFechaInicio,
            'fecha_fin' => $nuevaFechaFin,
            'precio_pagado' => $pago->monto // Queda registro del último monto pagado
        ]);
    }
}
