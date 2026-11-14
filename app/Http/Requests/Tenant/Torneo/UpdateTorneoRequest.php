<?php

namespace App\Http\Requests\Tenant\Torneo;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Tenant\Partido;
use App\Http\Requests\Tenant\Torneo\Concerns\ValidaFormatoTorneo;
use Illuminate\Validation\Validator;

class UpdateTorneoRequest extends FormRequest
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
    return array_merge([
        'nombre' => ['required', 'string', 'max:255',
            Rule::unique('torneos')->where('tenant_id', auth()->user()->tenant_id)
                ->ignore($this->route('torneo'))],
        'anio'         => ['required', 'integer', 'digits:4', 'min:2024'],
        'fecha_inicio' => ['required', 'date'],
        'fecha_fin'    => ['nullable', 'date', 'after_or_equal:fecha_inicio'],
        'estado'       => ['required', 'in:BORRADOR,INSCRIPCIONES,EN_CURSO,FINALIZADO'],
    ], $this->reglasFormato());
}

public function withValidator(Validator $validator): void
{
    $this->validarLlaves($validator);

    $validator->after(function (Validator $v) {
        $torneo = $this->route('torneo');

        if (! Partido::where('torneo_id', $torneo->id)->exists()) {
            return;
        }

        $cambio = $this->input('tipo_competicion') !== $torneo->tipo_competicion
            || (int) $this->input('cantidad_grupos') !== (int) $torneo->cantidad_grupos
            || (int) $this->input('clasificados_por_grupo') !== (int) $torneo->clasificados_por_grupo;

        if ($cambio) {
            $v->errors()->add('tipo_competicion',
                'El fixture ya fue generado: no se puede cambiar el formato, los grupos ni los clasificados.');
        }
    });
}
}
