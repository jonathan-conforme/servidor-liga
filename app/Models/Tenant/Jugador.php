<?php

namespace App\Models\Tenant;

use App\Enums\PosicionJugador;
use App\Traits\BelongsToTenant;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jugador extends Model
{
    use BelongsToTenant, HasFactory;

    protected $table = 'jugadores';

    protected $appends = ['edad', 'nombre_completo'];

    protected $guarded = ['id'];

    protected $casts = [
        'fecha_nacimiento' => 'date',
        'activo' => 'boolean',
        'posicion' => PosicionJugador::class, // Casteo automático al Enum de PHP
    ];

    public function getEdadAttribute(): int
    {
        // Carbon hace la magia de restar la fecha de nacimiento con la fecha de hoy
        return Carbon::parse($this->fecha_nacimiento)->age;
    }

    /**
     * Devuelve nombres y apellidos concatenados
     */
    public function getNombreCompletoAttribute(): string
    {
        $nombres = $this->nombres ?? $this->nombre ?? '';
        $apellidos = $this->apellidos ?? '';

        return trim("{$nombres} {$apellidos}");
    }
}
