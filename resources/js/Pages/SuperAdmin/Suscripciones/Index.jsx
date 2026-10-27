import AdminLayout from "@/Layouts/AdminLayout";
import { Link } from "@inertiajs/react";

export default function Index({ suscripciones }) {

    // --- FUNCIÓN AUXILIAR PARA OBTENER EL ESTADO REAL EN TIEMPO REAL ---
    const obtenerEstadoReal = (fechaFinStr, estadoActual) => {
        if (estadoActual === "CANCELADA" || estadoActual === "SUSPENDIDA") {
            return estadoActual;
        }

        if (!fechaFinStr) return estadoActual;

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const fechaFin = new Date(fechaFinStr);
        fechaFin.setHours(0, 0, 0, 0);

        // Si la fecha de fin es menor que el día de hoy, está vencida
        if (fechaFin < hoy) {
            return "VENCIDA";
        }

        return estadoActual;
    };

    // --- FUNCIÓN AUXILIAR PARA EL CONTADOR DE DÍAS (UX) ---
    const renderDiasRestantes = (fechaFinStr, estado) => {
        const estadoReal = obtenerEstadoReal(fechaFinStr, estado);
        if (!fechaFinStr || estadoReal === "CANCELADA") return null;

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const fechaFin = new Date(fechaFinStr);
        fechaFin.setHours(0, 0, 0, 0);

        const diferenciaTiempo = fechaFin.getTime() - hoy.getTime();
        const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

        if (diasRestantes < 0) {
            return (
                <span className="block text-[11px] font-medium text-red-600 mt-0.5">
                    Vencida hace {Math.abs(diasRestantes)} d
                </span>
            );
        } else if (diasRestantes === 0) {
            return (
                <span className="block text-[11px] font-bold text-amber-600 animate-pulse mt-0.5">
                    ¡Vence hoy!
                </span>
            );
        } else if (diasRestantes <= 7) {
            return (
                <span className="block text-[11px] font-medium text-amber-600 mt-0.5">
                    {diasRestantes} d restantes
                </span>
            );
        } else {
            return (
                <span className="block text-[11px] font-medium text-emerald-600 mt-0.5">
                    {diasRestantes} d restantes
                </span>
            );
        }
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Suscripciones</h1>
                <Link
                    href={route("superadmin.suscripciones.create")}
                    className="pxcd-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
                >
                    Nueva Suscripción
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
                <table className="w-full border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Liga</th>
                            <th className="p-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
                            <th className="p-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Inicio</th>
                            <th className="p-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fin</th>
                            <th className="p-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                            <th className="p-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Precio</th>
                            <th className="p-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {suscripciones.data.map((suscripcion) => {
                            // Calculamos el estado real para usarlo en esta fila
                            const estadoReal = obtenerEstadoReal(suscripcion.fecha_fin, suscripcion.estado);

                            return (
                                <tr key={suscripcion.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="p-3.5 font-medium text-slate-900">
                                        {suscripcion.tenant?.nombre}
                                    </td>
                                    <td className="p-3.5 text-slate-600 text-sm">
                                        {suscripcion.plan?.nombre}
                                    </td>
                                    <td className="p-3.5 text-slate-500 text-sm">
                                        {suscripcion.fecha_inicio}
                                    </td>
                                    <td className="p-3.5 text-sm">
                                        <span className="text-slate-700 font-medium">{suscripcion.fecha_fin}</span>
                                        {renderDiasRestantes(suscripcion.fecha_fin, suscripcion.estado)}
                                    </td>
                                    <td className="p-3.5">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                ${estadoReal === "ACTIVA" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}
                                                ${estadoReal === "SUSPENDIDA" ? "bg-amber-50 text-amber-700 border-amber-200" : ""}
                                                ${estadoReal === "CANCELADA" ? "bg-rose-50 text-rose-700 border-rose-200" : ""}
                                                ${estadoReal === "VENCIDA" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : ""}
                                            `}
                                        >
                                            {estadoReal}
                                        </span>
                                    </td>
                                    <td className="p-3.5 font-semibold text-slate-900 text-sm">
                                        ${suscripcion.precio_pagado}
                                    </td>
                                    <td className="p-3.5">
                                        <div className="flex gap-1.5 justify-center items-center">
                                            {/* 1. Botón Registrar Pago */}
                                            <button
                                                onClick={() => alert('Próximamente: Módulo de registro de pagos')}
                                                className="inline-flex items-center gap-1 px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-all shadow-sm"
                                                title="Registrar nuevo pago"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                                                </svg>
                                                <span>Pago</span>
                                            </button>

                                            {/* 2. Botón Ver Historial */}
                                            <button
                                                onClick={() => alert('Próximamente: Historial financiero')}
                                                className="inline-flex items-center gap-1 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-all"
                                                title="Ver historial financiero"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                                                </svg>
                                                <span>Historial</span>
                                            </button>

                                            {/* 3. Botón Editar */}
                                            <Link
                                                href={route("superadmin.suscripciones.edit", suscripcion.id)}
                                                className="inline-flex items-center gap-1 px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium rounded-lg border border-blue-100 transition-all"
                                                title="Modificar configuración de suscripción"
                                            >
                                                <span>Editar</span>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
