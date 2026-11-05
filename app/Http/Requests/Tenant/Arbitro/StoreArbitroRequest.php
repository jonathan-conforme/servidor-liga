<?php

namespace App\Http\Requests\Tenant\Arbitro;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreArbitroRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombres'   => ['required', 'string', 'max:100'],
            'apellidos' => ['required', 'string', 'max:100'],
            'cedula'    => [
                'required', 'string', 'max:20',
                Rule::unique('arbitros', 'cedula')->where('tenant_id', auth()->user()->tenant_id),
            ],
            'telefono'  => ['nullable', 'string', 'max:20'],
            'email'     => ['nullable', 'email', 'max:150'],
            'activo'    => ['boolean'],
        ];
    }
}
