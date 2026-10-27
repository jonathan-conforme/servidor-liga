<?php

namespace App\Enums;

enum PosicionJugador: string
{
    case ARQUERO = 'ARQUERO';
    case DEFENSA = 'DEFENSA';
    case MEDIOCAMPO = 'MEDIOCAMPO';
    case DELANTERO = 'DELANTERO';

    // Ventaja extra: Puedes crear un método para devolver las etiquetas bonitas para React
    public function label(): string
    {
        return match($this) {
            self::ARQUERO => 'Arquero',
            self::DEFENSA => 'Defensa',
            self::MEDIOCAMPO => 'Mediocampo',
            self::DELANTERO => 'Delantero',
        };
    }
}
