<?php

namespace App\Http\Requests\Tenant\Equipo;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEquipoRequest extends FormRequest
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
            'nombre' => [
                'required',
                'string',
                'max:255',
                // Valida unicidad ignorando el equipo actual que se está editando
                Rule::unique('equipos')
                    ->where('tenant_id', auth()->user()->tenant_id)
                    ->ignore($this->route('equipo'))
            ],
            'presidente'        => ['nullable', 'string', 'max:255'],
            'director_tecnico'  => ['nullable', 'string', 'max:255'],
            'telefono'          => ['nullable', 'string', 'max:50'],
            'email'             => ['nullable', 'email', 'max:255'],
            'activo'            => ['boolean'],
            'escudo'            => ['nullable', 'string']
        ];
    }
}
