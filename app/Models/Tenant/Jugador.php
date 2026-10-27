<?php

namespace App\Models\Tenant;

use App\Enums\PosicionJugador;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class Jugador extends Model
{
    use HasFactory, BelongsToTenant;

    protected $table = 'jugadores';
    protected $appends = ['edad'];

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
}
