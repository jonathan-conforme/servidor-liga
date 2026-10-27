import SuperAdminLayout from "@/Layouts/AdminLayout";
import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Create() {

    // 1. Estados alineados perfectamente con las columnas de tu migración
    const { data, setData, post, processing, errors } = useForm({
        nombre: "",
        descripcion: "",
        precio: "",
        limite_usuarios: "",
        max_equipos: "",
        max_jugadores: "",
        max_torneos: "",
        permite_noticias: true,       // Valor por defecto según tu migración
        permite_galerias: true,       // Valor por defecto según tu migración
        permite_estadisticas: true,   // Valor por defecto según tu migración
        soporte_prioritario: false,   // Valor por defecto según tu migración
        activo: true,                 // Valor por defecto según tu migración
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("superadmin.plan.store"));
    };

    return (
        <SuperAdminLayout>
            <Head title="Crear Plan" />

            <div className="max-w-4xl mx-auto my-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Crear Nuevo Plan</h1>
                    <Link
                        href={route('superadmin.plan.index')}
                        className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition"
                    >
                        &larr; Volver al listado
                    </Link>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
                >
                    {/* Sección Básica */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Plan</label>
                            <input
                                type="text"
                                className="w-full border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.nombre}
                                onChange={(e) => setData("nombre", e.target.value)}
                            />
                            {errors.nombre && (
                                <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                            <textarea
                                rows="3"
                                className="w-full border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.descripcion}
                                onChange={(e) => setData("descripcion", e.target.value)}
                            />
                            {errors.descripcion && (
                                <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>
                            )}
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Sección de Límites y Costo */}
                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Precio ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.precio}
                                onChange={(e) => setData("precio", e.target.value)}
                            />
                            {errors.precio && (
                                <p className="text-red-500 text-xs mt-1">{errors.precio}</p>
                            )}
                        </div>
                         <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Límite de Usuarios (Máx)</label>
                            <input
                                type="number"
                                className="w-full border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.limite_usuarios}
                                onChange={(e) => setData("limite_usuarios", e.target.value)}
                            />
                            {errors.limite_usuarios && (
                                <p className="text-red-500 text-xs mt-1">{errors.limite_usuarios}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Límite de Equipos (Máx)</label>
                            <input
                                type="number"
                                className="w-full border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.max_equipos}
                                onChange={(e) => setData("max_equipos", e.target.value)}
                            />
                            {errors.max_equipos && (
                                <p className="text-red-500 text-xs mt-1">{errors.max_equipos}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Límite de Jugadores (Máx)</label>
                            <input
                                type="number"
                                className="w-full border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.max_jugadores}
                                onChange={(e) => setData("max_jugadores", e.target.value)}
                            />
                            {errors.max_jugadores && (
                                <p className="text-red-500 text-xs mt-1">{errors.max_jugadores}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Límite de Torneos (Máx)</label>
                            <input
                                type="number"
                                className="w-full border-gray-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.max_torneos}
                                onChange={(e) => setData("max_torneos", e.target.value)}
                            />
                            {errors.max_torneos && (
                                <p className="text-red-500 text-xs mt-1">{errors.max_torneos}</p>
                            )}
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Características y Permisos (Casillas para marcar / Checkboxes) */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Características y Estado del Plan</h3>
                        <div className="grid sm:grid-cols-2 gap-4">

                            {/* Permite Noticias */}
                            <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 cursor-pointer select-none hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                    checked={data.permite_noticias}
                                    onChange={(e) => setData("permite_noticias", e.target.checked)}
                                />
                                <div className="text-sm">
                                    <span className="font-semibold text-gray-700 block">Permitir Noticias</span>
                                    <span className="text-gray-500 text-xs">Permite a los tenants publicar novedades.</span>
                                </div>
                            </label>

                            {/* Permite Galerías */}
                            <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 cursor-pointer select-none hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                    checked={data.permite_galerias}
                                    onChange={(e) => setData("permite_galerias", e.target.checked)}
                                />
                                <div className="text-sm">
                                    <span className="font-semibold text-gray-700 block">Permitir Galerías</span>
                                    <span className="text-gray-500 text-xs">Habilita la subida de álbumes de fotos y multimedia.</span>
                                </div>
                            </label>

                            {/* Permite Estadísticas */}
                            <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 cursor-pointer select-none hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                    checked={data.permite_estadisticas}
                                    onChange={(e) => setData("permite_estadisticas", e.target.checked)}
                                />
                                <div className="text-sm">
                                    <span className="font-semibold text-gray-700 block">Módulo de Estadísticas Avanzadas</span>
                                    <span className="text-gray-500 text-xs">Acceso a métricas de rendimiento y tablas detalladas.</span>
                                </div>
                            </label>

                            {/* Soporte Prioritario */}
                            <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 cursor-pointer select-none hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                    checked={data.soporte_prioritario}
                                    onChange={(e) => setData("soporte_prioritario", e.target.checked)}
                                />
                                <div className="text-sm">
                                    <span className="font-semibold text-gray-700 block">Soporte Prioritario</span>
                                    <span className="text-gray-500 text-xs">Atención al cliente preferencial 24/7.</span>
                                </div>
                            </label>

                            {/* Plan Activo */}
                            <label className="flex items-start gap-3 p-3 rounded-xl border border-indigo-100 bg-indigo-50/30 cursor-pointer select-none hover:bg-indigo-50/50 sm:col-span-2">
                                <input
                                    type="checkbox"
                                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                    checked={data.activo}
                                    onChange={(e) => setData("activo", e.target.checked)}
                                />
                                <div className="text-sm">
                                    <span className="font-semibold text-indigo-900 block">Plan Activo y Disponible</span>
                                    <span className="text-indigo-700 text-xs">Si se desmarca, los nuevos usuarios no podrán adquirir este plan.</span>
                                </div>
                            </label>

                        </div>
                    </div>

                    {/* Botón de envío */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {processing ? 'Guardando...' : 'Guardar Plan'}
                        </button>
                    </div>

                </form>
            </div>
        </SuperAdminLayout>
    );
}
