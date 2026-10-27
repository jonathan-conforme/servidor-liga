<?php

namespace App\Models\SuperAdmin;

use Illuminate\Database\Eloquent\Model;

class Suscripcion extends Model
{
    protected $fillable = [
        'tenant_id',
        'plan_id',
        'fecha_inicio',
        'fecha_fin',
        'estado',
        'precio_pagado',

    ];

    protected $casts = [
        'fecha_inicio' => 'date:Y-m-d',
        'fecha_fin' => 'date:Y-m-d',
        'precio_pagado' => 'decimal:2',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }
    public function pagos()
{
    return $this->hasMany(Pago::class);
}
}
