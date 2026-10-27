<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Requests\SuperAdmin\Tenant\StoreTenantRequest;
use App\Http\Requests\SuperAdmin\Tenant\UpdateTenantRequest;
use App\Services\SuperAdmin\TenantService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SuperAdmin\Tenant;
use Inertia\Inertia;

class TenantController extends Controller
{
    protected $service;

    // Inyectamos el servicio al inicializar el controlador
    public function __construct(TenantService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render(
            'SuperAdmin/Tenants/Index',
            [
                'tenants' => $this->service->getAll(),
            ]
        );
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render(
            'SuperAdmin/Tenants/Create'
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTenantRequest $request)
    {
        // Enviamos al servicio únicamente los datos que pasaron la validación
        $this->service->create($request->validated());

        return redirect()
            ->route('superadmin.tenants.index')
            ->with('success', 'Liga creada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Tenant $tenant)
    {
          return Inertia::render('SuperAdmin/Tenants/Show', [
            'tenant' => $tenant
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tenant $tenant)
    {
        return Inertia::render(
            'SuperAdmin/Tenants/Edit',
            compact('tenant')
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTenantRequest $request, Tenant $tenant)
    {
        // Enviamos solo los datos validados ignorando los campos únicos del propio Tenant
        $this->service->update($tenant, $request->validated());

        return redirect()
            ->route('superadmin.tenants.index')
            ->with('info', 'Liga actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tenant $tenant)
    {
        $this->service->delete($tenant);

        return back()->with('success', 'Liga eliminada exitosamente.');
    }
}
