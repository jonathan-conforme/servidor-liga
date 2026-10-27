<?php

namespace App\Http\Requests\SuperAdmin\Plan;

use Illuminate\Foundation\Http\FormRequest;

class StorePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required','max:255'],
            'descripcion' => ['nullable'],
            'precio' => ['required','numeric'],
            'limite_usuarios' => ['required','integer'],
            'max_equipos' => ['required','integer'],
            'max_jugadores' => ['required','integer'],
            'max_torneos' => ['required','integer'],
            'permite_noticias' => ['boolean'],
            'permite_galerias' => ['boolean'],
            'permite_estadisticas' => ['boolean'],
            'soporte_prioritario' => ['boolean'],

        ];
    }
}
