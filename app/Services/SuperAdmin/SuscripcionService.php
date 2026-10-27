<?php

namespace App\Services\SuperAdmin;

use App\Models\SuperAdmin\Suscripcion;
use App\Models\SuperAdmin\Plan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class SuscripcionService
{
    public function create(array $data): Suscripcion
    {
       return DB::transaction(function () use ($data) {
            $plan = Plan::findOrFail($data['plan_id']);

            // ◄ CALCULO INTELIGENTE AUTOMÁTICO
            $data['fecha_fin'] = Carbon::parse($data['fecha_inicio'])
                ->addDays($plan->duracion_dias)
                ->format('Y-m-d');

            $data['precio_pagado'] = $plan->precio;
            $data['estado'] = $data['estado'] ?? 'ACTIVA';

            return Suscripcion::create($data);
        });
    }

    public function renovar(Suscripcion $suscripcion): void
    {
        DB::transaction(function () use ($suscripcion) {
            $plan = $suscripcion->plan;

            $suscripcion->update([
                           'fecha_fin' => now()->addDays($plan->duracion_dias)->format('Y-m-d'),
                'estado' => 'ACTIVA'
            ]);
        });
    }

    public function suspender(Suscripcion $suscripcion): void
    {
        $suscripcion->update(['estado' => 'SUSPENDIDA']);
    }

    public function activar(Suscripcion $suscripcion): void
    {
        $suscripcion->update(['estado' => 'ACTIVA']);
    }

    public function cancelar(Suscripcion $suscripcion): void
    {
        $suscripcion->update(['estado' => 'CANCELADA']);
    }
    public function update(Suscripcion $suscripcion, array $data): bool
{
    return DB::transaction(function () use ($suscripcion, $data) {

        // 1. Si el usuario cambió de plan en el select de la vista
        if (isset($data['plan_id']) && $data['plan_id'] != $suscripcion->plan_id) {
            $nuevoPlan = Plan::findOrFail($data['plan_id']);

            // Forzamos la actualización del precio real del nuevo plan
            $data['precio_pagado'] = $nuevoPlan->precio;

            // Recalculamos la fecha de fin basándonos en la duración del nuevo plan
            $fechaInicio = $data['fecha_inicio'] ?? $suscripcion->fecha_inicio;
            $data['fecha_fin'] = Carbon::parse($fechaInicio)
                ->addDays($nuevoPlan->duracion_dias)
                ->format('Y-m-d');
        }
        // 2. Si NO cambió el plan, pero sí cambió la fecha de inicio en el calendario
        elseif (isset($data['fecha_inicio']) && $data['fecha_inicio'] != $suscripcion->fecha_inicio) {
            $planActual = $suscripcion->plan;

            $data['fecha_fin'] = Carbon::parse($data['fecha_inicio'])
                ->addDays($planActual->duracion_dias)
                ->format('Y-m-d');
        }

        // Actualiza el registro con todos los datos calculados
        return $suscripcion->update($data);
    });
}
}
