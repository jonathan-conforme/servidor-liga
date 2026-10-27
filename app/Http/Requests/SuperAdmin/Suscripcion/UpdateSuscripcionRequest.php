<?php

namespace App\Http\Requests\SuperAdmin\Suscripcion;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSuscripcionRequest extends FormRequest
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

        ];
    }

    /**
     * Sanitizar los datos antes de pasar por las reglas de validación.
     */
    protected function prepareForValidation()
    {
        if ($this->fecha_inicio) {
            $this->merge([
                'fecha_inicio' => date('Y-m-d', strtotime($this->fecha_inicio)),
            ]);
        }
    }
}
