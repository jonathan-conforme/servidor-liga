<?php

namespace App\Http\Requests\Tenant\Categoria;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoriaRequest extends FormRequest
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
                // Ignora la categoría que estamos editando actualmente para no dar error de "ya existe"
                Rule::unique('categorias')
                    ->where('tenant_id', auth()->user()->tenant_id)
                    ->ignore($this->route('categoria'))
            ],
            'descripcion' => ['nullable', 'string'],
            'edad_min'    => ['nullable', 'integer', 'min:4', 'max:99'],
            'edad_max'    => ['nullable', 'integer', 'min:4', 'max:99', 'gte:edad_min'],
            'activo'      => ['boolean'],
        ];
    }
}
