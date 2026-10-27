<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Torneo;
use App\Http\Requests\Tenant\Torneo\StoreTorneoRequest;
use App\Http\Requests\Tenant\Torneo\UpdateTorneoRequest;
use App\Services\Tenant\TorneoService;
use Inertia\Inertia;

class TorneoController extends Controller
{
    protected $torneoService;

    public function __construct(TorneoService $torneoService)
    {
        $this->torneoService = $torneoService;
    }

    public function index()
    {
        return Inertia::render('Tenant/Torneos/Index', [
            'torneos' => $this->torneoService->index()
        ]);
    }

    public function store(StoreTorneoRequest $request)
    {
        $this->torneoService->create($request->validated());

        return back()->with('success', 'Torneo creado exitosamente.');
    }

    public function update(UpdateTorneoRequest $request, Torneo $torneo)
    {
        $this->torneoService->update($torneo, $request->validated());

        return back()->with('info', 'Torneo actualizado exitosamente.');
    }

    public function destroy(Torneo $torneo)
    {
        $this->torneoService->destroy($torneo);

        return back()->with('success', 'Torneo eliminado exitosamente.');
    }
}
