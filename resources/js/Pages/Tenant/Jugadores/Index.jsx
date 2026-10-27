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
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';

// Iconos
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';

export default function Index({ auth, jugadores }) {
    // Desestructuramos la paginación de Laravel
    const { data: listaJugadores, current_page, last_page } = jugadores;

    // Estados de los Modales
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Estados de control
    const [editingId, setEditingId] = useState(null);
    const [idParaEliminar, setIdParaEliminar] = useState(null);
    const [busqueda, setBusqueda] = useState('');

    // Formulario de Inertia mapeado con las columnas de tu migración
    const { data, setData, post, put, delete: destroy, reset, errors, clearErrors } = useForm({
        nombres: '',
        apellidos: '',
        cedula: '',
        fecha_nacimiento: '',
        posicion: '',
        activo: true,
        foto: '', // String temporal hasta subir archivos reales
    });

    // --- ACCIONES DEL FORMULARIO ---
    const openCreateModal = () => {
        setEditingId(null);
        reset();
        clearErrors();
        setIsFormModalOpen(true);
    };

    const openEditModal = (jugador) => {
        setEditingId(jugador.id);
        // Formateamos la fecha a YYYY-MM-DD para que el input type="date" la reconozca bien
        const fechaFormateada = jugador.fecha_nacimiento ? jugador.fecha_nacimiento.split('T')[0] : '';

        setData({
            nombres: jugador.nombres,
            apellidos: jugador.apellidos,
            cedula: jugador.cedula || '',
            fecha_nacimiento: fechaFormateada,
            posicion: jugador.posicion || '',
            activo: jugador.activo,
            foto: jugador.foto || '',
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
            put(route('tenant.jugadores.update', editingId), {
                onSuccess: () => handleFormClose(),
            });
        } else {
            post(route('tenant.jugadores.store'), {
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
            destroy(route('tenant.jugadores.destroy', idParaEliminar), {
                onSuccess: () => closeDeleteModal(),
            });
        }
    };

    // --- PAGINACIÓN ---
    const handlePageChange = (event, value) => {
        router.get(route('tenant.jugadores.index'), { page: value, buscar: busqueda }, { preserveState: true });
    };

    return (
        <TenantLayout>
            <div className="p-6">
                <Head title="Jugadores" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Fichaje de Jugadores</h1>
                        <p className="text-sm text-gray-500">Base de datos global de deportistas de la liga</p>
                    </div>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={openCreateModal}
                    >
                        + Registrar Jugador
                    </Button>
                </div>

                {/* TABLA DE JUGADORES */}
                <div className="bg-white shadow-md rounded my-6 overflow-x-auto">
                    <table className="min-w-full w-full bg-white">
                        <thead>
                            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Jugador</th>
                                <th className="py-3 px-6 text-left">Identificación</th>
                                <th className="py-3 px-6 text-center">Edad</th>
                                <th className="py-3 px-6 text-left">Posición</th>
                                <th className="py-3 px-6 text-center">Estado</th>
                                <th className="py-3 px-6 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {listaJugadores.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-10 text-center text-gray-500">
                                        No hay jugadores registrados en esta liga cantonal.
                                    </td>
                                </tr>
                            ) : (
                                listaJugadores.map((jugador) => (
                                    <tr key={jugador.id} className="border-b border-gray-200 hover:bg-gray-100">
                                        {/* Avatar y Nombre */}
                                        <td className="py-3 px-6 text-left whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                                    <PersonIcon />
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {jugador.apellidos} {jugador.nombres}
                                                    </div>
                                                    <div className="text-xs text-gray-400">ID: #{jugador.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Cédula */}
                                        <td className="py-3 px-6 text-left">
                                            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                                                {jugador.cedula || 'Sin Cédula'}
                                            </span>
                                        </td>
                                        {/* Edad calculada en tiempo real desde Laravel */}
                                        <td className="py-3 px-6 text-center font-semibold text-gray-800">
                                            {jugador.edad} años
                                        </td>
                                        {/* Posición de Juego */}
                                        <td className="py-3 px-6 text-left">
                                            <span className={`text-xs px-2.5 py-1 rounded font-medium
                                                ${jugador.posicion === 'ARQUERO' ? 'bg-amber-100 text-amber-800' : ''}
                                                ${jugador.posicion === 'DEFENSA' ? 'bg-blue-100 text-blue-800' : ''}
                                                ${jugador.posicion === 'MEDIOCAMPO' ? 'bg-purple-100 text-purple-800' : ''}
                                                ${jugador.posicion === 'DELANTERO' ? 'bg-orange-100 text-orange-800' : ''}
                                                ${!jugador.posicion ? 'bg-gray-100 text-gray-600' : ''}
                                            `}>
                                                {jugador.posicion || 'NO ASIGNADA'}
                                            </span>
                                        </td>
                                        {/* Estado */}
                                        <td className="py-3 px-6 text-center">
                                            <span className={`py-1 px-3 rounded-full text-xs ${jugador.activo ? 'bg-green-200 text-green-600' : 'bg-red-200 text-red-600'}`}>
                                                {jugador.activo ? 'Habilitado' : 'Sancionado/Inactivo'}
                                            </span>
                                        </td>
                                        {/* Acciones */}
                                        <td className="py-3 px-6 text-center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => openEditModal(jugador)}
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => openDeleteModal(jugador.id)}
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
                    <DialogTitle>{editingId ? 'Modificar Ficha de Jugador' : 'Inscribir Nuevo Jugador'}</DialogTitle>
                    <Box component="form" onSubmit={submit} noValidate>
                        <DialogContent>
                            <Stack spacing={2.5} sx={{ mt: 1 }}>
                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        id="apellidos"
                                        label="Apellidos Completos"
                                        variant="outlined"
                                        fullWidth
                                        required
                                        value={data.apellidos}
                                        onChange={(e) => setData('apellidos', e.target.value)}
                                        error={!!errors.apellidos}
                                        helperText={errors.apellidos}
                                    />
                                    <TextField
                                        id="nombres"
                                        label="Nombres Completos"
                                        variant="outlined"
                                        fullWidth
                                        required
                                        value={data.nombres}
                                        onChange={(e) => setData('nombres', e.target.value)}
                                        error={!!errors.nombres}
                                        helperText={errors.nombres}
                                    />
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        id="cedula"
                                        label="Número de Cédula / Pasaporte"
                                        variant="outlined"
                                        fullWidth
                                        value={data.cedula}
                                        onChange={(e) => setData('cedula', e.target.value)}
                                        error={!!errors.cedula}
                                        helperText={errors.cedula || 'Única en esta liga'}
                                    />
                                    <TextField
                                        id="fecha_nacimiento"
                                        label="Fecha de Nacimiento"
                                        type="date"
                                        variant="outlined"
                                        fullWidth
                                        required
                                        // Corregimos la propiedad según los estándares nuevos de MUI para evitar el warning:
                                        slotProps={{
                                            inputLabel: { shrink: true },
                                        }}
                                        value={data.fecha_nacimiento}
                                        onChange={(e) => setData('fecha_nacimiento', e.target.value)}
                                        error={!!errors.fecha_nacimiento}
                                        helperText={errors.fecha_nacimiento}
                                    />
                                </Stack>

                                <TextField
                                    id="posicion"
                                    select
                                    label="Posición en la cancha"
                                    value={data.posicion}
                                    onChange={(e) => setData('posicion', e.target.value)}
                                    error={!!errors.posicion}
                                    helperText={errors.posicion}
                                    fullWidth
                                >
                                    <MenuItem value=""><em>-- Seleccionar Posición --</em></MenuItem>
                                    <MenuItem value="ARQUERO">Arquero (Portero)</MenuItem>
                                    <MenuItem value="DEFENSA">Defensa</MenuItem>
                                    <MenuItem value="MEDIOCAMPO">Mediocampista / Volante</MenuItem>
                                    <MenuItem value="DELANTERO">Delantero (Atacante)</MenuItem>
                                </TextField>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={data.activo}
                                            onChange={(e) => setData('activo', e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label="Jugador Activo (Habilitado para jugar partidos)"
                                />
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 3 }}>
                            <Button onClick={handleFormClose} color="inherit">Cancelar</Button>
                            <Button type="submit" variant="contained" color="primary">
                                {editingId ? 'Guardar Cambios' : 'Fichar Jugador'}
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>

                {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR */}
                <Dialog open={isDeleteModalOpen} onClose={closeDeleteModal}>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <WarningAmberOutlinedIcon color="error" />
                        ¿Dar de baja a este jugador?
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            ¡Atención! Si eliminas a este jugador, se borrará de todas las plantillas de los equipos donde juegue en los torneos actuales, incluyendo sus goles y estadísticas registradas.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={closeDeleteModal} color="inherit">
                            Cancelar
                        </Button>
                        <Button onClick={confirmDelete} variant="contained" color="error" autoFocus>
                            Confirmar Eliminación
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </TenantLayout>
    );
}
