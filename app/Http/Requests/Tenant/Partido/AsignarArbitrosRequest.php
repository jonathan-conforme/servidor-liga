<?php

namespace App\Http\Requests\Tenant\Partido;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AsignarArbitrosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Rule::exists ignora el TenantScope, por eso se filtra a mano
        $arbitroDelTenant = Rule::exists('arbitros', 'id')
            ->where('tenant_id', $this->route('partido')->tenant_id)
            ->where('activo', true);

        return [
            'PRINCIPAL'   => ['required', 'integer', $arbitroDelTenant],
            'ASISTENTE_1' => ['nullable', 'integer', $arbitroDelTenant],
            'ASISTENTE_2' => ['nullable', 'integer', $arbitroDelTenant],
            'CUARTO'      => ['nullable', 'integer', $arbitroDelTenant],
        ];
    }

    public function messages(): array
    {
        return [
            'PRINCIPAL.required' => 'El árbitro principal es obligatorio.',
        ];
    }
}
