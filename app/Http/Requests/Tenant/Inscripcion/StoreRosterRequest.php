<?php

namespace App\Http\Requests\Tenant\Inscripcion;

use Illuminate\Foundation\Http\FormRequest;

class StoreRosterRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'equipo_torneo_id'            => ['required', 'exists:equipo_torneo,id'],
            'jugadores'                   => ['required', 'array'],
            'jugadores.*.jugador_id'      => ['required', 'exists:jugadores,id'],
            'jugadores.*.numero_camiseta' => ['nullable', 'integer', 'min:1', 'max:99'],
        ];
    }
}
