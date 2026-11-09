import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import TenantLayout from '@/Layouts/TenantLayout';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';

export default function Index({ usuarios = [], roles = [], cupo = { limite: null, usados: 0 }, catalogo = {}, porRol = {} }) {
    const vacio = { name: '', email: '', cedula: '', telefono: '', rol: 'Operador', password: '', permisos: [] };
    const { errors: pageErrors } = usePage().props;
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const { data, setData, post, put, processing, errors, clearErrors, reset } = useForm(vacio);

    const openCreate = () => {
        setEditing(null);
        setData(vacio);
        clearErrors();
        setOpen(true);
    };

    const openEdit = (u) => {
        setEditing(u);
        setData({
            name: u.name,
            email: u.email,
            cedula: u.cedula || '',
            telefono: u.telefono || '',
            rol: u.rol,
            password: '',
            permisos: u.permisos || [],
        });
        clearErrors();
        setOpen(true);
    };

    const heredados = porRol[data.rol] || [];

    const togglePermiso = (p) => {
        if (heredados.includes(p)) return;
        let nuevos = data.permisos.includes(p)
            ? data.permisos.filter((x) => x !== p)
            : [...data.permisos, p];

        const [modulo, accion] = p.split('.');
        if (accion !== 'ver' && nuevos.includes(p)) {
            const ver = `${modulo}.ver`;
            if (!nuevos.includes(ver) && !heredados.includes(ver)) nuevos.push(ver);
        }
        if (accion === 'ver' && !nuevos.includes(p)) {
            nuevos = nuevos.filter((x) => !x.startsWith(`${modulo}.`) || heredados.includes(x));
        }
        setData('permisos', nuevos);
    };

    const close = () => {
        setOpen(false);
        setEditing(null);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: close };
        editing
            ? put(route('tenant.usuarios.update', editing.id), opts)
            : post(route('tenant.usuarios.store'), opts);
    };

    const toggle = (u) => {
        const msg = u.activo ? `¿Desactivar a ${u.name}? No podrá iniciar sesión.` : `¿Activar a ${u.name}?`;
        if (confirm(msg)) {
            router.patch(route('tenant.usuarios.estado', u.id), {}, { preserveScroll: true });
        }
    };

    const field = (name, label, extra = {}) => (
        <TextField
            label={label}
            fullWidth
            value={data[name]}
            onChange={(e) => setData(name, e.target.value)}
            error={Boolean(errors[name])}
            helperText={errors[name]}
            {...extra}
        />
    );

    const sinCupo = cupo.limite !== null && cupo.usados >= cupo.limite;

    return (
        <TenantLayout>
            <div className="p-6">
                <Head title="Usuarios" />

                <div className="flex justify-between items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Usuarios de la liga</h1>
                        <p className="text-sm text-gray-500">Operadores y editores que trabajan en tu liga</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Chip
                            size="small"
                            color={sinCupo ? 'warning' : 'default'}
                            label={cupo.limite === null ? 'Sin plan activo' : `Cupo: ${cupo.usados} / ${cupo.limite}`}
                        />
                        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} disabled={sinCupo}>
                            Nuevo usuario
                        </Button>
                    </div>
                </div>

                {pageErrors?.usuario && (
                    <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">
                        {pageErrors.usuario}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-100 text-left text-slate-600">
                            <tr>
                                <th className="px-4 py-3">Nombre</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Cédula</th>
                                <th className="px-4 py-3">Rol</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {usuarios.map((u) => {
                                const gestionable = !u.es_yo && roles.includes(u.rol);
                                return (
                                    <tr key={u.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                                        <td className="px-4 py-3">{u.email}</td>
                                        <td className="px-4 py-3">{u.cedula || '-'}</td>
                                        <td className="px-4 py-3">
                                            <Chip size="small" variant="outlined" label={u.rol || 'Sin rol'} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Chip
                                                size="small"
                                                label={u.activo ? 'ACTIVO' : 'INACTIVO'}
                                                color={u.activo ? 'success' : 'default'}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {gestionable && (
                                                <>
                                                    <IconButton size="small" color="primary" onClick={() => openEdit(u)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color={u.activo ? 'error' : 'success'}
                                                        onClick={() => toggle(u)}
                                                        title={u.activo ? 'Desactivar' : 'Activar'}
                                                    >
                                                        {u.activo ? <BlockIcon fontSize="small" /> : <CheckCircleOutlinedIcon fontSize="small" />}
                                                    </IconButton>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <Dialog open={open} onClose={close} fullWidth maxWidth="xs">
                    <DialogTitle className="text-sm font-bold">
                        {editing ? 'Editar usuario' : 'Nuevo usuario'}
                    </DialogTitle>
                    <form onSubmit={submit}>
                        <DialogContent dividers>
                            <Stack spacing={2.5}>
                                {errors.usuario && (
                                    <div className="p-2 rounded bg-red-50 border border-red-200 text-xs text-red-700">
                                        {errors.usuario}
                                    </div>
                                )}
                                {field('name', 'Nombre completo', { required: true })}
                                {field('email', 'Email', { type: 'email', required: true })}
                                {field('cedula', 'Cédula', { required: true })}
                                {field('telefono', 'Teléfono')}
                                {field('rol', 'Rol', {
                                    select: true,
                                    required: true,
                                    children: roles.map((r) => (
                                        <MenuItem key={r} value={r}>
                                            {r}
                                        </MenuItem>
                                    )),
                                })}
                                {field('password', editing ? 'Nueva contraseña (opcional)' : 'Contraseña', {
                                    type: 'password',
                                    required: !editing,
                                    helperText: errors.password || (editing ? 'Déjala vacía para no cambiarla' : 'Mínimo 8 caracteres'),
                                })}
                                <div>
                                    <p className="text-xs font-semibold text-slate-600 mb-2">Permisos por pantalla</p>
                                    <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                                        {Object.entries(catalogo).map(([modulo, def]) => (
                                            <div key={modulo} className="px-3 py-2">
                                                <p className="text-sm font-medium text-slate-800">{def.label}</p>
                                                <div className="flex flex-wrap gap-x-4">
                                                    {Object.entries(def.acciones).map(([accion, etiqueta]) => {
                                                        const clave = `${modulo}.${accion}`;
                                                        const delRol = heredados.includes(clave);
                                                        return (
                                                            <label key={clave} className="flex items-center text-xs text-slate-600">
                                                                <Checkbox
                                                                    size="small"
                                                                    checked={delRol || data.permisos.includes(clave)}
                                                                    disabled={delRol}
                                                                    onChange={() => togglePermiso(clave)}
                                                                />
                                                                {etiqueta}
                                                                {delRol && <span className="ml-1 text-slate-400">(del rol)</span>}
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, py: 2 }}>
                            <Button onClick={close} disabled={processing}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="contained" disabled={processing}>
                                {processing ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </div>
        </TenantLayout>
    );
}