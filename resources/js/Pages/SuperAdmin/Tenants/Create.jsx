import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import { ecuadorData } from "../../Utils/ecuador-data";

export default function Create({ onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        slug: '',
        subdominio: '',
        logo: null,
        email: '',
        telefono: '',
        ciudad: '',
        provincia: '',
        canton: '',
        administrador: '',
        cedula: '',
        activo: true
    });

    const [cantonesDisponibles, setCantonesDisponibles] = useState([]);

    // 1. Efecto que escucha cuando cambia la provincia
    useEffect(() => {
        if (data.provincia) {
            setCantonesDisponibles(ecuadorData[data.provincia] || []);
        } else {
            setCantonesDisponibles([]);
        }
    }, [data.provincia]);

    // 2. FUNCIÓN DE AUTOCOMPLETADO AUTOMÁTICO PARA DOMINIO Y SLUG
    const handleNombreChange = (e) => {
        const nombreIngresado = e.target.value;

        // Limpiamos el texto para URLs (Quita acentos, espacios por guiones, minúsculas)
        const textoLimpio = nombreIngresado
            .toLowerCase()
            .normalize("NFD") // Separa los acentos de las letras
            .replace(/[\u0300-\u036f]/g, "") // Remueve los acentos
            .replace(/[^a-z0-9\s-]/g, "") // Remueve caracteres raros
            .trim()
            .replace(/\s+/g, "-"); // Reemplaza espacios por guiones largos

        // Seteamos los 3 campos de golpe con un solo cambio de estado
        setData(prevData => ({
            ...prevData,
            nombre: nombreIngresado,
            subdominio: textoLimpio,
            slug: textoLimpio
        }));
    };

    // 3. Manejador del cambio de provincia
    const handleProvinciaChange = (e) => {
        const provinciaSeleccionada = e.target.value;
        setData(prevData => ({
            ...prevData,
            provincia: provinciaSeleccionada,
            canton: '',
            ciudad: ''
        }));
    };

    // 4. Manejador del cambio de cantón
    const handleCantonChange = (e) => {
        const cantonSeleccionado = e.target.value;
        setData(prevData => ({
            ...prevData,
            canton: cantonSeleccionado,
            ciudad: cantonSeleccionado
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('superadmin.tenants.store'), {
            onSuccess: () => {
                if (onClose) onClose();
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto py-4 px-4">
            {/* Encabezado con ÍCONO e ÍNDIGO RESTAURADO */}
            <div className="mb-6 flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
                    <BusinessOutlinedIcon fontSize="large" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Registrar Nueva Liga</h1>
                    <p className="text-sm text-gray-500">Crea un ecosistema completo para una nueva organización</p>
                </div>
            </div>

            {/* Formulario */}
            <form onSubmit={submit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre de la Organización</label>
                    <input
                        type="text"
                        value={data.nombre}
                        onChange={handleNombreChange} // Activa la magia del autocompletado aquí
                        className="mt-1 block w-full rounded-md border-gray-300 p-2 border focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                    />
                    {errors.nombre && <div className="text-red-500 text-xs mt-1">{errors.nombre}</div>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Subdominio (Acceso Portal)</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <input
                                type="text"
                                value={data.subdominio}
                                onChange={(e) => setData('subdominio', e.target.value)}
                                className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 p-2 border focus:border-blue-500 focus:ring-blue-500 text-right"
                            />
                            <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-500 font-mono">
                                .tudominio.com
                            </span>
                        </div>
                        {errors.subdominio && <div className="text-red-500 text-xs mt-1">{errors.subdominio}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">URL Identificadora (Slug)</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-500 font-mono">
                                /ligas/
                            </span>
                            <input
                                type="text"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 p-2 border focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        {errors.slug && <div className="text-red-500 text-xs mt-1">{errors.slug}</div>}
                    </div>
                </div>

                <hr className="border-gray-200" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Correo Electrónico Oficial</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 p-2 border focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                        />
                        {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono de Contacto</label>
                        <input
                            type="text"
                            value={data.telefono}
                            onChange={(e) => setData('telefono', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 p-2 border focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Nombre del Administrador General</label>
                        <input
                            type="text"
                            value={data.administrador}
                            onChange={(e) => setData('administrador', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 p-2 border focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                        />
                        {errors.administrador && <div className="text-red-500 text-xs mt-1">{errors.administrador}</div>}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Documento de Cédula</label>
                        <input
                            type="text"
                            value={data.cedula}
                            onChange={(e) => setData('cedula', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 p-2 border focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                        />
                        {errors.cedula && <div className="text-red-500 text-xs mt-1">{errors.cedula}</div>}
                    </div>

                    {/* SECCIÓN ECUADOR DESPLEGABLES */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Provincia</label>
                            <select
                                value={data.provincia}
                                onChange={handleProvinciaChange}
                                className="mt-1 block w-full rounded-md border-gray-300 p-2 border shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                            >
                                <option value="">-- Seleccione una Provincia --</option>
                                {Object.keys(ecuadorData).map((provincia) => (
                                    <option key={provincia} value={provincia}>
                                        {provincia}
                                    </option>
                                ))}
                            </select>
                            {errors.provincia && <div className="text-red-500 text-xs mt-1">{errors.provincia}</div>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cantón / Ciudad</label>
                            <select
                                value={data.canton}
                                onChange={handleCantonChange}
                                disabled={!data.provincia}
                                className="mt-1 block w-full rounded-md border-gray-300 p-2 border shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                <option value="">
                                    {data.provincia ? "-- Seleccione un Cantón --" : "Primero elija una provincia"}
                                </option>
                                {cantonesDisponibles.map((canton) => (
                                    <option key={canton} value={canton}>
                                        {canton}
                                    </option>
                                ))}
                            </select>
                            {errors.canton && <div className="text-red-500 text-xs mt-1">{errors.canton}</div>}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logotipo Institucional</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('logo', e.target.files[0])}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-md shadow-sm p-1"
                        />
                    </div>
                </div>

                {/* Botones - ÍNDIGO RESTAURADO */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {processing ? 'Registrando...' : 'Guardar Nueva Liga'}
                    </button>
                </div>
            </form>
        </div>
    );
}
