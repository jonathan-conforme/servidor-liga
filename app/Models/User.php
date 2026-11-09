<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use App\Models\SuperAdmin\Tenant;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasRoles, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'cedula',
        'telefono',
        'activo',
        'tenant_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
             'activo' => 'boolean',
        ];
    }
    public function tenant(): BelongsTo
{
    return $this->belongsTo(Tenant::class);
}

public function homeRoute(): string
{
    return match (true) {
        $this->hasRole('Super Admin')             => route('dashboard'),
        $this->hasRole('Administrador Liga')      => route('tenant.torneos.index'),
        $this->hasAnyRole(['Operador', 'Editor']) => route('tenant.partidos.index'),
        $this->hasRole('Dirigente')               => route('portal.dashboard'),
        default                                   => route('dashboard'),
    };
}
}
