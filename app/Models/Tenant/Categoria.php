<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class Categoria extends Model
{
   use BelongsToTenant;
   protected $guarded = ['id'];

    protected $casts = [
        'activo' => 'boolean',
    ];

    public function equiposTorneo()
    {
        return $this->hasMany(EquipoTorneo::class);
    }

}
