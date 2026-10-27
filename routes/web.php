<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SuperAdmin\PagoController;
use App\Http\Controllers\SuperAdmin\PlanController;
use App\Http\Controllers\SuperAdmin\SuscripcionController;
use App\Http\Controllers\SuperAdmin\TenantController;
use App\Http\Controllers\Tenant\CategoriaController;
use App\Http\Controllers\Tenant\EquipoController;
use App\Http\Controllers\Tenant\InscripcionController;
use App\Http\Controllers\Tenant\JornadaController;
use App\Http\Controllers\Tenant\JugadorController;
use App\Http\Controllers\Tenant\TorneoController;
use App\Http\Controllers\Tenant\PartidoController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', DashboardController::class)->middleware([
    'auth',
    'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'role:Super Admin'])
    ->prefix('superadmin')
    ->name('superadmin.')
    ->group(function () {
        Route::get('/dashboard', fn () => Inertia::render('SuperAdmin/Dashboard'))->name('dashboard');

        // 1. PLANES: Sí cumple con un Resource, pero solo usa 4 métodos.
        Route::resource('plan', PlanController::class)->only([
            'index', 'store', 'update', 'destroy', 'create', 'edit',
        ]);

        // 2. SUSCRIPCIONES: Combinación limpia de Resource limitado + rutas personalizadas
        // Cambia esto en tu web.php:
        // En tu routes/web.php cambia tu recurso por esto:
        Route::resource('suscripciones', SuscripcionController::class)
            ->parameters(['suscripciones' => 'suscripcion']);
        Route::resource('suscripcion', SuscripcionController::class)->only([
            'index', 'store', 'update', 'destroy', 'create', 'edit',
        ]);
        Route::resource('suscripciones', SuscripcionController::class);
        Route::prefix('suscripciones/{suscripcion}')->name('suscripciones.')->group(function () {
            Route::patch('activar', [SuscripcionController::class, 'activar'])->name('activar');
            Route::patch('suspender', [SuscripcionController::class, 'suspender'])->name('suspender');
            Route::patch('cancelar', [SuscripcionController::class, 'cancelar'])->name('cancelar');
        });
        // 3. PAGOS: Resource limitado (solo Index, Store y Destroy)
        Route::resource('pagos', PagoController::class)->only([
            'index', 'store', 'destroy',
        ]);
        // 4. TENANTS: (Asumiendo que usa el CRUD completo, se deja normal)
        Route::resource('tenants', TenantController::class);
        Route::resource('pagos', PagoController::class);
        Route::patch('pagos/{pago}/aprobar', [PagoController::class, 'aprobar'])->name('pagos.aprobar');
        Route::patch('pagos/{pago}/anular', [PagoController::class, 'anular'])->name('pagos.anular');

    });

Route::middleware(['auth', 'role:Administrador Liga|Editor|Operador'])
    ->prefix('tenant')
    ->name('tenant.')
    ->group(function () {

        Route::get('/dashboard', fn () => Inertia::render('Tenant/Dashboard'))->name('dashboard');
        // RUTAS DE CATEGORÍAS (Excluimos vistas de formularios porque usaremos modales)
        Route::resource('categorias', CategoriaController::class)->except(['create', 'show', 'edit']);
        Route::resource('equipos', EquipoController::class)->except(['create', 'show', 'edit']);
        // Forzamos a Laravel a mapear el parámetro singular correcto de jugadores como 'jugador'
        Route::resource('jugadores', JugadorController::class)
            ->except(['create', 'show', 'edit'])
            ->parameters(['jugadores' => 'jugador']);

        Route::resource('torneos', TorneoController::class)->except(['create', 'edit']);

        // RECURSO DE INSCRIPCIONES (Cubre Index, Store y Destroy)
        Route::resource('inscripciones', InscripcionController::class)->only(['index', 'store', 'destroy']);

        // RUTA ADICIONAL PARA EL FICHAJE DE JUGADORES
        Route::post('inscripciones/roster', [InscripcionController::class, 'storeRoster'])
            ->name('inscripciones.roster.store');
        Route::get('inscripciones/buscar-jugadores', [InscripcionController::class, 'buscarJugadoresDisponibles'])
            ->name('inscripciones.buscar-jugadores');

        Route::resource('jornadas', JornadaController::class)
            ->only(['index', 'update']);

        // Recurso de Partidos
        Route::resource('partidos', PartidoController::class)->only(['index', 'update']);

        // Generar Fixture
        Route::post('partidos/generar-fixture', [PartidoController::class, 'generarFixture'])
            ->name('partidos.generar-fixture');

    });

Route::middleware([
    'auth',
    'role:Delegado',
])
    ->prefix('portal')
    ->name('portal.')
    ->group(function () {

        Route::get(
            '/dashboard',
            fn () => Inertia::render(
                'Portal/Dashboard'
            )
        )->name('dashboard');

    });
require __DIR__.'/auth.php';
