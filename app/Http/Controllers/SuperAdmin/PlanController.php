<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\Plan\StorePlanRequest;
use App\Http\Requests\SuperAdmin\Plan\UpdatePlanRequest;
use App\Models\SuperAdmin\Plan;
use App\Services\SuperAdmin\PlanService;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function __construct(
        protected PlanService $service
    ) {}

    public function index()
    {
        return Inertia::render(
            'SuperAdmin/Plans/Index',
            [
                'planes' => Plan::latest()->paginate(10),
            ]
        );
    }

    public function create()
    {
        return Inertia::render('SuperAdmin/Plans/Create');
    }

    public function store(StorePlanRequest $request)
    {
        $this->service->create(
            $request->validated()
        );

        return redirect()->route('superadmin.plan.index')->with('success', 'Plan creado correctamente'
        );
    }

    public function edit(Plan $plan)
    {
        // Pasamos el plan como prop a la vista
        return Inertia::render('SuperAdmin/Plans/Edit', [
            'plan' => $plan,
        ]);
    }

    public function update(UpdatePlanRequest $request, Plan $plan)
    {
        $this->service->update($plan, $request->validated());

        return redirect()->route('superadmin.plan.index')
            ->with('success', 'Plan actualizado correctamente');

    }

    public function destroy(Plan $plan)
    {
        $this->service->delete($plan);

        return back()->with(
            'success',
            'Plan eliminado'
        );
    }
}
