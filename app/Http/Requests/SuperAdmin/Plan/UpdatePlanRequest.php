<?php

namespace App\Http\Requests\SuperAdmin\Plan;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'max:255'],
            'descripcion' => ['nullable'],
            'precio' => ['required', 'numeric'],
            'limite_usuarios' => ['required','integer'],
            'max_equipos' => ['required', 'integer'],
            'max_jugadores' => ['required', 'integer'],
            'max_torneos' => ['required', 'integer'],
            'permite_noticias' => ['boolean'],
            'permite_galerias' => ['boolean'],
            'permite_estadisticas' => ['boolean'],
            'soporte_prioritario' => ['boolean'],
            'activo' => ['boolean'],
        ];
    }

    /**
     * 🛠️ TRANSFORMA LOS BOOLEANOS DE REACT A ENTEROS PARA LA BD
     */
    protected function passedValidation()
    {
        $this->merge([
            'permite_noticias'     => $this->boolean('permite_noticias') ? 1 : 0,
            'permite_galerias'     => $this->boolean('permite_galerias') ? 1 : 0,
            'permite_estadisticas' => $this->boolean('permite_estadisticas') ? 1 : 0,
            'soporte_prioritario'  => $this->boolean('soporte_prioritario') ? 1 : 0,
            'activo'               => $this->boolean('activo') ? 1 : 0,
        ]);
    }
}
