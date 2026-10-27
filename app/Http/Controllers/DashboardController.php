<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function __invoke(): RedirectResponse
    {
        $user = Auth::user();

        if ($user->hasRole('Super Admin')) {
            return redirect()->route(
                'superadmin.dashboard'
            );
        }

        if ($user->hasRole('Administrador Liga')) {
            return redirect()->route(
                'tenant.dashboard'
            );
        }

        if ($user->hasRole('Editor')) {
            return redirect()->route(
                'tenant.dashboard'
            );
        }

        if ($user->hasRole('Operador')) {
            return redirect()->route(
                'tenant.dashboard'
            );
        }

        if ($user->hasRole('Delegado')) {
            return redirect()->route(
                'portal.dashboard'
            );
        }

        abort(403);
    }
}
