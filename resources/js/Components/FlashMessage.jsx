import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function FlashMessage() {
    const { flash } = usePage().props;

    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState('');

    useEffect(() => {
        if (flash.success) {
            setMessage(flash.success);
            setType('success');
            setOpen(true);
        }

        if (flash.error) {
            setMessage(flash.error);
            setType('error');
            setOpen(true);
        }

        if (flash.warning) {
            setMessage(flash.warning);
            setType('warning');
            setOpen(true);
        }

        if (flash.info) {
            setMessage(flash.info);
            setType('info');
            setOpen(true);
        }
    }, [flash]);

    if (!open) return null;

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500',
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <div
                    className={`h-2 rounded-t-xl -mt-6 -mx-6 mb-4 ${
                        colors[type]
                    }`}
                />

                <h2 className="text-lg font-bold mb-2">
                    {type === 'success' && 'Éxito'}
                    {type === 'error' && 'Error'}
                    {type === 'warning' && 'Advertencia'}
                    {type === 'info' && 'Información'}
                </h2>

                <p className="text-gray-600">{message}</p>

                <div className="mt-5 flex justify-end">
                    <button
                        onClick={() => setOpen(false)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
}
