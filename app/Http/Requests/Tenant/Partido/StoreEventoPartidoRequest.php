<?php

namespace App\Http\Requests\Tenant\Partido;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEventoPartidoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tenantId = $this->route('partido')?->tenant_id ?? auth()->user()?->tenant_id;

        $equipoDelTenant = Rule::exists('equipos', 'id')
            ->where('tenant_id', $tenantId);

        $jugadorDelTenant = Rule::exists('jugadores', 'id')
            ->where('tenant_id', $tenantId);

        return [
            'tipo' => [
                'required',
                Rule::in(['INICIO', 'ENTRETIEMPO', 'GOL', 'AUTOGOL', 'AMARILLA', 'ROJA', 'CAMBIO', 'FIN']),
            ],
            'minuto'             => ['nullable', 'integer', 'min:0', 'max:130'],
            'equipo_id'          => ['nullable', 'integer', $equipoDelTenant],
            'jugador_id'         => ['nullable', 'integer', $jugadorDelTenant],
            'jugador_ingresa_id' => ['nullable', 'integer', $jugadorDelTenant],
            'descripcion'        => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Validación de negocio: No se permite registrar eventos si el partido está finalizado.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $partido = $this->route('partido');

            if ($partido && $partido->estado === 'FINALIZADO') {
                $validator->errors()->add('tipo', 'No se pueden añadir eventos a un partido que ya ha sido finalizado.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'tipo.required' => 'El tipo de evento es obligatorio.',
            'tipo.in'       => 'El tipo de evento seleccionado no es válido.',
        ];
    }
}