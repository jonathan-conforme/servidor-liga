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
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const vacio = { nombres: '', apellidos: '', cedula: '', telefono: '', email: '', activo: true };

export default function Index({ arbitros = [] }) {
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

    const openEdit = (a) => {
        setEditing(a);
        setData({
            nombres: a.nombres,
            apellidos: a.apellidos,
            cedula: a.cedula,
            telefono: a.telefono || '',
            email: a.email || '',
            activo: Boolean(a.activo),
        });
        clearErrors();
        setOpen(true);
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
            ? put(route('tenant.arbitros.update', editing.id), opts)
            : post(route('tenant.arbitros.store'), opts);
    };

    const remove = (a) => {
        if (confirm(`¿Eliminar a ${a.apellidos} ${a.nombres}?`)) {
            router.delete(route('tenant.arbitros.destroy', a.id), { preserveScroll: true });
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

    return (
        <TenantLayout>
            <div className="p-6">
                <Head title="Árbitros" />

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Árbitros</h1>
                        <p className="text-sm text-gray-500">Registro de árbitros disponibles para los partidos</p>
                    </div>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
                        Nuevo árbitro
                    </Button>
                </div>

                {pageErrors?.arbitro && (
                    <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">
                        {pageErrors.arbitro}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-100 text-left text-slate-600">
                            <tr>
                                <th className="px-4 py-3">Nombre</th>
                                <th className="px-4 py-3">Cédula</th>
                                <th className="px-4 py-3">Teléfono</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {arbitros.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                        Aún no hay árbitros registrados.
                                    </td>
                                </tr>
                            )}
                            {arbitros.map((a) => (
                                <tr key={a.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-800">{a.apellidos} {a.nombres}</td>
                                    <td className="px-4 py-3">{a.cedula}</td>
                                    <td className="px-4 py-3">{a.telefono || '-'}</td>
                                    <td className="px-4 py-3">{a.email || '-'}</td>
                                    <td className="px-4 py-3">
                                        <Chip size="small" label={a.activo ? 'ACTIVO' : 'INACTIVO'} color={a.activo ? 'success' : 'default'} />
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <IconButton size="small" color="primary" onClick={() => openEdit(a)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => remove(a)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Dialog open={open} onClose={close} fullWidth maxWidth="xs">
                    <DialogTitle className="text-sm font-bold">
                        {editing ? 'Editar árbitro' : 'Nuevo árbitro'}
                    </DialogTitle>
                    <form onSubmit={submit}>
                        <DialogContent dividers>
                            <Stack spacing={2.5}>
                                {field('nombres', 'Nombres', { required: true })}
                                {field('apellidos', 'Apellidos', { required: true })}
                                {field('cedula', 'Cédula', { required: true })}
                                {field('telefono', 'Teléfono')}
                                {field('email', 'Email', { type: 'email' })}
                                <FormControlLabel
                                    control={<Switch checked={data.activo} onChange={(e) => setData('activo', e.target.checked)} />}
                                    label="Activo"
                                />
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, py: 2 }}>
                            <Button onClick={close} disabled={processing}>Cancelar</Button>
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
