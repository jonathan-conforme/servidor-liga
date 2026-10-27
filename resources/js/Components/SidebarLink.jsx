import { Link } from '@inertiajs/react';

export default function SidebarLink({
    active = false,
    icon,
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl
                text-sm font-medium transition-all
                ${
                    active
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50'
                }
            `}
        >
            {icon}
            <span>{children}</span>
        </Link>
    );
}
