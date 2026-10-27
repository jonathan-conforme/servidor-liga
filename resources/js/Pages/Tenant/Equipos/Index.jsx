import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import TenantLayout from '@/Layouts/TenantLayout';

// Importaciones de Material UI
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Pagination from '@mui/material/Pagination';
import Avatar from '@mui/material/Avatar';

// Iconos
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';

export default function Index({ auth, equipos }) {
    // Desestructuramos la paginación de Laravel
    const { data: listaEquipos, current_page, last_page } = equipos;

    // Estados de Modales
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Estados de control
    const [editingId, setEditingId] = useState(null);
    const [idParaEliminar, setIdParaEliminar] = useState(null);

    // Formulario de Inertia mapeado con las columnas de tu migración
    const { data, setData, post, put, delete: destroy, reset, errors, clearErrors } = useForm({
        nombre: '',
        presidente: '',
        director_tecnico: '',
        telefono: '',
        email: '',
        activo: true,
        escudo: '', // Lo dejamos como string temporal hasta meter subida de archivos
    });

    // --- ACCIONES DEL FORMULARIO ---
    const openCreateModal = () => {
        setEditingId(null);
        reset();
        clearErrors();
        setIsFormModalOpen(true);
    };

    const openEditModal = (equipo) => {
        setEditingId(equipo.id);
        setData({
            nombre: equipo.nombre,
            presidente: equipo.presidente || '',
            director_tecnico: equipo.director_tecnico || '',
            telefono: equipo.telefono || '',
            email: equipo.email || '',
            activo: equipo.activo,
            escudo: equipo.escudo || '',
        });
        clearErrors();
        setIsFormModalOpen(true);
    };

    const handleFormClose = () => {
        setIsFormModalOpen(false);
        reset();
        clearErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingId) {
            put(route('tenant.equipos.update', editingId), {
                onSuccess: () => handleFormClose(),
            });
        } else {
            post(route('tenant.equipos.store'), {
                onSuccess: () => handleFormClose(),
            });
        }
    };

    // --- ACCIONES DE ELIMINACIÓN ---
    const openDeleteModal = (id) => {
        setIdParaEliminar(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIdParaEliminar(null);
        setIsDeleteModalOpen(false);
    };

    const confirmDelete = () => {
        if (idParaEliminar) {
            destroy(route('tenant.equipos.destroy', idParaEliminar), {
                onSuccess: () => closeDeleteModal(),
            });
        }
    };

    // --- PAGINACIÓN ---
    const handlePageChange = (event, value) => {
        router.get(route('tenant.equipos.index'), { page: value }, { preserveState: true });
    };

    return (
        <TenantLayout>
            <div className="p-6">
                <Head title="Equipos" />

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Equipos de la Liga</h1>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={openCreateModal}
                    >
                        + Nuevo Equipo
                    </Button>
                </div>

                {/* TABLA DE EQUIPOS */}
                <div className="bg-white shadow-md rounded my-6 overflow-x-auto">
                    <table className="min-w-full w-full bg-white">
                        <thead>
                            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Equipo</th>
                                <th className="py-3 px-6 text-left">Personal Técnico</th>
                                <th className="py-3 px-6 text-left">Contacto</th>
                                <th className="py-3 px-6 text-center">Estado</th>
                                <th className="py-3 px-6 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {listaEquipos.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-10 text-center text-gray-500">
                                        No hay equipos registrados aún.
                                    </td>
                                </tr>
                            ) : (
                                listaEquipos.map((equipo) => (
                                    <tr key={equipo.id} className="border-b border-gray-200 hover:bg-gray-100">
                                        {/* Avatar/Escudo y Nombre */}
                                        <td className="py-3 px-6 text-left whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <Avatar sx={{ bgcolor: 'primary.light' }}>
                                                    <SportsFootballIcon />
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-gray-900">{equipo.nombre}</div>
                                                    <div className="text-xs text-gray-400">/{equipo.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Presidente y DT */}
                                        <td className="py-3 px-6 text-left">
                                            <div className="text-gray-700"><span className="font-semibold text-xs text-gray-400">Presi:</span> {equipo.presidente || 'N/A'}</div>
                                            <div className="text-xs text-gray-500"><span className="font-semibold text-gray-400">DT:</span> {equipo.director_tecnico || 'N/A'}</div>
                                        </td>
                                        {/* Teléfono y Email */}
                                        <td className="py-3 px-6 text-left">
                                            <div className="text-gray-700">{equipo.telefono || 'N/A'}</div>
                                            <div className="text-xs text-gray-500">{equipo.email || 'N/A'}</div>
                                        </td>
                                        {/* Estado */}
                                        <td className="py-3 px-6 text-center">
                                            <span className={`py-1 px-3 rounded-full text-xs ${equipo.activo ? 'bg-green-200 text-green-600' : 'bg-red-200 text-red-600'}`}>
                                                {equipo.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        {/* Acciones */}
                                        <td className="py-3 px-6 text-center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => openEditModal(equipo)}
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => openDeleteModal(equipo.id)}
                                                    size="small"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Stack>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* COMPONENTE DE PAGINACIÓN */}
                {last_page > 1 && (
                    <Box className="flex justify-center mt-4">
                        <Pagination
                            count={last_page}
                            page={current_page}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                )}

                {/* MODAL FORMULARIO (CREAR O EDITAR) */}
                <Dialog open={isFormModalOpen} onClose={handleFormClose} fullWidth maxWidth="sm">
                    <DialogTitle>{editingId ? 'Editar Equipo' : 'Registrar Nuevo Equipo'}</DialogTitle>
                    <Box component="form" onSubmit={submit} noValidate>
                        <DialogContent>
                            <Stack spacing={2.5} sx={{ mt: 1 }}>
                                <TextField
                                    id="nombre"
                                    label="Nombre del Equipo"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    error={!!errors.nombre}
                                    helperText={errors.nombre}
                                />
                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        id="presidente"
                                        label="Presidente"
                                        variant="outlined"
                                        fullWidth
                                        value={data.presidente}
                                        onChange={(e) => setData('presidente', e.target.value)}
                                        error={!!errors.presidente}
                                        helperText={errors.presidente}
                                    />
                                    <TextField
                                        id="director_tecnico"
                                        label="Director Técnico"
                                        variant="outlined"
                                        fullWidth
                                        value={data.director_tecnico}
                                        onChange={(e) => setData('director_tecnico', e.target.value)}
                                        error={!!errors.director_tecnico}
                                        helperText={errors.director_tecnico}
                                    />
                                </Stack>
                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        id="telefono"
                                        label="Teléfono de Contacto"
                                        variant="outlined"
                                        fullWidth
                                        value={data.telefono}
                                        onChange={(e) => setData('telefono', e.target.value)}
                                        error={!!errors.telefono}
                                        helperText={errors.telefono}
                                    />
                                    <TextField
                                        id="email"
                                        label="Correo Electrónico"
                                        variant="outlined"
                                        type="email"
                                        fullWidth
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        error={!!errors.email}
                                        helperText={errors.email}
                                    />
                                </Stack>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={data.activo}
                                            onChange={(e) => setData('activo', e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label="Equipo Activo disponible para torneos"
                                />
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 3 }}>
                            <Button onClick={handleFormClose} color="inherit">Cancelar</Button>
                            <Button type="submit" variant="contained" color="primary">
                                {editingId ? 'Actualizar' : 'Guardar Equipo'}
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>

                {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR */}
                <Dialog open={isDeleteModalOpen} onClose={closeDeleteModal}>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <WarningAmberOutlinedIcon color="error" />
                        ¿Eliminar este equipo?
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Cuidado: Al eliminar este equipo, también se borrarán sus registros de inscripciones y estadísticas asociadas en los torneos actuales.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={closeDeleteModal} color="inherit">
                            Cancelar
                        </Button>
                        <Button onClick={confirmDelete} variant="contained" color="error" autoFocus>
                            Sí, Eliminar
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </TenantLayout>
    );
}
