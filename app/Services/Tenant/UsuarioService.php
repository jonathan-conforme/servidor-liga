<?php

namespace App\Services\Tenant;

use App\Models\SuperAdmin\Suscripcion;
use App\Models\SuperAdmin\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UsuarioService
{
    public const ROLES_ASIGNABLES = ['Operador', 'Editor']; // 'Dirigente' en la fase 2

    public function cupo(int $tenantId): array
    {
        $suscripcion = Suscripcion::with('plan')
            ->where('tenant_id', $tenantId)
            ->where('estado', 'ACTIVA') // AJUSTA al valor real de tu columna estado
            ->whereDate('fecha_fin', '>=', now())
            ->latest('fecha_fin')
            ->first();

        return [
            'limite' => $suscripcion?->plan?->limite_usuarios,
            'usados' => $this->usados($tenantId),
        ];
    }

    public function crear(User $admin, array $data): User
    {
        return DB::transaction(function () use ($admin, $data) {
            Tenant::lockForUpdate()->find($admin->tenant_id);
            $this->verificarCupo((int) $admin->tenant_id);

            $usuario = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'cedula' => $data['cedula'],
                'telefono' => $data['telefono'] ?? null,
                'password' => $data['password'],
                'tenant_id' => $admin->tenant_id, // nunca del formulario
                'activo' => true,
            ]);

            $usuario->assignRole($data['rol']);
            $this->sincronizarPermisos($usuario, $data['permisos'] ?? []);

            return $usuario;
        });
    }

    public function actualizar(User $admin, User $usuario, array $data): User
    {
        $this->asegurarGestionable($admin, $usuario);

        $campos = collect($data)->only(['name', 'email', 'cedula', 'telefono'])->all();

        if (! empty($data['password'])) {
            $campos['password'] = $data['password'];
        }

        $usuario->update($campos);
        $usuario->syncRoles([$data['rol']]);
        $usuario->unsetRelation('roles');
        $this->sincronizarPermisos($usuario, $data['permisos'] ?? []);

        return $usuario;
    }

    public function cambiarEstado(User $admin, User $usuario): User
    {
        $this->asegurarGestionable($admin, $usuario);

        return DB::transaction(function () use ($admin, $usuario) {
            if (! $usuario->activo) {
                Tenant::lockForUpdate()->find($admin->tenant_id);
                $this->verificarCupo((int) $admin->tenant_id);
            }

            $usuario->update(['activo' => ! $usuario->activo]);

            return $usuario;
        });
    }

    private function usados(int $tenantId): int
    {
        return User::where('tenant_id', $tenantId)
            ->where('activo', true)
            ->role(self::ROLES_ASIGNABLES)
            ->count();
    }

    private function verificarCupo(int $tenantId): void
    {
        $cupo = $this->cupo($tenantId);

        if ($cupo['limite'] === null) {
            throw ValidationException::withMessages([
                'usuario' => 'La liga no tiene una suscripción activa.',
            ]);
        }

        if ($cupo['usados'] >= $cupo['limite']) {
            throw ValidationException::withMessages([
                'usuario' => "Tu plan permite {$cupo['limite']} usuario(s) adicional(es). Desactiva uno o mejora tu plan.",
            ]);
        }
    }

    private function asegurarGestionable(User $admin, User $usuario): void
    {
        abort_unless((int) $usuario->tenant_id === (int) $admin->tenant_id, 404);

        if ($usuario->id === $admin->id || ! $usuario->hasAnyRole(self::ROLES_ASIGNABLES)) {
            throw ValidationException::withMessages([
                'usuario' => 'No puedes modificar este usuario.',
            ]);
        }
    }

    public static function permisosAsignables(): array
    {
        $lista = [];
        foreach (config('permisos.modulos') as $modulo => $def) {
            foreach (array_keys($def['acciones']) as $accion) {
                $lista[] = "{$modulo}.{$accion}";
            }
        }

        return $lista;
    }

    // Guarda solo lo que NO viene ya del rol
    private function sincronizarPermisos(User $usuario, array $permisos): void
    {
        $delRol = $usuario->getPermissionsViaRoles()->pluck('name')->all();
        $usuario->syncPermissions(array_values(array_diff($permisos, $delRol)));
    }
}
