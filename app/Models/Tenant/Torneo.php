<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;

class Torneo extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $table = 'torneos';

    protected $guarded = ['id'];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'ida_vuelta' => 'boolean',
        'gol_visitante' => 'boolean',
        'penales' => 'boolean',
        'final_ida_vuelta' => 'boolean',
    ];

    public function grupos()
    {
        return $this->hasMany(Grupo::class);
    }

    public function equipoTorneos()
    {
        return $this->hasMany(EquipoTorneo::class);
    }
}
