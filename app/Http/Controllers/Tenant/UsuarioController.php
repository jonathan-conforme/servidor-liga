<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\Usuario\StoreUsuarioRequest;
use App\Http\Requests\Tenant\Usuario\UpdateUsuarioRequest;
use App\Models\User;
use App\Services\Tenant\UsuarioService;
use Inertia\Inertia;

class UsuarioController extends Controller
{
    public function __construct(protected UsuarioService $service) {}

    public function index()
    {
        $admin = auth()->user();

        $usuarios = User::where('tenant_id', $admin->tenant_id)
            ->with('roles:id,name')
            ->orderBy('name')
            ->get()
            ->map(fn (User $u) => [
                'id'       => $u->id,
                'name'     => $u->name,
                'email'    => $u->email,
                'cedula'   => $u->cedula,
                'telefono' => $u->telefono,
                'activo'   => (bool) $u->activo,
                'rol'      => $u->roles->first()?->name,
                'es_yo'    => $u->id === $admin->id,
                'permisos' => $u->getAllPermissions()->pluck('name')->values(),
            ]);

        return Inertia::render('Tenant/Usuarios/Index', [
            'usuarios' => $usuarios,
            'roles'    => UsuarioService::ROLES_ASIGNABLES,
            'cupo'     => $this->service->cupo((int) $admin->tenant_id),
            'catalogo'   => config('permisos.modulos'),
            'porRol'     => array_merge(
                ['Operador' => [], 'Editor' => []],
                config('permisos.roles')
            ),
        ]);
    }

    public function store(StoreUsuarioRequest $request)
    {
        $this->service->crear($request->user(), $request->validated());

        return back()->with('success', 'Usuario creado correctamente.');
    }

    public function update(UpdateUsuarioRequest $request, User $usuario)
    {
        $this->service->actualizar($request->user(), $usuario, $request->validated());

        return back()->with('success', 'Usuario actualizado correctamente.');
    }

    public function estado(User $usuario)
    {
        $u = $this->service->cambiarEstado(auth()->user(), $usuario);

        return back()->with('success', $u->activo ? 'Usuario activado.' : 'Usuario desactivado.');
    }
}
