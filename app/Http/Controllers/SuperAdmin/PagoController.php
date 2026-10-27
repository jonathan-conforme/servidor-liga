<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Requests\SuperAdmin\Pago\StorePagoRequest;
use App\Http\Requests\SuperAdmin\Pago\UpdatePagoRequest;
use App\Services\SuperAdmin\PagoService;
use App\Http\Controllers\Controller;
use App\Models\SuperAdmin\Suscripcion;
use App\Models\SuperAdmin\Pago;
use App\Models\SuperAdmin\Tenant;
use Inertia\Inertia;

class PagoController extends Controller
{
    public function __construct(
        protected PagoService $service
    ) {}

    public function index()
    {
        // 💡 CONSEJO: Usamos 'with' para traer los datos amarrados en una sola consulta SQL
        $pagos = Pago::with(['suscripcion.tenant', 'suscripcion.plan'])
            ->latest() // Opcional: Para mostrar los pagos más recientes primero
            ->paginate(15);

        return Inertia::render('SuperAdmin/Pagos/Index', [
            'pagos' => $pagos
        ]);
    }


    public function create()
    {
        return Inertia::render(
            'SuperAdmin/Pagos/Create',
            [

                'tenants' =>
                    Tenant::orderBy('nombre')
                    ->get(),

                'suscripciones' =>
                    Suscripcion::with([
                        'tenant',
                        'plan'
                    ])
                    ->get(),

            ]
        );
    }

    public function store(
        StorePagoRequest $request
    ) {
        $this->service->create(
            $request->validated()
        );

        return redirect()
            ->route(
                'superadmin.pagos.index'
            )
            ->with(
                'success',
                'Pago registrado correctamente'
            );
    }

    public function edit(
        Pago $pago
    ) {
        return Inertia::render(
            'SuperAdmin/Pagos/Edit',
            [

                'pago' => $pago,

                'tenants' =>
                    Tenant::all(),

                'suscripciones' =>
                    Suscripcion::all(),

            ]
        );
    }

    public function update(
        UpdatePagoRequest $request,
        Pago $pago
    ) {
        $this->service->update(
            $pago,
            $request->validated()
        );

        return redirect()
            ->route(
                'superadmin.pagos.index'
            )
            ->with(
                'success',
                'Pago actualizado'
            );
    }

    public function destroy(
        Pago $pago
    ) {
        $this->service->delete(
            $pago
        );

        return back()->with(
            'success',
            'Pago eliminado'
        );
    }

    public function aprobar(
        Pago $pago
    ) {
        $this->service->aprobar(
            $pago
        );

        return back()->with(
            'success',
            'Pago aprobado'
        );
    }

    public function anular(
        Pago $pago
    ) {
        $this->service->anular(
            $pago
        );

        return back()->with(
            'warning',
            'Pago anulado'
        );
    }
}
