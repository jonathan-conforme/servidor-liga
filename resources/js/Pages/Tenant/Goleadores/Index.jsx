import React from 'react';
import { Head, router } from '@inertiajs/react';
import TenantLayout from '@/Layouts/TenantLayout';

import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';

export default function Index({ torneos = [], torneoIdSeleccionado = '', goleadores = [] }) {
    const handleTorneoChange = (e) => {
        const id = e.target.value;
        router.get(route('tenant.goleadores.index'), { torneo_id: id }, { preserveState: true });
    };

    return (
        <TenantLayout header="Tabla de Goleadores">
            <Head title="Tabla de Goleadores" />

            <div className="max-w-5xl mx-auto space-y-6">
                {/* SELECTOR DE TORNEO */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                        <MilitaryTechIcon className="text-amber-500" />
                        <span>Tabla de Goleadores</span>
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

                {/* TABLA DE GOLEADORES */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {goleadores.length === 0 ? (
                        <p className="text-slate-400 text-center py-12 text-sm">
                            Aún no se han registrado goles en el torneo seleccionado.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-slate-900 text-slate-300 text-xs uppercase tracking-wider">
                                        <th className="py-3.5 px-4 text-center w-16">#</th>
                                        <th className="py-3.5 px-4">Jugador</th>
                                        <th className="py-3.5 px-4">Equipo</th>
                                        <th className="py-3.5 px-4 text-center font-black text-indigo-400 bg-slate-800/80 w-28">Goles</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {goleadores.map((row, index) => {
                                        const pos = index + 1;
                                        return (
                                            <tr key={`${row.jugador_id}-${row.equipo_id}`} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-4 text-center font-bold text-slate-500">
                                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                                        pos === 1 ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-400' :
                                                        pos === 2 ? 'bg-slate-200 text-slate-800' :
                                                        pos === 3 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {pos}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-slate-900">
                                                    {row.jugador_nombre || 'Sin nombre'}
                                                </td>
                                                <td className="py-3 px-4 text-slate-600 flex items-center gap-2">
                                                    {row.equipo_escudo ? (
                                                        <img src={`/storage/${row.equipo_escudo}`} alt={row.equipo_nombre} className="w-5 h-5 object-contain shrink-0" />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                            {row.equipo_nombre?.charAt(0) || 'E'}
                                                        </div>
                                                    )}
                                                    <span>{row.equipo_nombre || 'N/A'}</span>
                                                </td>
                                                <td className="py-3 px-4 text-center font-black text-slate-900 bg-slate-50 text-base">
                                                    <div className="flex items-center justify-center gap-1.5 text-indigo-600">
                                                        <SportsSoccerIcon fontSize="small" />
                                                        <span>{row.total_goles}</span>
                                                    </div>
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