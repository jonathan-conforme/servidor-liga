// ==========================================
// 1. ARCHIVO: resources/js/Pages/SuperAdmin/Tenants/Index.jsx
// ==========================================
import SuperAdminLayout from '@/Layouts/AdminLayout';
import Create from './Create'; // Corregido el import a mayúscula
import Edit from './Edit';
import Show from './Show';
import React, { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

export default function Index({ tenants }) {
    const [isShowModalOpen, setIsShowModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState(null);

    const openShowModal = (tenant) => {
        setSelectedTenant(tenant);
        setIsShowModalOpen(true);
    };

    const openEditModal = (tenant) => {
        setSelectedTenant(tenant);
        setIsEditModalOpen(true); // Reparado: No se estaba activando el estado
    };

    const openCreateModal = () => {
        setIsCreateModalOpen(true); // Reparado: Faltaba la función del botón "Nueva Liga"
    };

    const closeModal = () => {
        setIsShowModalOpen(false);
        setIsEditModalOpen(false);
        setIsCreateModalOpen(false);
        setTimeout(() => setSelectedTenant(null), 300);
    };

    return (
        <SuperAdminLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestión de Ligas</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Administra todas las ligas registradas en la plataforma.
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                >
                    <AddIcon fontSize="small" />
                    Nueva Liga
                </button>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white border rounded-2xl p-5">
                    <p className="text-sm text-slate-500">Total de ligas</p>
                    <h3 className="text-3xl font-bold mt-2">{tenants.total}</h3>
                </div>
                <div className="bg-white border rounded-2xl p-5">
                    <p className="text-sm text-slate-500">Activas</p>
                    <h3 className="text-3xl font-bold mt-2 text-green-600">
                        {tenants.data.filter(t => t.activo).length}
                    </h3>
                </div>
                <div className="bg-white border rounded-2xl p-5">
                    <p className="text-sm text-slate-500">Inactivas</p>
                    <h3 className="text-3xl font-bold mt-2 text-red-600">
                        {tenants.data.filter(t => !t.activo).length}
                    </h3>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h2 className="font-semibold text-slate-900">Listado de Ligas</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr className="text-left">
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">Liga</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">Subdominio</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">Email</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">Teléfono</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">Estado</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenants.data.map((tenant) => (
                                <tr key={tenant.id} className="border-t hover:bg-slate-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {tenant.logo ? (
                                                <img src={`/storage/${tenant.logo}`} alt={tenant.nombre} className="h-10 w-10 rounded-lg object-cover" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                    <BusinessOutlinedIcon fontSize="small" className="text-indigo-600" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-slate-900">{tenant.nombre}</p>
                                                <p className="text-xs text-slate-500">{tenant.ciudad}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{tenant.subdominio}</td>
                                    <td className="px-6 py-4 text-slate-600">{tenant.email}</td>
                                    <td className="px-6 py-4 text-slate-600">{tenant.telefono}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tenant.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {tenant.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <button onClick={() => openShowModal(tenant)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition font-medium">
                                                <VisibilityOutlinedIcon fontSize="small" /> Ver
                                            </button>
                                            <button onClick={() => openEditModal(tenant)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition font-medium">
                                                <EditOutlinedIcon fontSize="small" /> Editar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* ESTRUCTURA ÚNICA DE MODALES (SHOW, EDIT Y CREATE CONDICIONALES) */}
                    {(isShowModalOpen || isEditModalOpen || isCreateModalOpen) && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
                            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4 p-6 relative">

                                <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg">
                                    ✕
                                </button>

                              

                                {/* Modal CONTENEDOR EDIT */}
                                {isEditModalOpen && selectedTenant && (
                                    <Edit tenant={selectedTenant} onClose={closeModal} />
                                )}

                                {/* Modal CONTENEDOR CREATE */}
                                {isCreateModalOpen && (
                                    <Create onClose={closeModal} />
                                )}
                                {/* Modal CONTENEDOR SHOW */}
                                {isShowModalOpen && selectedTenant && (
                                    <Show tenant={selectedTenant} />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SuperAdminLayout>
    );
}
