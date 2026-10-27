<?php

namespace App\Http\Requests\SuperAdmin\Tenant;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use App\Rules\CedulaEcuadorRule;

class UpdateTenantRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Cambiado a true para permitir la actualización de tenants
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Obtenemos el ID del tenant desde la ruta
        $tenantId = $this->route('tenant')->id;

        return [
            'nombre'        => ['required', 'string', 'max:255'],
            'slug'          => ['required', 'string', "unique:tenants,slug,{$tenantId}", 'max:255'],
            'subdominio'    => ['required', 'string', "unique:tenants,subdominio,{$tenantId}", 'max:255'],
            'email'         => ['required', 'email', "unique:tenants,email,{$tenantId}", 'max:255'],
            'cedula'        => ['required', "unique:tenants,cedula,{$tenantId}", new CedulaEcuadorRule()],
            'logo'          => ['nullable', 'string'],
            'telefono'      => ['nullable', 'string', 'max:20'],
            'administrador' => ['nullable', 'string', 'max:255'],
            'ciudad'        => ['nullable', 'string', 'max:255'],
            'provincia'     => ['nullable', 'string', 'max:255'],
            'canton'        => ['nullable', 'string', 'max:255'],
            'activo'        => ['boolean'],
        ];
    }
}
