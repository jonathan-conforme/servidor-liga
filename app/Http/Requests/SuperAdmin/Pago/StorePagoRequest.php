<?php

namespace App\Http\Requests\SuperAdmin\Pago;

use Illuminate\Foundation\Http\FormRequest;

class StorePagoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'tenant_id' => ['required', 'exists:tenants,id'],
            'suscripcion_id' => ['required', 'exists:suscripcions,id'],
            'plan_id' => 'required|exists:plans,id',
            'monto' => ['required','numeric','min:1',],
            //'limite_pago' => ['required', 'numeric', 'min:1'],
            'fecha_pago' => ['required','date',],
            'metodo_pago' => ['required',],
            'estado' => ['required',],
            'referencia' => ['nullable','string',],
            'observacion' => ['nullable','string',
            ],

        ];
    }
}
