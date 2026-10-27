// ==========================================
// 4. ARCHIVO: resources/js/Pages/SuperAdmin/Tenants/Show.jsx
// ==========================================
import React from 'react';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';

export default function Show({ tenant }) {
    return (
        <div className="max-w-4xl mx-auto py-4 px-4">

            {/* Encabezado Principal */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    {tenant.logo ? (
                        <img
                            src={`/storage/${tenant.logo}`}
                            alt={`Logo de ${tenant.nombre}`}
                            className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                        />
                    ) : (
                        <div className="p-4 bg-indigo-100 rounded-xl text-indigo-600 shadow-sm">
                            <BusinessOutlinedIcon fontSize="large" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{tenant.nombre}</h1>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${tenant.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {tenant.activo ? 'Organización Activa' : 'Inactiva'}
                            </span>
                            <span className="text-xs text-gray-500">
                                Registrado el {new Date(tenant.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de Información */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Tarjeta 1: Accesos y Enlaces */}
                <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
                    <h2 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                        <LanguageOutlinedIcon className="text-indigo-500" fontSize="small" />
                        Accesos y Enlaces
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Subdominio (Portal)</p>
                            <p className="mt-1 text-sm text-indigo-700 font-mono bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                                {tenant.subdominio}.tudominio.com
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Identificador URL (Slug)</p>
                            <p className="mt-1 text-sm text-gray-700 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                                /ligas/{tenant.slug}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tarjeta 2: Datos del Administrador */}
                <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
                    <h2 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                        <PersonOutlineOutlinedIcon className="text-emerald-500" fontSize="small" />
                        Representante Legal
                    </h2>

                    <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                            <PersonOutlineOutlinedIcon className="text-gray-400 mt-0.5" fontSize="small" />
                            <div>
                                <p className="text-xs font-medium text-gray-500">Nombre del Administrador</p>
                                <p className="text-sm text-gray-900 font-medium">{tenant.administrador || <span className="text-gray-400 italic font-normal">No registrado</span>}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <BadgeOutlinedIcon className="text-gray-400 mt-0.5" fontSize="small" />
                            <div>
                                <p className="text-xs font-medium text-gray-500">Cédula de Identidad</p>
                                <p className="text-sm text-gray-900 font-mono">{tenant.cedula || <span className="text-gray-400 italic font-normal">No registrada</span>}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tarjeta 3: Información de Contacto */}
                <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm md:col-span-2">
                    <h2 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                        <PhoneOutlinedIcon className="text-slate-700" fontSize="small" />
                        Información de Contacto y Ubicación
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-start gap-2.5">
                            <EmailOutlinedIcon className="text-gray-400 mt-0.5" fontSize="small" />
                            <div>
                                <p className="text-xs font-medium text-gray-500">Correo Electrónico</p>
                                <p className="text-sm text-gray-900 break-all">{tenant.email || <span className="text-gray-400 italic">No registrado</span>}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <PhoneOutlinedIcon className="text-gray-400 mt-0.5" fontSize="small" />
                            <div>
                                <p className="text-xs font-medium text-gray-500">Teléfono</p>
                                <p className="text-sm text-gray-900">{tenant.telefono || <span className="text-gray-400 italic">No registrado</span>}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <LocationOnOutlinedIcon className="text-gray-400 mt-0.5" fontSize="small" />
                            <div>
                                <p className="text-xs font-medium text-gray-500">Ubicación Geográfica</p>
                                <p className="text-sm text-gray-900">
                                    {tenant.ciudad && `${tenant.ciudad}, `}
                                    {tenant.canton && `${tenant.canton}, `}
                                    {tenant.provincia || <span className="text-gray-400 italic">Sin dirección</span>}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
