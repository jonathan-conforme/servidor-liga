<?php

namespace App\Http\Requests\SuperAdmin\Tenant;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use App\Rules\CedulaEcuadorRule;

class StoreTenantRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
   public function rules(): array
{
    return [
        'nombre'        => ['required', 'string', 'max:255'],
        'slug'          => ['required', 'string', 'unique:tenants,slug', 'max:255'],
        'subdominio'    => ['required', 'string', 'unique:tenants,subdominio', 'max:255'],

        // Validamos que el email sea único en TENANTS y también en USERS
        'email'         => ['required', 'email', 'unique:tenants,email', 'unique:users,email', 'max:255'],

        // Validamos que la cédula sea única en TENANTS y también en USERS, más la regla de Ecuador
        'cedula'        => ['required', 'unique:tenants,cedula', 'unique:users,cedula', new CedulaEcuadorRule()],

        'logo'          => ['nullable', 'string'],
        'telefono'      => ['nullable', 'string', 'max:15'],

        // Cambiado a REQUIRED porque un Tenant necesita obligatoriamente un nombre para crear su cuenta de usuario
        'administrador' => ['required', 'string', 'max:255'],

        'ciudad'        => ['nullable', 'string', 'max:255'],
        'provincia'     => ['nullable', 'string', 'max:255'],
        'canton'        => ['nullable', 'string', 'max:255'],
        'activo'        => ['boolean'],
    ];
}
}
