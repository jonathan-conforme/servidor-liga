<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule; // ◄ Asegúrate de que esta línea de importación esté arriba

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// 💡 TU NUEVO PROGRAMADOR DE TAREAS:
// Corre tu comando automáticamente todos los días a las 12:01 de la noche
Schedule::command('suscripciones:verificar')->dailyAt('00:01'); 
