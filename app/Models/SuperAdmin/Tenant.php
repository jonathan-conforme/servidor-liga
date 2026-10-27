<?php

namespace App\Models\SuperAdmin;

use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    protected $fillable = [
        'nombre',
        'subdominio',
        'logo',
        'activo',
        'slug',
        'email',
        'telefono',
        'direccion',
        'administrador',
        'cedula',
        'ciudad',
        'provincia',
        'canton',
        'activo'




    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
    public function suscripciones()
{
    return $this->hasMany(Suscripcion::class);
}
}
