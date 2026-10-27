<?php

namespace App\Http\Requests\Tenant\Jugador;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use App\Enums\PosicionJugador;
use Illuminate\Validation\Rule;
use App\Rules\CedulaEcuadorRule;

class StoreJugadorRequest extends FormRequest
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
            'nombres' => ['required', 'string', 'max:255'],
            'apellidos' => ['required', 'string', 'max:255'],
            'fecha_nacimiento' => ['required', 'date', 'before:today'],
            'posicion' => ['nullable', Rule::enum(PosicionJugador::class)],
            'foto' => ['nullable', 'string'],
            'activo' => ['boolean'],
            'cedula' => [
                'string',
                new CedulaEcuadorRule(), // <-- AQUÍ SE EJECUTA TU ALGORITMO ECUATORIANO
                Rule::unique('jugadores')->where(function ($query) {
                    return $query->where('tenant_id', session('tenant_id') ?? auth()->user()->tenant_id);
                }),
            ],
        ];
    }
}
