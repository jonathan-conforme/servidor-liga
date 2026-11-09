<?php

namespace App\Models\Tenant;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
class Partido extends Model
{
    use BelongsToTenant, HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'fecha_partido' => 'datetime',
        'goles_local' => 'integer',
        'goles_visitante' => 'integer',
    ];

    public function torneo(): BelongsTo
    {
        return $this->belongsTo(Torneo::class);
    }

    public function jornada(): BelongsTo
    {
        return $this->belongsTo(Jornada::class);
    }

    public function equipoLocal(): BelongsTo
    {
        return $this->belongsTo(Equipo::class, 'equipo_local_id');
    }

    public function equipoVisitante(): BelongsTo
    {
        return $this->belongsTo(Equipo::class, 'equipo_visitante_id');
    }

    public function arbitros(): BelongsToMany
    {
        return $this->belongsToMany(Arbitro::class, 'partido_arbitro')
            ->withPivot('rol', 'tenant_id')
            ->withTimestamps();
    }
    public function eventos(): HasMany
{
    return $this->hasMany(EventoPartido::class)->orderBy('id', 'asc');
}
}
