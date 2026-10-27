<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckTenantSubscription
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        // Si el usuario está logueado y pertenece a un Tenant (Liga)
        if ($user && $user->tenant_id) {

            // Buscamos la última suscripción activa de este tenant
            
            $tieneSuscripcionActiva = \DB::table('suscripcions')
                ->where('tenant_id', $user->tenant_id)
                ->where('fecha_fin', '>=', now()) // Que no esté vencida por fecha
                ->where('estado', '=', 'ACTIVA')  // Que el estado sea estrictamente ACTIVA
                ->exists();

            // Si NO tiene una suscripción que cumpla esto, se activa el bloqueo en React
            if (! $tieneSuscripcionActiva) {
                Inertia::share('tenantSinSuscripcion', true);
            }
        }

        return $next($request);
    }
}
