<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SuperAdmin\PagoController;
use App\Http\Controllers\SuperAdmin\PlanController;
use App\Http\Controllers\SuperAdmin\SuscripcionController;
use App\Http\Controllers\SuperAdmin\TenantController;
use App\Http\Controllers\Tenant\ArbitroController;
use App\Http\Controllers\Tenant\CategoriaController;
use App\Http\Controllers\Tenant\EquipoController;
use App\Http\Controllers\Tenant\InscripcionController;
use App\Http\Controllers\Tenant\JornadaController;
use App\Http\Controllers\Tenant\JugadorController;
use App\Http\Controllers\Tenant\PartidoArbitroController;
use App\Http\Controllers\Tenant\PartidoController;
use App\Http\Controllers\Tenant\TorneoController;
use App\Http\Controllers\Tenant\UsuarioController;
use Illuminate\Foundation\Application;
use App\Http\Controllers\Tenant\GoleadorController;
use App\Http\Controllers\Tenant\EventoPartidoController;
use App\Http\Controllers\Tenant\TablaPosicionesController;
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

Route::get('/dashboard', DashboardController::class)->middleware(['auth', 'verified'])->name('dashboard');

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

        // CATEGORÍAS
        Route::resource('categorias', CategoriaController::class)->only(['index'])->middleware('permission:categorias.ver');
        Route::resource('categorias', CategoriaController::class)->only(['store', 'update', 'destroy'])->middleware('permission:categorias.editar');

        // EQUIPOS
        Route::resource('equipos', EquipoController::class)->only(['index'])->middleware('permission:equipos.ver');
        Route::resource('equipos', EquipoController::class)->only(['store', 'update', 'destroy'])->middleware('permission:equipos.editar');

        // JUGADORES
        Route::resource('jugadores', JugadorController::class)->parameters(['jugadores' => 'jugador'])
            ->only(['index'])->middleware('permission:jugadores.ver');
        Route::resource('jugadores', JugadorController::class)->parameters(['jugadores' => 'jugador'])
            ->only(['store', 'update', 'destroy'])->middleware('permission:jugadores.editar');

        // TORNEOS
        Route::resource('torneos', TorneoController::class)->only(['index', 'show'])->middleware('permission:torneos.ver');
        Route::resource('torneos', TorneoController::class)->only(['store', 'update', 'destroy'])->middleware('permission:torneos.editar');

        // INSCRIPCIONES
        Route::get('inscripciones/buscar-jugadores', [InscripcionController::class, 'buscarJugadoresDisponibles'])
            ->middleware('permission:inscripciones.ver')->name('inscripciones.buscar-jugadores');
        Route::resource('inscripciones', InscripcionController::class)->only(['index'])->middleware('permission:inscripciones.ver');
        Route::resource('inscripciones', InscripcionController::class)->only(['store', 'destroy'])->middleware('permission:inscripciones.editar');
        Route::post('inscripciones/roster', [InscripcionController::class, 'storeRoster'])
            ->middleware('permission:inscripciones.editar')->name('inscripciones.roster.store');

        // JORNADAS
        Route::resource('jornadas', JornadaController::class)->only(['index'])->middleware('permission:jornadas.ver');
        Route::resource('jornadas', JornadaController::class)->only(['update'])->middleware('permission:jornadas.editar');

        // PARTIDOS
        Route::get('partidos', [PartidoController::class, 'index'])
            ->middleware('permission:partidos.ver')->name('partidos.index');
        Route::put('partidos/{partido}', [PartidoController::class, 'update'])
            ->middleware('permission:partidos.editar')->name('partidos.update');
        Route::post('partidos/generar-fixture', [PartidoController::class, 'generarFixture'])
            ->middleware('permission:partidos.fixture')->name('partidos.generar-fixture');
        Route::put('partidos/{partido}/arbitros', [PartidoArbitroController::class, 'sync'])
            ->middleware('permission:partidos.arbitros')->name('partidos.arbitros.sync');

        // Panel en vivo 
        Route::middleware('permission:partidos.en_vivo')->group(function () {
        Route::get('partidos/{partido}/en-vivo', [EventoPartidoController::class, 'show'])->name('partidos.en-vivo');
        Route::post('partidos/{partido}/eventos', [EventoPartidoController::class, 'store'])->name('partidos.eventos.store');
        Route::delete('partidos/{partido}/eventos/{evento}', [EventoPartidoController::class, 'destroy'])->name('partidos.eventos.destroy');
         });
        
        //tablas de posisiones
       // TABLA DE POSICIONES
        Route::get('tablas', [TablaPosicionesController::class, 'index'])
            ->middleware('permission:partidos.ver')
            ->name('tablas.index');

                // TABLA DE GOLEADORES
        Route::get('goleadores', [GoleadorController::class, 'index'])
            ->middleware('permission:partidos.ver')
            ->name('goleadores.index');



        // ÁRBITROS
        Route::resource('arbitros', ArbitroController::class)->only(['index'])->middleware('permission:arbitros.ver');
        Route::resource('arbitros', ArbitroController::class)->only(['store', 'update', 'destroy'])->middleware('permission:arbitros.editar');

        // USUARIOS: solo el administrador de la liga
        Route::middleware('role:Administrador Liga')->group(function () {
            Route::resource('usuarios', UsuarioController::class)
                ->only(['index', 'store', 'update'])
                ->parameters(['usuarios' => 'usuario']);
            Route::patch('usuarios/{usuario}/estado', [UsuarioController::class, 'estado'])->name('usuarios.estado');
        });
    });
require __DIR__.'/auth.php';
