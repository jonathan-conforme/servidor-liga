import React from 'react';
import { Head, Link } from '@inertiajs/react';
import TenantLayout from '@/Layouts/TenantLayout';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function Error({ status = 403 }) {
    const titles = {
        403: 'Acceso Restringido',
        404: 'Página No Encontrada',
        500: 'Error del Servidor',
    };

    const descriptions = {
        403: 'No tienes los permisos suficientes para acceder a esta opción. Por favor, contáctate con el administrador de la liga para que te otorgue los permisos que necesitas.',
        404: 'La página que intentas visitar no existe o fue movida.',
        500: 'Ocurrió un problema inesperado en el servidor. Inténtalo más tarde.',
    };

    const title = titles[status] || 'Error';
    const description = descriptions[status] || 'Ha ocurrido un error inesperado.';

    return (
        <TenantLayout>
            <Head title={title} />
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-amber-200">
                    <LockOutlinedIcon style={{ fontSize: 40 }} />
                </div>

                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider mb-3 border border-amber-200">
                    Código {status}
                </span>

                <h1 className="text-2xl font-bold text-slate-800 mb-2">
                    {title}
                </h1>

                <p className="text-slate-500 text-sm max-w-md leading-relaxed mb-6">
                    {description}
                </p>

                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    component={Link}
                    href={route('dashboard')}
                    sx={{ textTransform: 'none', borderRadius: 2.5, px: 3, py: 1 }}
                >
                    Volver al Dashboard
                </Button>
            </div>
        </TenantLayout>
    );
}