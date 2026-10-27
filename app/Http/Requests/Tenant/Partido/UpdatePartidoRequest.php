<?php

namespace App\Http\Requests\Tenant\Partido;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePartidoRequest extends FormRequest
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
            'fecha_partido'   => ['nullable', 'date'],
            'cancha'          => ['nullable', 'string', 'max:150'],
            'goles_local'     => ['nullable', 'integer', 'min:0'],
            'goles_visitante' => ['nullable', 'integer', 'min:0'],
            'estado'          => ['required', 'string', Rule::in(['PROGRAMADO', 'EN_JUEGO', 'FINALIZADO', 'SUSPENDIDO'])],
        ];
    }
}
