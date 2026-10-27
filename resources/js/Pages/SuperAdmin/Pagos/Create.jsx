import AdminLayout from "@/Layouts/AdminLayout";
import { useForm, Link } from "@inertiajs/react";
import { useState } from "react";
import {
    ArrowLeftIcon,
    UsersIcon,
    CurrencyDollarIcon,
    KeyIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
    CreditCardIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/outline";


export default function Create({ suscripciones }) {
    // Rastrear los nombres reales y el precio base en español
    const [infoSuscripcion, setInfoSuscripcion] = useState({
        tenantNombre: "",
        planNombre: "",
        planPrecio: ""
    });

    const { data, setData, post, processing, errors } = useForm({
        tenant_id: "",
        suscripcion_id: "",
        plan_id: "",
        monto: "", // Se auto-completa dinámicamente
        referencia: "",
        fecha_pago: "",
        metodo_pago: "EFECTIVO",
        estado: "PAGADO",
        observacion: ""
    });

    const handleSuscripcionChange = (e) => {
        const idSuscripcion = e.target.value;
        const suscripcionSeleccionada = suscripciones.find(s => String(s.id) === String(idSuscripcion));

        if (suscripcionSeleccionada) {
            const precioSugerido = suscripcionSeleccionada.plan?.precio || "";

            setData(prev => ({
                ...prev,
                suscripcion_id: idSuscripcion,
                tenant_id: suscripcionSeleccionada.tenant_id || "",
                plan_id: suscripcionSeleccionada.plan_id || "",
                monto: precioSugerido // Auto-completado del input de monto
            }));

            setInfoSuscripcion({
                tenantNombre: suscripcionSeleccionada.tenant?.nombre || "Cliente Desconocido",
                planNombre: suscripcionSeleccionada.plan?.nombre || "Plan Estándar",
                planPrecio: precioSugerido ? `$${precioSugerido}` : "No definido"
            });
        } else {
            setData(prev => ({ ...prev, suscripcion_id: "", tenant_id: "", plan_id: "", monto: "" }));
            setInfoSuscripcion({ tenantNombre: "", planNombre: "", planPrecio: "" });
        }
    };

    const submit = (e) => {
        e.preventDefault();
        const datosLimpios = {
            ...data,
            fecha_pago: data.fecha_pago ? data.fecha_pago.replace("T", " ") : ""
        };

        post(route("superadmin.pagos.store"), {
            data: datosLimpios,
            onBefore: () => console.log("🚀 Enviando Pago:", datosLimpios),
            onError: (err) => console.error("❌ Errores del Servidor:", err)
        });
    };

    const getEstadoEstilo = (estado) => {
        switch (estado) {
            case "PAGADO": return "bg-green-50/50 text-green-700 border-green-200 focus:ring-green-500/20 focus:border-green-500";
            case "PENDIENTE": return "bg-yellow-50/50 text-yellow-700 border-yellow-200 focus:ring-yellow-500/20 focus:border-yellow-500";
            case "ANULADO": return "bg-red-50/50 text-red-700 border-red-200 focus:ring-red-500/20 focus:border-red-500";
            case "FALLIDO": return "bg-amber-50/50 text-amber-700 border-amber-200 focus:ring-amber-500/20 focus:border-amber-500";
            default: return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    return (
        <AdminLayout>
            <div className="text-slate-800">

                {/* Encabezado */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Registrar Pago</h1>
                        <p className="text-xs text-slate-500">Asigna un nuevo cobro a una suscripción activa.</p>
                    </div>
                    <Link
                        href={route("superadmin.pagos.index")}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                        <ArrowLeftIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                        Volver
                    </Link>
                </div>

                {/* Formulario */}
                <form
                    onSubmit={submit}
                    className="space-y-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-full"
                >
                    {/* Alerta Informativa */}
                    {data.plan_id && (
                        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2.5 text-xs text-indigo-950 shadow-sm">
                            <InformationCircleIcon className="w-5 h-5 text-indigo-600 shrink-0" />
                            <div>
                                <strong>Suscripción detectada:</strong> El pago se aplicará a la organización <span className="underline font-semibold text-indigo-900">{infoSuscripcion.tenantNombre}</span> bajo el <span className="font-semibold text-indigo-900">{infoSuscripcion.planNombre}</span> (Precio base: <span className="font-bold text-indigo-600">{infoSuscripcion.planPrecio}</span>).
                            </div>
                        </div>
                    )}

                    {/* Campo: Suscripción */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Suscripción / Cliente afectado
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <UsersIcon className="w-4 h-4" />
                            </span>
                            <select
                                className="w-full border border-slate-300 rounded-xl p-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/30 text-slate-700"
                                value={data.suscripcion_id}
                                onChange={handleSuscripcionChange}
                            >
                                <option value="">Seleccione una suscripción...</option>
                                {suscripciones.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {/* 💡 Aquí agregamos el precio de forma visual al lado del plan */}
                                        {s.tenant?.nombre || 'Sin nombre'} — {s.plan?.nombre || 'Sin plan'} {s.plan?.precio ? `($${s.plan.precio})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.suscripcion_id && (
                            <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.suscripcion_id}</p>
                        )}
                    </div>

                    {/* Rejilla de 2 Columnas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Monto */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Monto ($)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <CurrencyDollarIcon className="w-4 h-4" />
                                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full border border-slate-300 rounded-xl p-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    value={data.monto}
                                    onChange={(e) => setData("monto", e.target.value)}
                                />
                            </div>
                            {errors.monto && (
                                <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.monto}</p>
                            )}
                        </div>

                        {/* Estado del Pago */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Estado del Pago</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                                    <CheckCircleIcon className="w-4 h-4" />
                                </span>
                                <select
                                    className={`w-full border rounded-xl p-2.5 pl-9 text-sm font-semibold focus:outline-none focus:ring-2 transition-all ${getEstadoEstilo(data.estado)}`}
                                    value={data.estado}
                                    onChange={(e) => setData("estado", e.target.value)}
                                >
                                    <option value="PAGADO">PAGADO (Confirmado)</option>
                                    <option value="PENDIENTE">PENDIENTE (Revisión)</option>
                                    <option value="ANULADO">ANULADO (Cancelado)</option>
                                    <option value="FALLIDO">FALLIDO (Rechazado)</option>
                                </select>
                            </div>
                            {errors.estado && (
                                <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.estado}</p>
                            )}
                        </div>

                        {/* Método de Pago */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Método de Pago</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none">
                                    <CreditCardIcon className="w-4 h-4" />
                                </span>
                                <select
                                    className="w-full border border-slate-300 rounded-xl p-2.5 pl-9 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white text-slate-700"
                                    value={data.metodo_pago}
                                    onChange={(e) => setData("metodo_pago", e.target.value)}
                                >
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                                    <option value="PAYPAL">PayPal</option>
                                    <option value="STRIPE">Stripe (Tarjeta)</option>
                                </select>
                            </div>
                            {errors.metodo_pago && (
                                <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.metodo_pago}</p>
                            )}
                        </div>

                        {/* Referencia */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Código de Referencia</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <KeyIcon className="w-4 h-4" />
                                </span>
                                <input
                                    placeholder="Ej: TXN-98234X"
                                    className="w-full border border-slate-300 rounded-xl p-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-700"
                                    value={data.referencia}
                                    onChange={(e) => setData("referencia", e.target.value)}
                                />
                            </div>
                            {errors.referencia && (
                                <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.referencia}</p>
                            )}
                        </div>
                    </div>

                    {/* Fecha Pago */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha y Hora del Pago</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <CalendarDaysIcon className="w-4 h-4" />
                            </span>
                            <input
                                type="datetime-local"
                                className="w-full border border-slate-300 rounded-xl p-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                                value={data.fecha_pago}
                                onChange={(e) => setData("fecha_pago", e.target.value)}
                            />
                        </div>
                        {errors.fecha_pago && (
                            <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.fecha_pago}</p>
                        )}
                    </div>

                    {/* Observación */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Observación / Notas internas</label>
                        <textarea
                            rows="2"
                            placeholder="Detalles adicionales sobre la transacción..."
                            className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-700"
                            value={data.observacion}
                            onChange={(e) => setData("observacion", e.target.value)}
                        />
                        {errors.observacion && (
                            <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.observacion}</p>
                        )}
                    </div>

                    {/* Botones de acción */}
                    <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                        <Link
                            href={route("superadmin.pagos.index")}
                            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? "Guardando..." : "Guardar Pago"}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
