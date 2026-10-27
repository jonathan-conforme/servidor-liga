<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\Suscripcion\StoreSuscripcionRequest;
use App\Http\Requests\SuperAdmin\Suscripcion\UpdateSuscripcionRequest;
use App\Models\SuperAdmin\Plan;
use App\Models\SuperAdmin\Suscripcion;
use App\Models\SuperAdmin\Tenant;
use App\Services\SuperAdmin\SuscripcionService;
use Inertia\Inertia;

class SuscripcionController extends Controller
{
    public function __construct(
        protected SuscripcionService $service
    ) {}

    public function index()
    {
        return Inertia::render(
            'SuperAdmin/Suscripciones/Index',
            [
                'suscripciones' => Suscripcion::with([
                    'tenant',
                    'plan',
                ])
                    ->latest()
                    ->paginate(10),

                'tenants' => Tenant::all(),

                'planes' => Plan::all(),
            ]
        );
    }

    public function create()
    {
        return Inertia::render(
            'SuperAdmin/Suscripciones/Create',
            [

                'tenants' => Tenant::all(),

                'planes' => Plan::all(),

            ]
        );
    }

    public function store(
        StoreSuscripcionRequest $request
    ) {
        $this->service->create(
            $request->validated()
        );

        return redirect()
        ->route('superadmin.suscripciones.index')
        ->with('success', 'Suscripción creada correctamente.');

    }

    public function edit(Suscripcion $suscripcion) // Asegúrate que se llame exactamente $suscripcion
{
    return Inertia::render('SuperAdmin/Suscripciones/Edit', [
        'suscripcion' => $suscripcion, // Esto llenará las fechas y el precio
        'tenants'     => Tenant::all(),
        'planes'      => Plan::all(),
    ]);
}

public function update(
    UpdateSuscripcionRequest $request,
    Suscripcion $suscripcion //  Cámbialo a $suscripcion (en singular perfecto)
) {
    // Llama al método que acabamos de asegurar en el Servicio
    $this->service->update(
        $suscripcion,
        $request->validated()
    );

    return redirect()
        ->route('superadmin.suscripciones.index')
        ->with('info', 'Suscripción actualizada correctamente.');
}

    public function suspender(
        Suscripcion $suscripcion
    ) {
        $this->service->suspender(
            $suscripcion
        );

        return back()->with(
            'warning',
            'Suscripción suspendida'
        );
    }

    public function activar(
        Suscripcion $suscripcion
    ) {
        $this->service->activar(
            $suscripcion
        );

        return back()->with(
            'success',
            'Suscripción activada'
        );
    }

    public function cancelar(
        Suscripcion $suscripcion
    ) {
        $this->service->cancelar(
            $suscripcion
        );

        return back()->with(
            'error',
            'Suscripción cancelada'
        );
    }
}
