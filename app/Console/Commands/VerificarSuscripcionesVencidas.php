<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Suscripcion;
use Carbon\Carbon;

class VerificarSuscripcionesVencidas extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'suscripciones:verificar';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cambia a VENCIDA el estado de las suscripciones cuya fecha fin ya pas';

    /**
     * Execute the console command.
     */
   public function handle()
    {
        $hoy = Carbon::now()->startOfDay();

        // 1. Buscamos y actualizamos las suscripciones vencidas
        // (Buscamos las que estén ACTIVAS pero su fecha_fin sea MENOR a hoy)
        $suscripcionesVencidas = Suscripcion::where('estado', 'ACTIVA')
            ->where('fecha_fin', '<', $hoy)
            ->update([
                'estado' => 'VENCIDA'
            ]);

        // 2. Mensaje informativo en la consola
        if ($suscripcionesVencidas > 0) {
            $this->info("¡Éxito! Se han vencido {$suscripcionesVencidas} suscripciones.");
        } else {
            $this->comment("No se encontraron suscripciones por vencer hoy.");
        }

        return Command::SUCCESS;
    }
}
