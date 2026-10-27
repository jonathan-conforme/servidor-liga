import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import FlashMessage from '@/Components/FlashMessage';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

// Material UI Icons corregidos y especificos
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined';

import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

export default function TenantLayout({ header, children }) {
    // 1. Obtención segura de propiedades globales
    const user = usePage().props.auth?.user;
    const { tenantSinSuscripcion = false } = usePage().props;

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // 2. Control de iniciales seguro
    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    // 3. Estructura de navegación ajustada con iconos coherentes y la nueva ruta 'Inscripciones'
    const navigationLinks = [
        { name: 'Categorías', route: 'tenant.categorias.index', icon: <CategoryOutlinedIcon fontSize="small" /> },
        { name: 'Torneos', route: 'tenant.torneos.index', icon: <EmojiEventsOutlinedIcon fontSize="small" /> },
        { name: 'Equipos', route: 'tenant.equipos.index', icon: <GroupsOutlinedIcon fontSize="small" /> },
        { name: 'Jugadores', route: 'tenant.jugadores.index', icon: <PersonOutlinedIcon fontSize="small" /> },
        { name: 'Jornadas', route: 'tenant.jornadas.index', icon: <CalendarMonthOutlinedIcon fontSize="small" /> },
        { name: 'Inscripciones', route: 'tenant.inscripciones.index', icon: <HowToRegOutlinedIcon fontSize="small" /> },
        { name: 'Partidos', route: 'tenant.partidos.index', icon: <CalendarMonthOutlinedIcon fontSize="small" /> },
        { name: 'Tablas', route: 'dashboard', icon: <LeaderboardOutlinedIcon fontSize="small" /> },
        { name: 'Goleadores', route: 'dashboard', icon: <MilitaryTechOutlinedIcon fontSize="small" /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">

            {/* MOBILE HEADER */}
            <div className="bg-white border-b px-5 py-3 flex items-center justify-between md:hidden sticky top-0 z-40">
                <Link href="/" className="flex items-center gap-2">
                    <ApplicationLogo className="h-8 w-auto" />
                    <span className="font-bold">Liga Manager</span>
                </Link>

                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Abrir menú">
                    {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
                </button>
            </div>

            {/* SIDEBAR */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-white border-r
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    transition-transform duration-200
                    md:translate-x-0 md:static md:flex
                    flex-col justify-between
                `}
            >
                <div>
                    <div className="h-16 flex items-center px-6 border-b">
                        <Link href="/" className="flex items-center gap-2">
                            <ApplicationLogo className="h-8 w-auto" />
                            <span className="font-bold text-slate-900">Liga Manager</span>
                        </Link>
                    </div>

                    <nav className="mt-5 px-3 space-y-1">
                        {!tenantSinSuscripcion ? (
                            navigationLinks.map((link) => {
                                // Soporta resaltado en sub-rutas usando comodines
                                const active = route().current(link.route) || route().current(`${link.route}.*`);
                                return (
                                    <Link
                                        key={link.name}
                                        href={route().has(link.route) ? route(link.route) : '#'}
                                        onClick={() => setIsSidebarOpen(false)} // Cierra el menú al navegar en móvil
                                        className={`
                                            flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                                            ${active ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                                        `}
                                    >
                                        {link.icon}
                                        <span>{link.name}</span>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="px-4 py-3 bg-amber-50 text-amber-800 text-xs rounded-xl font-medium border border-amber-200 flex gap-2 items-start">
                                <WarningAmberOutlinedIcon fontSize="small" className="shrink-0 mt-0.5" />
                                <span>Menú temporalmente deshabilitado por falta de pago.</span>
                            </div>
                        )}
                    </nav>
                </div>

                {/* MENÚ DE USUARIO INFERIOR (SIDEBAR) CON OPCIONES MÓVILES */}
                <div className="p-4 border-t bg-slate-50/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                {getInitials(user?.name)}
                            </div>
                            <div className="truncate">
                                <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'Usuario'}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email || 'Liga Activa'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Acceso directo a Perfil y Salir en Móvil */}
                    <div className="mt-3 pt-3 border-t flex items-center justify-around md:hidden">
                        <Link href={route('profile.edit')} className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-indigo-600">
                            <AccountCircleOutlinedIcon fontSize="small" />
                            <span>Perfil</span>
                        </Link>
                        <Link href={route('logout')} method="post" as="button" className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700">
                            <LogoutOutlinedIcon fontSize="small" />
                            <span>Salir</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* OVERLAY MOBILE */}
            {isSidebarOpen && (
                <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/20 z-40 md:hidden" />
            )}

            {/* CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* DESKTOP HEADER */}
                <header className="hidden md:flex h-16 bg-white border-b items-center justify-between px-8 sticky top-0 z-30">
                    <div className="font-semibold text-slate-500 uppercase text-xs tracking-wider">
                        Sistema de Gestión Deportiva
                    </div>

                    <Dropdown>
                        <Dropdown.Trigger>
                            <button type="button" className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium text-sm focus:outline-none">
                                <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                                    {getInitials(user?.name)}
                                </div>
                                <span>{user?.name || 'Mi Cuenta'}</span>
                                <KeyboardArrowDownIcon fontSize="small" />
                            </button>
                        </Dropdown.Trigger>

                        <Dropdown.Content>
                            <Dropdown.Link href={route('profile.edit')}>
                                <div className="flex items-center gap-2">
                                    <AccountCircleOutlinedIcon fontSize="small" />
                                    Perfil
                                </div>
                            </Dropdown.Link>

                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                <div className="flex items-center gap-2 text-red-600 font-medium">
                                    <LogoutOutlinedIcon fontSize="small" />
                                    Cerrar sesión
                                </div>
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </header>

                <FlashMessage />

                {/* ALERTA GLOBAL DE BLOQUEO DEBAJO DEL HEADER */}
                {tenantSinSuscripcion && (
                    <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border-b border-amber-600">
                        <div className="flex items-center gap-3 text-center sm:text-left">
                            <WarningAmberOutlinedIcon className="hidden sm:block" />
                            <div>
                                <p className="font-bold text-sm sm:text-base">Liga Suspendida o Sin Plan Activo</p>
                                <p className="text-xs text-slate-100">Las funciones operativas están bloqueadas. Contacta al soporte o regulariza tu pago.</p>
                            </div>
                        </div>
                        <Link
                            href="#"
                            className="bg-white text-orange-700 px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-orange-50 transition shadow-sm whitespace-nowrap"
                        >
                            Renovar Suscripción
                        </Link>
                    </div>
                )}

                <main className="p-6 lg:p-8">
                    {!tenantSinSuscripcion && header && (
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-slate-900">{header}</h1>
                        </div>
                    )}

                    {/* BLOQUEO VISUAL DEL PANEL CENTRAL */}
                    {tenantSinSuscripcion ? (
                        <div className="bg-white rounded-2xl border p-12 shadow-sm text-center max-w-xl mx-auto mt-8">
                            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
                                <WarningAmberOutlinedIcon fontSize="large" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Acceso Denegado al Dashboard</h2>
                            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                                Detectamos que el periodo de prueba o la suscripción contratada para esta liga ha caducado.
                                Para reactivar la administración de equipos, árbitros y torneos, solicita la activación de un plan.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border p-6 shadow-sm">
                            {children}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
