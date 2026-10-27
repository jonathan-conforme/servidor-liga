<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class Equipo extends Model
{
    use BelongsToTenant;

    protected $guarded = ['id'];

    protected $casts = [
        'activo' => 'boolean',
    ];

    /**
 * Relación: Un equipo participa en muchas categorías
 */
public function categorias()
{
    // Laravel buscará una tabla intermedia (ej. categoria_equipo o la que definas)
    return $this->belongsToMany(Categoria::class, 'categoria_equipo');
}
}
