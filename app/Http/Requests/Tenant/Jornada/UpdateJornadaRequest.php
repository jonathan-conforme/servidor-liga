<?php

namespace App\Http\Requests\Tenant\Jornada;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateJornadaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre'            => ['nullable', 'string', 'max:100'],
            'fecha_programada'  => ['nullable', 'date'],
            'estado'            => ['required', 'string', Rule::in(['PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'SUSPENDIDA'])],
            'motivo_suspension' => ['nullable', 'required_if:estado,SUSPENDIDA', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'estado.in'                   => 'El estado seleccionado no es válido.',
            'motivo_suspension.required_if' => 'Debes explicar el motivo si marcas la jornada como SUSPENDIDA.',
        ];
    }
}
