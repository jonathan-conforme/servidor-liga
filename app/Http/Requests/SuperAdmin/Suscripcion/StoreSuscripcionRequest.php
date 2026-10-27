<?php

namespace App\Http\Requests\SuperAdmin\Suscripcion;

use Illuminate\Foundation\Http\FormRequest;

class StoreSuscripcionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tenant_id' => ['required', 'exists:tenants,id'],
            'plan_id' => ['required', 'exists:plans,id'],


            'fecha_inicio' => ['required', 'date_format:Y-m-d'],

            'estado' => ['required', 'in:ACTIVA,VENCIDA,SUSPENDIDA,CANCELADA'],
            'precio_pagado' => ['required', 'numeric'],
        ];
    }

    /**
     * Sanitizar los datos antes de que pasen por la validación.
     */
    protected function prepareForValidation()
    {
          $this->merge([
            'fecha_inicio' => $this->fecha_inicio ? date('Y-m-d', strtotime($this->fecha_inicio)) : null,
        ]);
    }
}
