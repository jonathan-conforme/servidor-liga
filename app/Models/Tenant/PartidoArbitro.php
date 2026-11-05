<?php

namespace App\Models\Tenant;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartidoArbitro extends Model
{
    use BelongsToTenant;

    protected $table = 'partido_arbitro';
    protected $guarded = ['id'];

    public function partido(): BelongsTo
    {
        return $this->belongsTo(Partido::class);
    }

    public function arbitro(): BelongsTo
    {
        return $this->belongsTo(Arbitro::class);
    }
}
