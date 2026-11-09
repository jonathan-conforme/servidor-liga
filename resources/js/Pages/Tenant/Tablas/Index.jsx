import React from 'react';
import { Head, router } from '@inertiajs/react';
import TenantLayout from '@/Layouts/TenantLayout';

import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export default function Index({ torneos = [], torneoIdSeleccionado = '', tabla = [] }) {
    const handleTorneoChange = (e) => {
        const id = e.target.value;
        router.get(route('tenant.tablas.index'), { torneo_id: id }, { preserveState: true });
    };

    return (
        <TenantLayout header="Tabla de Posiciones">
            <Head title="Tabla de Posiciones" />

            <div className="max-w-6xl mx-auto space-y-6">
                {/* SELECTOR DE TORNEO */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                        <EmojiEventsIcon className="text-amber-500" />
                        <span>Clasificación del Torneo</span>
                    </div>

                    <div className="w-64">
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
                                    {t.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>
                </div>

                {/* TABLA DE POSICIONES */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {tabla.length === 0 ? (
                        <p className="text-slate-400 text-center py-12 text-sm">
                            No hay equipos o estadísticas disponibles para el torneo seleccionado.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-slate-900 text-slate-300 text-xs uppercase tracking-wider">
                                        <th className="py-3.5 px-4 text-center w-12">#</th>
                                        <th className="py-3.5 px-4">Equipo</th>
                                        <th className="py-3.5 px-3 text-center">PJ</th>
                                        <th className="py-3.5 px-3 text-center">PG</th>
                                        <th className="py-3.5 px-3 text-center">PE</th>
                                        <th className="py-3.5 px-3 text-center">PP</th>
                                        <th className="py-3.5 px-3 text-center">GF</th>
                                        <th className="py-3.5 px-3 text-center">GC</th>
                                        <th className="py-3.5 px-3 text-center">DG</th>
                                        <th className="py-3.5 px-4 text-center font-black text-indigo-400 bg-slate-800/80">PTS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {tabla.map((row, index) => {
                                        const pos = index + 1;
                                        return (
                                            <tr key={row.equipo_id} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-4 text-center font-bold text-slate-500">
                                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                                                        pos === 1 ? 'bg-amber-100 text-amber-700 font-black' :
                                                        pos === 2 ? 'bg-slate-200 text-slate-700 font-bold' :
                                                        pos === 3 ? 'bg-orange-100 text-orange-700 font-bold' : ''
                                                    }`}>
                                                        {pos}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-3">
                                                    {row.escudo ? (
                                                        <img src={`/storage/${row.escudo}`} alt={row.nombre} className="w-6 h-6 object-contain shrink-0" />
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                            {row.nombre.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span>{row.nombre}</span>
                                                </td>
                                                <td className="py-3 px-3 text-center text-slate-600">{row.pj}</td>
                                                <td className="py-3 px-3 text-center text-emerald-600 font-medium">{row.pg}</td>
                                                <td className="py-3 px-3 text-center text-amber-600 font-medium">{row.pe}</td>
                                                <td className="py-3 px-3 text-center text-red-600 font-medium">{row.pp}</td>
                                                <td className="py-3 px-3 text-center text-slate-600">{row.gf}</td>
                                                <td className="py-3 px-3 text-center text-slate-600">{row.gc}</td>
                                                <td className="py-3 px-3 text-center font-medium text-slate-700">
                                                    {row.dg > 0 ? `+${row.dg}` : row.dg}
                                                </td>
                                                <td className="py-3 px-4 text-center font-black text-slate-900 bg-slate-50 text-base">
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
            </div>
        </TenantLayout>
    );
}