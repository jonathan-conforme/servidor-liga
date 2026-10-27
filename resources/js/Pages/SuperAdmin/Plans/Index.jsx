import React from 'react';
import AdminLayout from "@/Layouts/AdminLayout";
import { Link, router, Head } from '@inertiajs/react';

// 1. IMPORTACIÓN CORREGIDA PARA HEROICONS (Línea estética fina de 24px)
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
    StarIcon
} from '@heroicons/react/24/outline';

export default function Index({ planes }) {

    // Función UX de eliminación segura
    const handleDelete = (id, nombre) => {
        if (confirm(`¿Estás seguro de que deseas eliminar el plan "${nombre}"?`)) {
            router.delete(route('superadmin.plan.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Gestión de Planes" />

            {/* Header de la sección */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Planes del Sistema
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Configura las características, límites de recursos y precios de las suscripciones.
                    </p>
                </div>

                <Link
                    href={route('superadmin.plan.create')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm shadow-sm shadow-indigo-100 hover:bg-indigo-700 transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    {/* 2. ICONO NUEVO PLAN CORREGIDO */}
                    <PlusIcon className="w-5 h-5" strokeWidth={2.5} />
                    Nuevo Plan
                </Link>
            </div>

            {/* Contenedor principal de la Tabla */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold uppercase tracking-wider text-gray-600">
                                <th className="p-4 pl-6">Nombre del Plan</th>
                                <th className="p-4">Precio</th>
                                <th className="p-4 text-center">Límite Usuarios</th>
                                <th className="p-4 text-center">Límite Equipos</th>
                                <th className="p-4 text-center">Límite Jugadores</th>
                                <th className="p-4 text-center">Límite Torneos</th>
                                <th className="p-4 text-center">Características</th>
                                <th className="p-4 text-center">Estado</th>
                                <th className="p-4 pr-6 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {planes.data.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-gray-400">
                                        No hay planes registrados en el sistema actualmente.
                                    </td>
                                </tr>
                            ) : (
                                planes.data.map(plan => (
                                    <tr key={plan.id} className="hover:bg-gray-50/50 transition-colors">
                                        {/* Nombre */}
                                        <td className="p-4 pl-6">
                                            <div className="font-semibold text-gray-900">{plan.nombre}</div>
                                            {plan.descripcion && (
                                                <div className="text-xs text-gray-400 max-w-xs truncate mt-0.5" title={plan.descripcion}>
                                                    {plan.descripcion}
                                                </div>
                                            )}
                                        </td>

                                        {/* Precio */}
                                        <td className="p-4 font-medium text-gray-900">
                                            {parseFloat(plan.precio) === 0 ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                    Gratis
                                                </span>
                                            ) : (
                                                `$${parseFloat(plan.precio).toFixed(2)}`
                                            )}
                                        </td>

                                        {/* Límites de recursos */}
                                        <td className="p-4 text-center font-mono text-gray-600">
                                            {plan.limite_usuarios ?? '∞'}
                                        </td>
                                        <td className="p-4 text-center font-mono text-gray-600">
                                            {plan.max_equipos ?? '∞'}
                                        </td>
                                        <td className="p-4 text-center font-mono text-gray-600">
                                            {plan.max_jugadores ?? '∞'}
                                        </td>
                                        <td className="p-4 text-center font-mono text-gray-600">
                                            {plan.max_torneos ?? '∞'}
                                        </td>

                                        {/* Badges de características */}
                                        {/* Badges de características */}
                                        <td className="p-4">
                                            <div className="flex flex-wrap justify-center gap-1.5 max-w-[220px] mx-auto">
                                                {/* Noticias */}
                                                {plan.permite_noticias ? (
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-md border border-blue-100">
                                                        Noticias
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[11px] rounded-md border border-gray-100 line-through">
                                                        Noticias
                                                    </span>
                                                )}

                                                {/* Galerías */}
                                                {plan.permite_galerias ? (
                                                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[11px] font-medium rounded-md border border-purple-100">
                                                        Fotos
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[11px] rounded-md border border-gray-100 line-through">
                                                        Fotos
                                                    </span>
                                                )}

                                                {/* Estadísticas */}
                                                {plan.permite_estadisticas ? (
                                                    <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[11px] font-medium rounded-md border border-teal-100">
                                                        Stats
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[11px] rounded-md border border-gray-100 line-through">
                                                        Stats
                                                    </span>
                                                )}

                                                {/* Soporte VIP */}
                                                {plan.soporte_prioritario ? (
                                                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-50 text-amber-700 text-[11px] font-semibold rounded-md border border-amber-200 shadow-sm">
                                                        <StarIcon className="w-3 h-3 text-amber-500" strokeWidth={2.5} /> VIP
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[11px] rounded-md border border-gray-100 line-through">
                                                        Soporte
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Estado Activo */}
                                        <td className="p-4 text-center">
                                            {plan.activo ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                    {/* 4. ICONO CHECK CORREGIDO */}
                                                    <CheckCircleIcon className="w-4 h-4 text-emerald-600" /> Activo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-600 border border-rose-100">
                                                    {/* 5. ICONO X (INACTIVO) CORREGIDO */}
                                                    <XCircleIcon className="w-4 h-4 text-rose-500" /> Inactivo
                                                </span>
                                            )}
                                        </td>

                                        {/* Acciones */}
                                        <td className="p-4 pr-6 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                {/* Botón Editar */}
                                                <Link
                                                    href={route('superadmin.plan.edit', plan.id)}
                                                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Editar plan"
                                                >
                                                    {/* 6. ICONO EDITAR CORREGIDO */}
                                                    <PencilIcon className="w-4 h-4" />
                                                </Link>

                                                {/* Botón Eliminar con confirmación */}
                                                <button
                                                    onClick={() => handleDelete(plan.id, plan.nombre)}
                                                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Eliminar plan"
                                                >
                                                    {/* 7. ICONO ELIMINAR CORREGIDO */}
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Bloque de Paginación Inteligente */}
                {planes.links && planes.links.length > 3 && (
                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                            Mostrando {planes.data.length} de {planes.total} planes registrados
                        </div>
                        <div className="flex items-center gap-1">
                            {planes.links.map((link, idx) => {
                                if (link.url === null) return null;
                                return (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${link.active
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 bg-white border border-gray-200'
                                            }`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
