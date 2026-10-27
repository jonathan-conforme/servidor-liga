<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EquipoTorneoJugador extends Model
{
    // Define explícitamente la tabla pivote de jugadores
    protected $table = 'equipo_torneo_jugador';

    protected $guarded = ['id'];

    public function equipoTorneo(): BelongsTo
    {
        return $this->belongsTo(EquipoTorneo::class, 'equipo_torneo_id');
    }

    public function jugador(): BelongsTo
    {
        return $this->belongsTo(Jugador::class, 'jugador_id');
    }
}
