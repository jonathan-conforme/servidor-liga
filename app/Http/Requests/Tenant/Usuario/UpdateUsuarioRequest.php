<?php

namespace App\Http\Requests\Tenant\Usuario;

use App\Services\Tenant\UsuarioService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('usuario')->id;

        return [
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($id)],
            'cedula'   => ['required', 'string', 'max:20', Rule::unique('users', 'cedula')->ignore($id)],
            'telefono' => ['nullable', 'string', 'max:20'],
            'rol'      => ['required', Rule::in(UsuarioService::ROLES_ASIGNABLES)],
            'password' => ['nullable', Password::min(8)],
            'permisos'   => ['nullable', 'array'],
            'permisos.*' => ['string', Rule::in(UsuarioService::permisosAsignables())],
        ];
    }
}
