<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EquipoTorneo extends Model
{
    use HasFactory,BelongsToTenant;

    protected $table = 'equipo_torneo';

    protected $fillable = [
        'torneo_id',
        'equipo_id',
        'categoria_id',
        'grupo_id',
    ];

    public function torneo(): BelongsTo
    {
        return $this->belongsTo(Torneo::class);
    }

    public function equipo(): BelongsTo
    {
        return $this->belongsTo(Equipo::class);
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }

    public function grupo(): BelongsTo
    {
        return $this->belongsTo(Grupo::class);
    }
    public function roster(): HasMany
    {
        return $this->hasMany(EquipoTorneoJugador::class, 'equipo_torneo_id');
    }

    public function jugadores(): BelongsToMany
    {
        return $this->belongsToMany(Jugador::class, 'equipo_torneo_jugador', 'equipo_torneo_id', 'jugador_id')
                    ->withPivot('numero_camiseta')
                    ->withTimestamps();
    }
}
