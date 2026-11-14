<?php

namespace App\Http\Requests\Tenant\Torneo;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Http\Requests\Tenant\Torneo\Concerns\ValidaFormatoTorneo;
use Illuminate\Validation\Validator;

class StoreTorneoRequest extends FormRequest
{
       use ValidaFormatoTorneo;
        public function authorize(): bool { return true; }


    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return array_merge([
            'nombre' => ['required', 'string', 'max:255',
                Rule::unique('torneos')->where('tenant_id', auth()->user()->tenant_id)],
            'anio'         => ['required', 'integer', 'digits:4', 'min:2024'],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin'    => ['nullable', 'date', 'after_or_equal:fecha_inicio'],
        ], $this->reglasFormato());
    }
     public function withValidator(Validator $validator): void
    {
        $this->validarLlaves($validator);
    }
}
