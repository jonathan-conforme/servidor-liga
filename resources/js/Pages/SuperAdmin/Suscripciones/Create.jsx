import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";

export default function Create({ tenants, planes }) {

    // 1. Estado inicial limpio sin campos manuales de fecha_fin
    const { data, setData, post, processing, errors } = useForm({
        tenant_id: "",
        plan_id: "",
        fecha_inicio: "",
        estado: "ACTIVA",
        precio_pagado: 0,
    });

    // 2. CORREGIDO: Actualización de estado usando la sintaxis funcional segura de Inertia
    const handlePlanChange = (e) => {
        const seleccionadoPlanId = e.target.value;
        const plan = planes.find(p => p.id == seleccionadoPlanId);

        setData(prev => ({
            ...prev,
            plan_id: seleccionadoPlanId,
            precio_pagado: plan ? plan.precio : 0
        }));
    };

    // Buscamos reactivamente el plan seleccionado para pintar la información en la pantalla
    const planSeleccionado = planes.find(p => p.id == data.plan_id);

    // 3. MEJORADO: Envío con logs de monitoreo en consola
    const submit = (e) => {
        e.preventDefault();

        post(route("superadmin.suscripciones.store"), {
            onBefore: () => console.log("🚀 Enviando datos al backend:", data),
            onError: (err) => console.error("❌ Errores devueltos por el servidor:", err),
            onSuccess: () => console.log("✅ ¡Suscripción creada exitosamente!")
        });
    };

    return (
        <AdminLayout>
            <Head title="Nueva Suscripción" />

            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">
                        Nueva Suscripción
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Asigna un plan activo a una liga deportiva.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm"
                >
                    <div className="grid md:grid-cols-2 gap-6">

                        {/* Liga */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                Liga
                            </label>
                            <select
                                value={data.tenant_id}
                                onChange={(e) => setData("tenant_id", e.target.value)}
                                className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Seleccione...</option>
                                {tenants.map((tenant) => (
                                    <option key={tenant.id} value={tenant.id}>
                                        {tenant.nombre}
                                    </option>
                                ))}
                            </select>
                            {errors.tenant_id && (
                                <p className="text-red-500 text-sm mt-1">{errors.tenant_id}</p>
                            )}
                        </div>

                        {/* Plan */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                Plan
                            </label>
                            <select
                                value={data.plan_id}
                                onChange={handlePlanChange}
                                className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Seleccione...</option>
                                {planes.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.nombre}
                                    </option>
                                ))}
                            </select>
                            {errors.plan_id && (
                                <p className="text-red-500 text-sm mt-1">{errors.plan_id}</p>
                            )}
                        </div>

                        {/* Fecha Inicio */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                Fecha Inicio
                            </label>
                            <input
                                type="date"
                                value={data.fecha_inicio}
                                onChange={(e) => setData("fecha_inicio", e.target.value)}
                                className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.fecha_inicio && (
                                <p className="text-red-500 text-sm mt-1">{errors.fecha_inicio}</p>
                            )}
                        </div>

                        {/* Duración Automática Informativa */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-500">
                                Vigencia del Servicio
                            </label>
                            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between pointer-events-none select-none">
                                <span className="text-slate-500 text-sm">Duración establecida</span>
                                <span className="text-sm font-bold text-slate-800">
                                    {planSeleccionado ? `${planSeleccionado.duracion_dias} días corridos` : "Seleccione un plan..."}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                La fecha de vencimiento se calculará de forma automática en el servidor.
                            </p>
                        </div>

                        {/* Estado */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                Estado Inicial
                            </label>
                            <select
                                value={data.estado}
                                onChange={(e) => setData("estado", e.target.value)}
                                className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="ACTIVA">Activa</option>
                                <option value="SUSPENDIDA">Suspendida</option>
                                <option value="VENCIDA">Vencida</option>
                                <option value="CANCELADA">Cancelada</option>
                            </select>
                        </div>

                        {/* Valor base informativo */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-500">
                                Valor Contractual del Plan
                            </label>
                            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between pointer-events-none select-none">
                                <span className="text-slate-500 text-sm">Costo base</span>
                                <span className="text-lg font-bold text-slate-900">
                                    ${planSeleccionado ? planSeleccionado.precio : "0.00"}
                                </span>
                            </div>
                        </div>

                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
                        >
                            {processing ? "Guardando..." : "Guardar Suscripción"}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
