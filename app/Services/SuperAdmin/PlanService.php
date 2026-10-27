<?php


namespace App\Services\SuperAdmin;

use App\Models\SuperAdmin\Plan;

class PlanService
{
    public function create(array $data): Plan
    {
        return Plan::create($data);
    }

    public function update(Plan $plan, array $data): Plan
    {
        $plan->update($data);
        return $plan;
    }

    public function delete(Plan $plan): ?bool
    {
        // Idealmente aquí validarías que el plan no tenga suscripciones activas antes de borrarlo
        return $plan->delete();
    }
}
