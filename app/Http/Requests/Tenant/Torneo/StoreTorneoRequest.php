<?php

namespace App\Http\Requests\Tenant\Torneo;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTorneoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nombre' => [
                'required',
                'string',
                'max:255',
                Rule::unique('torneos')->where('tenant_id', auth()->user()->tenant_id)
            ],
            'anio'                   => ['required', 'integer', 'digits:4', 'min:2024'],
            'fecha_inicio'           => ['required', 'date'],
            'fecha_fin'              => ['nullable', 'date', 'after_or_equal:fecha_inicio'],
            'tipo_competicion'       => ['required', 'in:LIGA,GRUPOS_ELIMINACION,ELIMINACION_DIRECTA'],
            'cantidad_grupos'        => ['nullable', 'integer', 'min:1'],
            'clasificados_por_grupo' => ['nullable', 'integer', 'min:1'],
            'ida_vuelta'             => ['boolean'],
            'gol_visitante'          => ['boolean'],
            'penales'                => ['boolean'],
            'final_ida_vuelta'       => ['boolean'],
        ];
    }
}
