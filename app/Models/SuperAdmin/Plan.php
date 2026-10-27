<?php

namespace App\Models\SuperAdmin;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'nombre',
        'descripcion',
        'precio',
        'duracion_dias',
        'limite_usuarios',
        'max_equipos',
        'max_jugadores',
        'max_torneos',
        'permite_noticias',
        'permite_galerias',
        'permite_estadisticas',
        'soporte_prioritario',
        'activo'
    ];
    protected $casts = [
        'activo' => 'boolean',
        'duracion_dias' => 'integer',
        'precio' => 'decimal:2',
    ];
    public function suscripciones()
{
    return $this->hasMany(Suscripcion::class);
}
}
