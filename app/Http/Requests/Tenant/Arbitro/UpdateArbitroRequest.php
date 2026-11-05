<?php

namespace App\Http\Requests\Tenant\Arbitro;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateArbitroRequest extends FormRequest
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
                Rule::unique('arbitros', 'cedula')
                    ->where('tenant_id', $this->route('arbitro')->tenant_id)
                    ->ignore($this->route('arbitro')->id),
            ],
            'telefono'  => ['nullable', 'string', 'max:20'],
            'email'     => ['nullable', 'email', 'max:150'],
            'activo'    => ['boolean'],
        ];
    }
}
