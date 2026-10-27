import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

// Material UI Icons
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import SportsSoccerOutlinedIcon from '@mui/icons-material/SportsSoccerOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import StadiumOutlinedIcon from '@mui/icons-material/StadiumOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import NewspaperOutlinedIcon from '@mui/icons-material/NewspaperOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FlashMessage from '@/Components/FlashMessage';
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
export default function AdminLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const getInitials = (name) => {
        return name
            ? name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()
            : 'U';
    };

    const navigationLinks = [
        {
            name: 'Dashboard',
            route: 'dashboard',
            icon: <DashboardOutlinedIcon fontSize="small" />,
        },
        {
            name: 'Ligas',
            route: 'superadmin.tenants.index',
            icon: <BusinessOutlinedIcon />
        },
        {
            name: 'Plan',
            route: 'superadmin.plan.index',
            icon: <EmojiEventsOutlinedIcon fontSize="small" />,
        },
        {
            name: 'Suscripciones',
            route: 'superadmin.suscripciones.index',
            icon: <EmojiEventsOutlinedIcon fontSize="small" />,
        },
        {
            name: 'Pagos ',
            route: 'superadmin.pagos.index',
            icon: <GroupsOutlinedIcon fontSize="small" />,
        },
        {
            name: 'Estadisticas Globales',
            route: 'dashboard',
            icon: <PersonOutlinedIcon fontSize="small" />,
        },
        {
            name: 'Partidos',
            route: 'dashboard',
            icon: <SportsSoccerOutlinedIcon fontSize="small" />,
        },
        {
            name: 'Estadios',
            route: 'dashboard',
            icon: <StadiumOutlinedIcon fontSize="small" />,
        },
        {
            name: 'Árbitros',
            route: 'dashboard',
            icon: <GavelOutlinedIcon fontSize="small" />,
        },
        {
            name: 'Noticias',
            route: 'dashboard',
            icon: <NewspaperOutlinedIcon fontSize="small" />,
        },
        {
            name: 'Galerías',
            route: 'dashboard',
            icon: <PhotoLibraryOutlinedIcon fontSize="small" />,
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">

            {/* MOBILE HEADER */}
            <div className="bg-white border-b px-5 py-3 flex items-center justify-between md:hidden sticky top-0 z-40">
                <Link href="/" className="flex items-center gap-2">
                    <ApplicationLogo className="h-8 w-auto" />
                    <span className="font-bold">
                        Liga Manager
                    </span>
                </Link>

                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    {isSidebarOpen ? (
                        <CloseIcon />
                    ) : (
                        <MenuIcon />
                    )}
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
                        <Link
                            href="/"
                            className="flex items-center gap-2"
                        >
                            <ApplicationLogo className="h-8 w-auto" />

                            <span className="font-bold text-slate-900">
                                Liga Manager
                            </span>
                        </Link>
                    </div>

                    <nav className="mt-5 px-3 space-y-1">
                        {navigationLinks.map((link) => {
                            const active =
                                route().current(link.route);

                            return (
                                <Link
                                    key={link.name}
                                    href={route(link.route)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                                        ${active
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-slate-600 hover:bg-slate-50'
                                        }
                                    `}
                                >
                                    {link.icon}

                                    <span>
                                        {link.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {getInitials(user.name)}
                        </div>

                        <div>
                            <p className="text-sm font-semibold">
                                {user.name}
                            </p>

                            <p className="text-xs text-slate-500">
                                {user.email}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* OVERLAY MOBILE */}
            {isSidebarOpen && (
                <div
                    onClick={() =>
                        setIsSidebarOpen(false)
                    }
                    className="fixed inset-0 bg-black/20 z-40 md:hidden"
                />
            )}

            {/* CONTENT */}
            <div className="flex-1 flex flex-col">

                <header className="hidden md:flex h-16 bg-white border-b items-center justify-between px-8">

                    <div className="font-semibold text-slate-500 uppercase text-xs">
                        Sistema de Gestión Deportiva
                    </div>

                    <Dropdown>
                        <Dropdown.Trigger>
                            <button
                                type="button"
                                className="inline-flex items-center gap-2"
                            >
                                <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                                    {getInitials(user.name)}
                                </div>

                                <span>
                                    {user.name}
                                </span>

                                <KeyboardArrowDownIcon />
                            </button>
                        </Dropdown.Trigger>

                        <Dropdown.Content>
                            <Dropdown.Link
                                href={route('profile.edit')}
                            >
                                <div className="flex items-center gap-2">
                                    <AccountCircleOutlinedIcon fontSize="small" />
                                    Perfil
                                </div>
                            </Dropdown.Link>

                            <Dropdown.Link
                                href={route('logout')}
                                method="post"
                                as="button"
                            >
                                <div className="flex items-center gap-2 text-red-600">
                                    <LogoutOutlinedIcon fontSize="small" />
                                    Cerrar sesión
                                </div>
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </header>
                <FlashMessage />
                <main className="p-6 lg:p-8">
                    {header && (
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold">
                                {header}
                            </h1>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border p-6 shadow-sm">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
