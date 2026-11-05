<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;



class Arbitro extends Model
{
use HasFactory, BelongsToTenant;

    protected $guarded = ['id'];

    protected $casts = [
        'activo' => 'boolean',
    ];

    public function partidos(): BelongsToMany
    {
        return $this->belongsToMany(Partido::class, 'partido_arbitro')
            ->withPivot('rol', 'tenant_id')
            ->withTimestamps();
    }
}
