import AdminLayout from "@/Layouts/AdminLayout";
import { Link } from "@inertiajs/react";
import { ShieldCheckIcon, AdjustmentsHorizontalIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function Index({ pagos }) {

    // Función auxiliar para formatear la fecha fea de la Base de Datos
    const formatFecha = (fechaString) => {
        if (!fechaString) return "-";
        try {
            const fecha = new Date(fechaString);
            return fecha.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch (e) {
            return fechaString;
        }
    };

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Pagos
                    </h1>
                    <p className="text-slate-500">
                        Gestión de pagos de suscripciones
                    </p>
                </div>

                <Link
                    href={route("superadmin.pagos.create")}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    Nuevo Pago
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-left font-semibold text-slate-600">Liga</th>
                            <th className="px-6 py-4 text-left font-semibold text-slate-600">Plan</th>
                            <th className="px-6 py-4 text-left font-semibold text-slate-600">Monto</th>
                            <th className="px-6 py-4 text-left font-semibold text-slate-600">Método</th>
                            <th className="px-6 py-4 text-left font-semibold text-slate-600">Estado</th>
                            <th className="px-6 py-4 text-left font-semibold text-slate-600">Fecha</th>
                            <th className="px-6 py-4 text-center font-semibold text-slate-600">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {pagos.data.map((pago) => (
                            <tr key={pago.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-slate-700 font-medium">
                                    {pago.suscripcion?.tenant?.nombre || "N/A"}
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    <div className="flex flex-col">
                                        {/* 💡 CORREGIDO: Ahora busca el nombre dentro de la relación suscripcion */}
                                        <span className="font-semibold text-slate-700">
                                            {pago.suscripcion?.plan?.nombre || "N/A"}
                                        </span>
                                        <span className="text-[11px] font-medium text-indigo-600 mt-0.5 bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
                                            Precio: ${pago.suscripcion?.plan?.precio || "0.00"}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-900 font-semibold">
                                    ${pago.monto}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium">
                                        {pago.metodo_pago}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${pago.estado === "PAGADO"
                                            ? "bg-green-100 text-green-700"
                                            : pago.estado === "ANULADO"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-yellow-100 text-yellow-700"
                                            }`}
                                    >
                                        {pago.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {formatFecha(pago.fecha_pago)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <Link
                                        href={route("superadmin.pagos.edit", pago.id)}
                                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                                    >
                                        Editar
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* 💡 NUEVA SECCIÓN: Paginación de Tailwind e Inertia */}
                {pagos.links && pagos.links.length > 3 && (
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-center gap-1 flex-wrap">
                        {pagos.links.map((link, index) => {
                            // Reemplazar los textos feos de Laravel por flechas bonitas
                            let label = link.label;
                            if (label.includes("Previous")) label = "« Anterior";
                            if (label.includes("Next")) label = "Siguiente »";

                            return link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${link.active
                                        ? "bg-indigo-600 text-white border-indigo-600"
                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                        }`}
                                    // Conservar el estado del scroll al cambiar de página
                                    preserveScroll
                                    // dangerouslySetInnerHTML se usa por si vienen entidades HTML de Laravel como &raquo;
                                    dangerouslySetInnerHTML={{ __html: label }}
                                />
                            ) : (
                                <span
                                    key={index}
                                    className="px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-100 rounded-lg border border-slate-200 cursor-not-allowed"
                                    dangerouslySetInnerHTML={{ __html: label }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
