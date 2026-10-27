import React from 'react';
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm, Link } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    CloudArrowUpIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function Edit({ plan }) {

    // Inicializamos el formulario con los datos que vienen de la BD
    const { data, setData, patch, processing, errors } = useForm({
        nombre: plan.nombre || "",
        descripcion: plan.descripcion || "",
        precio: plan.precio || "",
        limite_usuarios: plan.limite_usuarios || "",
        max_equipos: plan.max_equipos || "",
        max_jugadores: plan.max_jugadores || "",
        max_torneos: plan.max_torneos || "",
        permite_noticias: plan.permite_noticias == 1,
        permite_galerias: plan.permite_galerias == 1,
        permite_estadisticas: plan.permite_estadisticas == 1,
        soporte_prioritario: plan.soporte_prioritario == 1,
        activo: plan.activo == 1,
    });

    const submit = (e) => {
        e.preventDefault();
        // Usamos patch o put para actualizaciones en Laravel
        patch(route("superadmin.plan.update", plan.id));
    };

    return (
        <AdminLayout>
            <Head title={`Editar Plan: ${plan.nombre}`} />

            <div className="max-w-4xl mx-auto my-6">
                {/* Navegación y Título */}
                <div className="flex flex-col gap-2 mb-8">
                    <Link
                        href={route('superadmin.plan.index')}
                        className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 transition-colors w-fit"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-1" />
                        Volver al listado de planes
                    </Link>
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Editar Plan: <span className="text-indigo-600">{plan.nombre}</span>
                    </h1>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    {/* Tarjeta de Información Principal */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                            Información General
                        </h2>

                        <div className="grid gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del Plan</label>
                                <input
                                    type="text"
                                    className={`w-full px-4 py-3 border rounded-2xl focus:ring-4 focus:ring-indigo-50 transition-all ${errors.nombre ? 'border-red-400' : 'border-gray-200'}`}
                                    value={data.nombre}
                                    onChange={e => setData("nombre", e.target.value)}
                                    placeholder="Ej: Plan Premium"
                                />
                                {errors.nombre && <p className="text-red-500 text-xs mt-2 font-medium">{errors.nombre}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Descripción</label>
                                <textarea
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 transition-all"
                                    value={data.descripcion}
                                    onChange={e => setData("descripcion", e.target.value)}
                                    placeholder="Describe brevemente los beneficios de este plan..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta de Límites y Costos */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                            Límites y Precios
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Precio Mensual ($)</label>
                                <input
                                    type="number" step="0.01"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 transition-all font-mono"
                                    value={data.precio}
                                    onChange={e => setData("precio", e.target.value)}
                                />
                            </div>
                             <div>

                                <label className="block text-sm font-bold text-gray-700 mb-2">Máximo de usuarios</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 transition-all"
                                    value={data.limite_usuarios}
                                    onChange={e => setData("limite_usuarios", e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Máximo de Equipos</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 transition-all"
                                    value={data.max_equipos}
                                    onChange={e => setData("max_equipos", e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Máximo de Jugadores</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 transition-all"
                                    value={data.max_jugadores}
                                    onChange={e => setData("max_jugadores", e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Máximo de Torneos</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 transition-all"
                                    value={data.max_torneos}
                                    onChange={e => setData("max_torneos", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Características (Checkboxes Estilizados) */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <div className="w-2 h-6 bg-amber-400 rounded-full"></div>
                            Módulos y Estado
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { id: 'permite_noticias', label: 'Módulo de Noticias', desc: 'Permite publicar artículos y novedades.' },
                                { id: 'permite_galerias', label: 'Módulo de Galerías', desc: 'Permite subir fotos y álbumes.' },
                                { id: 'permite_estadisticas', label: 'Estadísticas Pro', desc: 'Acceso a métricas avanzadas.' },
                                { id: 'soporte_prioritario', label: 'Soporte VIP', desc: 'Atención prioritaria 24/7.' },
                            ].map((item) => (
                                <label key={item.id} className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${data[item.id] ? 'border-indigo-100 bg-indigo-50/30' : 'border-gray-50 bg-gray-50/30 hover:border-gray-200'}`}>
                                    <input
                                        type="checkbox"
                                        className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                        checked={data[item.id]}
                                        onChange={e => setData(item.id, e.target.checked)}
                                    />
                                    <div>
                                        <span className={`block text-sm font-bold ${data[item.id] ? 'text-indigo-900' : 'text-gray-700'}`}>{item.label}</span>
                                        <span className="block text-xs text-gray-500 mt-1">{item.desc}</span>
                                    </div>
                                </label>
                            ))}
                        </div>

                        {/* Switch de Estado del Plan */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <label className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${data.activo ? 'border-emerald-100 bg-emerald-50/30' : 'border-rose-100 bg-rose-50/30'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${data.activo ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                        <CheckCircleIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className={`block font-bold ${data.activo ? 'text-emerald-900' : 'text-rose-900'}`}>Disponibilidad del Plan</span>
                                        <span className="text-xs text-gray-500">{data.activo ? 'El plan es visible y puede ser adquirido por nuevos clientes.' : 'El plan está oculto para nuevas suscripciones.'}</span>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-12 h-6 rounded-full bg-gray-200 text-emerald-500 focus:ring-emerald-500 border-none cursor-pointer"
                                    checked={data.activo}
                                    onChange={e => setData("activo", e.target.checked)}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex items-center justify-end gap-4 pb-12">
                        <Link
                            href={route('superadmin.plan.index')}
                            className="px-8 py-3.5 text-gray-500 font-bold hover:text-gray-700 transition-colors"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-10 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {processing ? (
                                'Actualizando...'
                            ) : (
                                <>
                                    <CloudArrowUpIcon className="w-5 h-5" />
                                    Actualizar Plan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
