<?php

namespace App\Models\Tenant;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventoPartido extends Model
{
    use HasFactory, BelongsToTenant;

    protected $table = 'eventos_partido';
    protected $guarded = ['id'];

    public function partido(): BelongsTo
    {
        return $this->belongsTo(Partido::class);
    }

    public function equipo(): BelongsTo
    {
        return $this->belongsTo(Equipo::class);
    }

    public function jugador(): BelongsTo
    {
        return $this->belongsTo(Jugador::class, 'jugador_id');
    }

    public function jugadorIngresa(): BelongsTo
    {
        return $this->belongsTo(Jugador::class, 'jugador_ingresa_id');
    }
}