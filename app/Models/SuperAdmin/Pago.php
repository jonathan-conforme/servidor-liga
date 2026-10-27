<?php

namespace App\Models\SuperAdmin;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pago extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'suscripcion_id',
        'plan_id',
        'monto',
        'referencia',
        'fecha_pago',
        'metodo_pago',
        'estado',
        'observacion',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'fecha_pago' => 'datetime',
    ];

    public function tenant ()
        {
            return $this->belongsTo(Tenant::class);
        }

    public function suscripcion()
    {
        return $this->belongsTo(Suscripcion::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }
}
