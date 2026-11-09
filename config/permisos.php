<?php

return [
    'modulos' => [
        'categorias'    => ['label' => 'Categorías',    'acciones' => ['ver' => 'Ver', 'editar' => 'Crear/editar/eliminar']],
        'equipos'       => ['label' => 'Equipos',       'acciones' => ['ver' => 'Ver', 'editar' => 'Crear/editar/eliminar']],
        'jugadores'     => ['label' => 'Jugadores',     'acciones' => ['ver' => 'Ver', 'editar' => 'Crear/editar/eliminar']],
        'torneos'       => ['label' => 'Torneos',       'acciones' => ['ver' => 'Ver', 'editar' => 'Crear/editar/eliminar']],
        'inscripciones' => ['label' => 'Inscripciones', 'acciones' => ['ver' => 'Ver', 'editar' => 'Inscribir/quitar']],
        'jornadas'      => ['label' => 'Jornadas',      'acciones' => ['ver' => 'Ver', 'editar' => 'Editar']],
        'partidos'      => ['label' => 'Partidos',      'acciones' => [
            'ver' => 'Ver', 'editar' => 'Editar fecha/cancha', 'arbitros' => 'Asignar árbitros',
            'fixture' => 'Generar fixture', 'en_vivo' => 'Panel en vivo',
        ]],
        'arbitros'      => ['label' => 'Árbitros',      'acciones' => ['ver' => 'Ver', 'editar' => 'Crear/editar/eliminar']],
    ],

    // Permisos por defecto de cada rol (Administrador Liga recibe todos)
    'roles' => [
        'Operador' => ['partidos.ver', 'partidos.en_vivo'],
        'Editor'   => ['partidos.ver'],
    ],
];
