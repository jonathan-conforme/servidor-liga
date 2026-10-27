import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";

export default function Edit({ suscripcion = {}, tenants = [], planes = [] }) {

    // 1. 👇 Inicializamos el formulario SIN 'fecha_fin' ni 'precio_pagado' mutables a mano
    const { data, setData, put, processing, errors } = useForm({
        tenant_id: suscripcion?.tenant_id || "",
        plan_id: suscripcion?.plan_id || "",
        fecha_inicio: suscripcion?.fecha_inicio ? suscripcion.fecha_inicio.substring(0, 10) : "",
        estado: suscripcion?.estado || "ACTIVA",
    });

    const submit = (e) => {
        e.preventDefault();
        // Mandamos los datos limpios. El backend se encargará de recalcular precio y vigencia
        put(route("superadmin.suscripciones.update", { suscripcion: suscripcion.id }));
    };

    // 2. 👇 Buscamos reactivamente el plan seleccionado para mostrar sus datos reales en pantalla
    const planSeleccionado = planes.find(p => p.id == data.plan_id);

    return (
        <AdminLayout>
            <Head title="Editar Suscripción" />

            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Editar Suscripción</h1>
                    <p className="text-slate-500">
                        Actualiza la información de la suscripción.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm"
                >
                    <div className="grid md:grid-cols-2 gap-6">

                        {/* Liga */}
                        <div>
                            <label className="block mb-2 text-sm font-medium">Liga</label>
                            <select
                                value={data.tenant_id}
                                onChange={(e) => setData("tenant_id", e.target.value)}
                                className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                {tenants.map((tenant) => (
                                    <option key={tenant.id} value={tenant.id}>
                                        {tenant.nombre}
                                    </option>
                                ))}
                            </select>
                            {errors.tenant_id && <span className="text-red-500 text-xs">{errors.tenant_id}</span>}
                        </div>

                        {/* Plan */}
                        <div>
                            <label className="block mb-2 text-sm font-medium">Plan</label>
                            <select
                                value={data.plan_id}
                                // 👇 Actualiza el plan y dispara la actualización de las etiquetas informativas automáticamente
                                onChange={(e) => setData("plan_id", e.target.value)}
                                className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                {planes.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.nombre}
                                    </option>
                                ))}
                            </select>
                            {errors.plan_id && <span className="text-red-500 text-xs">{errors.plan_id}</span>}
                        </div>

                        {/* Fecha Inicio */}
                        <div>
                            <label className="block mb-2 text-sm font-medium">Fecha Inicio</label>
                            <input
                                type="date"
                                value={data.fecha_inicio}
                                onChange={(e) => setData("fecha_inicio", e.target.value)}
                                className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.fecha_inicio && <span className="text-red-500 text-xs">{errors.fecha_inicio}</span>}
                        </div>

                        {/* 👇 SUSTITUCIÓN: Duración Automática en lugar del viejo Fecha Fin manual */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-500">
                                Vigencia del Plan Seleccionado
                            </label>
                            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between pointer-events-none select-none">
                                <span className="text-slate-500 text-sm">Duración contratada</span>
                                <span className="text-sm font-bold text-slate-800">
                                    {planSeleccionado ? `${planSeleccionado.duracion_dias} días corridos` : "Seleccione un plan..."}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                El sistema recalculará la nueva fecha de vencimiento al guardar.
                            </p>
                        </div>

                        {/* Estado */}
                        <div>
                            <label className="block mb-2 text-sm font-medium">Estado</label>
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
                            {errors.estado && <span className="text-red-500 text-xs">{errors.estado}</span>}
                        </div>

                        {/* Costo Informativo */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-500">
                                Costo del Plan Seleccionado
                            </label>
                            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between pointer-events-none">
                                <span className="text-slate-600 text-sm">Valor contractual</span>
                                <span className="text-lg font-bold text-slate-900">
                                    ${planSeleccionado ? planSeleccionado.precio : "0.00"}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                El valor de la transacción real se gestiona en el módulo de Pagos.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-medium shadow-sm transition-colors"
                        >
                            {processing ? "Actualizando..." : "Actualizar Suscripción"}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
