<?php

namespace App\Http\Requests\Tenant\Torneo\Concerns;

use Illuminate\Validation\Validator;

trait ValidaFormatoTorneo
{
    protected function prepareForValidation(): void
    {
        // En LIGA y ELIMINACION_DIRECTA los grupos no aplican: se limpian
        if ($this->input('tipo_competicion') !== 'GRUPOS_ELIMINACION') {
            $this->merge(['cantidad_grupos' => null, 'clasificados_por_grupo' => null]);
        }
    }

    protected function reglasFormato(): array
    {
        return [
            'tipo_competicion'       => ['required', 'in:LIGA,GRUPOS_ELIMINACION,ELIMINACION_DIRECTA'],
            'cantidad_grupos'        => ['nullable', 'required_if:tipo_competicion,GRUPOS_ELIMINACION', 'integer', 'min:2', 'max:26'],
            'clasificados_por_grupo' => ['nullable', 'required_if:tipo_competicion,GRUPOS_ELIMINACION', 'integer', 'min:1', 'max:4'],
            'ida_vuelta'             => ['boolean'],
            'gol_visitante'          => ['boolean'],
            'penales'                => ['boolean'],
            'final_ida_vuelta'       => ['boolean'],
        ];
    }

    protected function validarLlaves(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            if ($this->input('tipo_competicion') !== 'GRUPOS_ELIMINACION' || $v->errors()->any()) {
                return;
            }

            $total = (int) $this->input('cantidad_grupos') * (int) $this->input('clasificados_por_grupo');

            // MVP: el bracket solo cuadra con potencias de 2
            if ($total < 2 || ($total & ($total - 1)) !== 0) {
                $v->errors()->add(
                    'clasificados_por_grupo',
                    "Pasarían {$total} equipos a la fase final y las llaves necesitan 2, 4, 8 o 16. Ajusta grupos o clasificados."
                );
            }
        });
    }
}
