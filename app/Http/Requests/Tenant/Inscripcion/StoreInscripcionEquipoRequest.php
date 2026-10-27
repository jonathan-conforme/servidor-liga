<?php

namespace App\Http\Requests\Tenant\Inscripcion;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInscripcionEquipoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'torneo_id'    => ['required', 'integer', 'exists:torneos,id'],
            'categoria_id' => ['required', 'integer', 'exists:categorias,id'],
            'equipo_id'    => [
                'required',
                'integer',
                'exists:equipos,id',
                // Validar que la combinación (equipo_id, torneo_id, categoria_id) no esté repetida en la BD
                Rule::unique('equipo_torneo', 'equipo_id')
                    ->where('torneo_id', $this->input('torneo_id'))
                    ->where('categoria_id', $this->input('categoria_id')),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'equipo_id.unique' => 'Este equipo ya se encuentra inscrito en este torneo con la categoría seleccionada.',
        ];
    }
}
