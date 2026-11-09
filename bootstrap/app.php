<?php

use App\Http\Middleware\CheckTenantSubscription;
use App\Http\Middleware\EnsureUserIsActive;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Exceptions\UnauthorizedException;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            EnsureUserIsActive::class,
            CheckTenantSubscription::class,
        ]);

        $middleware->alias([
            'role'               => RoleMiddleware::class,
            'permission'         => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Captura excepciones de permisos de Spatie
        $exceptions->render(function (UnauthorizedException $e, Request $request) {
            if ($request->header('X-Inertia')) {
                return Inertia::render('Errors/Error', ['status' => 403])
                    ->toResponse($request)
                    ->setStatusCode(403);
            }
        });

        // Captura excepciones 403 nativas de Laravel (abort(403) o middleware de Spatie)
        $exceptions->render(function (AccessDeniedHttpException $e, Request $request) {
            if ($request->header('X-Inertia')) {
                return Inertia::render('Errors/Error', ['status' => 403])
                    ->toResponse($request)
                    ->setStatusCode(403);
            }
        });
    })->create();