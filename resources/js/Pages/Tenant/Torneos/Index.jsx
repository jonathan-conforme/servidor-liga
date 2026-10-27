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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';
import Chip from '@mui/material/Chip';

// Iconos
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export default function Index({ auth, torneos }) {
    // Desestructuramos la paginación de Laravel
    const { data: listaTorneos, current_page, last_page } = torneos;

    // Estados de Modales
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Estados de control
    const [editingId, setEditingId] = useState(null);
    const [idParaEliminar, setIdParaEliminar] = useState(null);

    // Formulario de Inertia mapeado con el modelo Torneo
    const { data, setData, post, put, delete: destroy, reset, errors, clearErrors } = useForm({
        nombre: '',
        anio: new Date().getFullYear().toString(),
        fecha_inicio: '',
        fecha_fin: '',
        estado: 'BORRADOR',
        tipo_competicion: 'GRUPOS_ELIMINACION',
        cantidad_grupos: 2,
        clasificados_por_grupo: 2,
        ida_vuelta: false,
        gol_visitante: false,
        penales: true,
        final_ida_vuelta: false,
    });

    // --- ACCIONES DEL FORMULARIO ---
    const openCreateModal = () => {
        setEditingId(null);
        reset();
        clearErrors();
        setIsFormModalOpen(true);
    };

    const openEditModal = (torneo) => {
        setEditingId(torneo.id);
        setData({
            nombre: torneo.nombre,
            anio: torneo.anio || new Date().getFullYear().toString(),
            fecha_inicio: torneo.fecha_inicio ? torneo.fecha_inicio.substring(0, 10) : '',
            fecha_fin: torneo.fecha_fin ? torneo.fecha_fin.substring(0, 10) : '',
            estado: torneo.estado || 'BORRADOR',
            tipo_competicion: torneo.tipo_competicion || 'GRUPOS_ELIMINACION',
            cantidad_grupos: torneo.cantidad_grupos || 1,
            clasificados_por_grupo: torneo.clasificados_por_grupo || 2,
            ida_vuelta: Boolean(torneo.ida_vuelta),
            gol_visitante: Boolean(torneo.gol_visitante),
            penales: Boolean(torneo.penales),
            final_ida_vuelta: Boolean(torneo.final_ida_vuelta),
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
            put(route('tenant.torneos.update', editingId), {
                onSuccess: () => handleFormClose(),
            });
        } else {
            post(route('tenant.torneos.store'), {
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
            destroy(route('tenant.torneos.destroy', idParaEliminar), {
                onSuccess: () => closeDeleteModal(),
            });
        }
    };

    // --- PAGINACIÓN ---
    const handlePageChange = (event, value) => {
        router.get(route('tenant.torneos.index'), { page: value }, { preserveState: true });
    };

    // Helper para badges de estado
    const renderEstadoChip = (estado) => {
        const colores = {
            BORRADOR: { color: 'default', label: 'Borrador' },
            INSCRIPCIONES: { color: 'info', label: 'Inscripciones' },
            EN_CURSO: { color: 'success', label: 'En Curso' },
            FINALIZADO: { color: 'secondary', label: 'Finalizado' },
        };
        const config = colores[estado] || colores.BORRADOR;
        return <Chip label={config.label} color={config.color} size="small" />;
    };

    return (
        <TenantLayout>
            <div className="p-6">
                <Head title="Torneos" />

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Torneos y Campeonatos</h1>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={openCreateModal}
                    >
                        + Nuevo Torneo
                    </Button>
                </div>

                {/* TABLA DE TORNEOS */}
                <div className="bg-white shadow-md rounded my-6 overflow-x-auto">
                    <table className="min-w-full w-full bg-white">
                        <thead>
                            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Torneo</th>
                                <th className="py-3 px-6 text-left">Formato</th>
                                <th className="py-3 px-6 text-left">Fechas</th>
                                <th className="py-3 px-6 text-center">Estado</th>
                                <th className="py-3 px-6 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {listaTorneos.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-10 text-center text-gray-500">
                                        No hay torneos registrados aún.
                                    </td>
                                </tr>
                            ) : (
                                listaTorneos.map((torneo) => (
                                    <tr key={torneo.id} className="border-b border-gray-200 hover:bg-gray-100">
                                        {/* Avatar e Info Principal */}
                                        <td className="py-3 px-6 text-left whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <Avatar sx={{ bgcolor: 'amber.main', backgroundColor: '#f59e0b' }}>
                                                    <EmojiEventsIcon />
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-gray-900">{torneo.nombre}</div>
                                                    <div className="text-xs text-gray-400">Año {torneo.anio}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Formato y Grupos */}
                                        <td className="py-3 px-6 text-left">
                                            <div className="font-semibold text-gray-700">{torneo.tipo_competicion}</div>
                                            {torneo.tipo_competicion === 'GRUPOS_ELIMINACION' && (
                                                <div className="text-xs text-gray-500">
                                                    {torneo.cantidad_grupos} grupos • Pasan {torneo.clasificados_por_grupo} por grupo
                                                </div>
                                            )}
                                        </td>
                                        {/* Fechas */}
                                        <td className="py-3 px-6 text-left">
                                            <div className="text-gray-700">Inicio: {torneo.fecha_inicio}</div>
                                            <div className="text-xs text-gray-500">
                                                Fin: {torneo.fecha_fin || 'Sin definir'}
                                            </div>
                                        </td>
                                        {/* Estado */}
                                        <td className="py-3 px-6 text-center">
                                            {renderEstadoChip(torneo.estado)}
                                        </td>
                                        {/* Acciones */}
                                        <td className="py-3 px-6 text-center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => openEditModal(torneo)}
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => openDeleteModal(torneo.id)}
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

                {/* PAGINACIÓN */}
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
                <Dialog open={isFormModalOpen} onClose={handleFormClose} fullWidth maxWidth="md">
                    <DialogTitle>{editingId ? 'Editar Torneo' : 'Crear Nuevo Torneo'}</DialogTitle>
                    <Box component="form" onSubmit={submit} noValidate>
                        <DialogContent>
                            <Stack spacing={2.5} sx={{ mt: 1 }}>
                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        id="nombre"
                                        label="Nombre del Torneo"
                                        variant="outlined"
                                        fullWidth
                                        required
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        error={!!errors.nombre}
                                        helperText={errors.nombre}
                                    />
                                    <TextField
                                        id="anio"
                                        label="Año"
                                        variant="outlined"
                                        type="number"
                                        sx={{ width: 140 }}
                                        required
                                        value={data.anio}
                                        onChange={(e) => setData('anio', e.target.value)}
                                        error={!!errors.anio}
                                        helperText={errors.anio}
                                    />
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        id="fecha_inicio"
                                        label="Fecha de Inicio"
                                        type="date"
                                        variant="outlined"
                                        fullWidth
                                        required
                                        InputLabelProps={{ shrink: true }}
                                        value={data.fecha_inicio}
                                        onChange={(e) => setData('fecha_inicio', e.target.value)}
                                        error={!!errors.fecha_inicio}
                                        helperText={errors.fecha_inicio}
                                    />
                                    <TextField
                                        id="fecha_fin"
                                        label="Fecha de Finalización"
                                        type="date"
                                        variant="outlined"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        value={data.fecha_fin}
                                        onChange={(e) => setData('fecha_fin', e.target.value)}
                                        error={!!errors.fecha_fin}
                                        helperText={errors.fecha_fin}
                                    />
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <FormControl fullWidth error={!!errors.tipo_competicion}>
                                        <InputLabel id="tipo_competicion-label">Tipo de Competición</InputLabel>
                                        <Select
                                            labelId="tipo_competicion-label"
                                            id="tipo_competicion"
                                            value={data.tipo_competicion}
                                            label="Tipo de Competición"
                                            onChange={(e) => setData('tipo_competicion', e.target.value)}
                                        >
                                            <MenuItem value="LIGA">Liga (Todos contra todos)</MenuItem>
                                            <MenuItem value="GRUPOS_ELIMINACION">Grupos + Eliminación Directa</MenuItem>
                                            <MenuItem value="ELIMINACION_DIRECTA">Eliminación Directa Pure</MenuItem>
                                        </Select>
                                        {errors.tipo_competicion && <FormHelperText>{errors.tipo_competicion}</FormHelperText>}
                                    </FormControl>

                                    {editingId && (
                                        <FormControl fullWidth error={!!errors.estado}>
                                            <InputLabel id="estado-label">Estado del Torneo</InputLabel>
                                            <Select
                                                labelId="estado-label"
                                                id="estado"
                                                value={data.estado}
                                                label="Estado del Torneo"
                                                onChange={(e) => setData('estado', e.target.value)}
                                            >
                                                <MenuItem value="BORRADOR">Borrador</MenuItem>
                                                <MenuItem value="INSCRIPCIONES">Inscripciones Abiertas</MenuItem>
                                                <MenuItem value="EN_CURSO">En Curso</MenuItem>
                                                <MenuItem value="FINALIZADO">Finalizado</MenuItem>
                                            </Select>
                                            {errors.estado && <FormHelperText>{errors.estado}</FormHelperText>}
                                        </FormControl>
                                    )}
                                </Stack>

                                {data.tipo_competicion === 'GRUPOS_ELIMINACION' && (
                                    <Stack direction="row" spacing={2}>
                                        <TextField
                                            id="cantidad_grupos"
                                            label="Cantidad de Grupos"
                                            type="number"
                                            variant="outlined"
                                            fullWidth
                                            value={data.cantidad_grupos}
                                            onChange={(e) => setData('cantidad_grupos', e.target.value)}
                                            error={!!errors.cantidad_grupos}
                                            helperText={errors.cantidad_grupos}
                                        />
                                        <TextField
                                            id="clasificados_por_grupo"
                                            label="Clasificados por Grupo"
                                            type="number"
                                            variant="outlined"
                                            fullWidth
                                            value={data.clasificados_por_grupo}
                                            onChange={(e) => setData('clasificados_por_grupo', e.target.value)}
                                            error={!!errors.clasificados_por_grupo}
                                            helperText={errors.clasificados_por_grupo}
                                        />
                                    </Stack>
                                )}

                                <div className="border-t pt-2">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Reglas de Juego</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={data.ida_vuelta}
                                                    onChange={(e) => setData('ida_vuelta', e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label="Partidos de Ida y Vuelta"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={data.gol_visitante}
                                                    onChange={(e) => setData('gol_visitante', e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label="Gol de visitante como desempate"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={data.penales}
                                                    onChange={(e) => setData('penales', e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label="Definición por penales"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={data.final_ida_vuelta}
                                                    onChange={(e) => setData('final_ida_vuelta', e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label="Final a Ida y Vuelta"
                                        />
                                    </div>
                                </div>
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 3 }}>
                            <Button onClick={handleFormClose} color="inherit">Cancelar</Button>
                            <Button type="submit" variant="contained" color="primary">
                                {editingId ? 'Actualizar' : 'Guardar Torneo'}
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>

                {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR */}
                <Dialog open={isDeleteModalOpen} onClose={closeDeleteModal}>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <WarningAmberOutlinedIcon color="error" />
                        ¿Eliminar este torneo?
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Cuidado: Al eliminar este torneo, también se desvincularán los grupos, fixtures y estadísticas configurados hasta el momento.
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
