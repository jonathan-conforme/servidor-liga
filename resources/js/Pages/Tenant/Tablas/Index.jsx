import React from 'react';
import { Head, router } from '@inertiajs/react';
import TenantLayout from '@/Layouts/TenantLayout';

import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

function TablaCard({ titulo, filas = [], esGrupos = false, clasificadosPorGrupo = 0 }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {esGrupos && (
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="font-bold text-slate-800 text-base tracking-tight">{titulo}</h2>
                    <span className="text-xs font-medium text-slate-500">
                        {filas.length} {filas.length === 1 ? 'equipo' : 'equipos'}
                    </span>
                </div>
            )}

            {filas.length === 0 ? (
                <p className="text-slate-400 text-center py-10 text-sm">
                    No hay equipos registrados en {esGrupos ? 'este grupo' : 'este torneo'}.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-900 text-slate-300 text-xs uppercase tracking-wider">
                                <th className="py-3.5 px-3 text-center w-11">#</th>
                                <th className="py-3.5 px-3">Equipo</th>
                                <th className="py-3.5 px-2.5 text-center">PJ</th>
                                <th className="py-3.5 px-2.5 text-center">PG</th>
                                <th className="py-3.5 px-2.5 text-center">PE</th>
                                <th className="py-3.5 px-2.5 text-center">PP</th>
                                <th className="py-3.5 px-2.5 text-center">GF</th>
                                <th className="py-3.5 px-2.5 text-center">GC</th>
                                <th className="py-3.5 px-2.5 text-center">DG</th>
                                <th className="py-3.5 px-3.5 text-center font-black text-indigo-400 bg-slate-800/80">PTS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filas.map((row, index) => {
                                const pos = index + 1;
                                const clasifica = esGrupos && clasificadosPorGrupo > 0 && pos <= clasificadosPorGrupo;

                                return (
                                    <tr
                                        key={row.equipo_id}
                                        className={`transition-colors ${
                                            clasifica
                                                ? 'bg-emerald-50/40 hover:bg-emerald-50/80 border-l-4 border-l-emerald-500'
                                                : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        <td className="py-3 px-3 text-center font-bold text-slate-500">
                                            <span
                                                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                                                    clasifica
                                                        ? 'bg-emerald-100 text-emerald-800 font-black'
                                                        : pos === 1
                                                        ? 'bg-amber-100 text-amber-700 font-black'
                                                        : pos === 2
                                                        ? 'bg-slate-200 text-slate-700 font-bold'
                                                        : pos === 3
                                                        ? 'bg-orange-100 text-orange-700 font-bold'
                                                        : ''
                                                }`}
                                            >
                                                {pos}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 font-semibold text-slate-900">
                                            <div className="flex items-center gap-2.5">
                                                {row.escudo ? (
                                                    <img
                                                        src={`/storage/${row.escudo}`}
                                                        alt={row.nombre}
                                                        className="w-6 h-6 object-contain shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                        {row.nombre.charAt(0)}
                                                    </div>
                                                )}
                                                <span className="truncate">{row.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-2.5 text-center text-slate-600">{row.pj}</td>
                                        <td className="py-3 px-2.5 text-center text-emerald-600 font-medium">{row.pg}</td>
                                        <td className="py-3 px-2.5 text-center text-amber-600 font-medium">{row.pe}</td>
                                        <td className="py-3 px-2.5 text-center text-red-600 font-medium">{row.pp}</td>
                                        <td className="py-3 px-2.5 text-center text-slate-600">{row.gf}</td>
                                        <td className="py-3 px-2.5 text-center text-slate-600">{row.gc}</td>
                                        <td className="py-3 px-2.5 text-center font-medium text-slate-700">
                                            {row.dg > 0 ? `+${row.dg}` : row.dg}
                                        </td>
                                        <td className="py-3 px-3.5 text-center font-black text-slate-900 bg-slate-50 text-base">
                                            {row.pts}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default function Index({
    torneos = [],
    torneoIdSeleccionado = '',
    torneoSeleccionado = null,
    categorias = [],
    categoriaIdSeleccionada = '',
    clasificacion = { es_grupos: false, clasificados_por_grupo: 0, grupos: [] },
}) {
    const handleTorneoChange = (e) => {
        router.get(route('tenant.tablas.index'), { torneo_id: e.target.value }, { preserveState: true });
    };

    const handleCategoriaChange = (e) => {
        router.get(
            route('tenant.tablas.index'),
            { torneo_id: torneoIdSeleccionado, categoria_id: e.target.value },
            { preserveState: true }
        );
    };

    const bloques = clasificacion.grupos || [];
    const hayEquipos = bloques.some((b) => (b.tabla || []).length > 0);

    return (
        <TenantLayout header="Tabla de Posiciones">
            <Head title="Tabla de Posiciones" />

            <div className="max-w-6xl mx-auto space-y-6">
                {/* CABECERA Y SELECTORES */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 text-slate-800 font-bold text-lg">
                        <EmojiEventsIcon className="text-amber-500" />
                        <span>Clasificación del Torneo</span>
                        {torneoSeleccionado && (
                            <Chip
                                label={clasificacion.es_grupos ? 'Fase de Grupos' : 'Liga'}
                                size="small"
                                color={clasificacion.es_grupos ? 'secondary' : 'primary'}
                                variant="outlined"
                            />
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        {categorias.length > 1 && (
                            <div className="w-full sm:w-48">
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    label="Categoría"
                                    value={categoriaIdSeleccionada}
                                    onChange={handleCategoriaChange}
                                >
                                    {categorias.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id}>
                                            {cat.nombre}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </div>
                        )}

                        <div className="w-full sm:w-64">
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Seleccionar Torneo"
                                value={torneoIdSeleccionado}
                                onChange={handleTorneoChange}
                            >
                                {torneos.map((t) => (
                                    <MenuItem key={t.id} value={t.id}>
                                        {`${t.nombre} (${t.anio})`}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </div>
                    </div>
                </div>

                {/* CONTENIDO DE TABLAS */}
                {!hayEquipos ? (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-slate-400 text-center py-12 text-sm">
                            No hay equipos o estadísticas disponibles para el torneo seleccionado.
                        </p>
                    </div>
                ) : (
                    <>
                        <div
                            className={
                                clasificacion.es_grupos && bloques.length > 1
                                    ? 'grid grid-cols-1 xl:grid-cols-2 gap-6'
                                    : 'space-y-6'
                            }
                        >
                            {bloques.map((bloque) => (
                                <TablaCard
                                    key={bloque.grupo_id ?? bloque.nombre}
                                    titulo={bloque.nombre}
                                    filas={bloque.tabla || []}
                                    esGrupos={clasificacion.es_grupos}
                                    clasificadosPorGrupo={clasificacion.clasificados_por_grupo}
                                />
                            ))}
                        </div>

                        {clasificacion.es_grupos && clasificacion.clasificados_por_grupo > 0 && (
                            <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
                                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                                <span>
                                    Zona de clasificación a Play-offs (Primeros{' '}
                                    <strong>{clasificacion.clasificados_por_grupo}</strong> de cada grupo)
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </TenantLayout>
    );
}
