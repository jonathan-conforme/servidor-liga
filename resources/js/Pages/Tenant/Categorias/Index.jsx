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

// Iconos
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

export default function Index({ auth, categorias }) {
    // Desestructuramos la respuesta paginada de Laravel
    const { data: listaCategorias, links, current_page, last_page } = categorias;

    // Estados para los Modales
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Estados de control
    const [editingId, setEditingId] = useState(null);
    const [idParaEliminar, setIdParaEliminar] = useState(null);

    // Inicializamos el formulario de Inertia
    const { data, setData, post, put, delete: destroy, reset, errors, clearErrors } = useForm({
        nombre: '',
        descripcion: '',
        edad_min: '',
        edad_max: '',
        activo: true,
    });

    // --- MANEJO DEL FORMULARIO (CREAR/EDITAR) ---
    const openCreateModal = () => {
        setEditingId(null);
        reset();
        clearErrors();
        setIsFormModalOpen(true);
    };

    const openEditModal = (categoria) => {
        setEditingId(categoria.id);
        setData({
            nombre: categoria.nombre,
            descripcion: categoria.descripcion || '',
            edad_min: categoria.edad_min || '',
            edad_max: categoria.edad_max || '',
            activo: categoria.activo,
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
            put(route('tenant.categorias.update', editingId), {
                onSuccess: () => handleFormClose(),
            });
        } else {
            post(route('tenant.categorias.store'), {
                onSuccess: () => handleFormClose(),
            });
        }
    };

    // --- MANEJO DEL MODAL DE ELIMINACIÓN ---
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
            destroy(route('tenant.categorias.destroy', idParaEliminar), {
                onSuccess: () => closeDeleteModal(),
            });
        }
    };

    // --- MANEJO DE LA PAGINACIÓN ---
    const handlePageChange = (event, value) => {
        // Viaja a la página seleccionada usando Inertia de manera limpia
        router.get(route('tenant.categorias.index'), { page: value }, { preserveState: true });
    };

    return (
        <TenantLayout>
            <div className="p-6">
                <Head title="Categorías" />

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Categorías de la Liga</h1>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={openCreateModal}
                    >
                        + Nueva Categoría
                    </Button>
                </div>

                {/* TABLA DE CATEGORÍAS */}
                <div className="bg-white shadow-md rounded my-6 overflow-x-auto">
                    <table className="min-w-full w-full bg-white">
                        <thead>
                            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Nombre</th>
                                <th className="py-3 px-6 text-left">Edades</th>
                                <th className="py-3 px-6 text-center">Estado</th>
                                <th className="py-3 px-6 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {listaCategorias.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-10 text-center text-gray-500">
                                        No hay categorías registradas aún.
                                    </td>
                                </tr>
                            ) : (
                                listaCategorias.map((categoria) => (
                                    <tr key={categoria.id} className="border-b border-gray-200 hover:bg-gray-100">
                                        <td className="py-3 px-6 text-left whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{categoria.nombre}</div>
                                            <div className="text-xs text-gray-500">{categoria.descripcion}</div>
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                            {categoria.edad_min && categoria.edad_max
                                                ? `${categoria.edad_min} a ${categoria.edad_max} años`
                                                : 'Libre'}
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            <span className={`py-1 px-3 rounded-full text-xs ${categoria.activo ? 'bg-green-200 text-green-600' : 'bg-red-200 text-red-600'}`}>
                                                {categoria.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => openEditModal(categoria)}
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => openDeleteModal(categoria.id)}
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
                    <DialogTitle>{editingId ? 'Editar Categoría' : 'Crear Categoría'}</DialogTitle>
                    <Box component="form" onSubmit={submit} noValidate>
                        <DialogContent>
                            <Stack spacing={3} sx={{ mt: 1 }}>
                                <TextField
                                    id="nombre"
                                    label="Nombre de la Categoría"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    error={!!errors.nombre}
                                    helperText={errors.nombre}
                                />
                                <TextField
                                    id="descripcion"
                                    label="Descripción"
                                    variant="outlined"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    value={data.descripcion}
                                    onChange={(e) => setData('descripcion', e.target.value)}
                                    error={!!errors.descripcion}
                                    helperText={errors.descripcion}
                                />
                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        id="edad_min"
                                        label="Edad Mínima"
                                        variant="outlined"
                                        type="number"
                                        fullWidth
                                        value={data.edad_min}
                                        onChange={(e) => setData('edad_min', e.target.value)}
                                        error={!!errors.edad_min}
                                        helperText={errors.edad_min}
                                    />
                                    <TextField
                                        id="edad_max"
                                        label="Edad Máxima"
                                        variant="outlined"
                                        type="number"
                                        fullWidth
                                        value={data.edad_max}
                                        onChange={(e) => setData('edad_max', e.target.value)}
                                        error={!!errors.edad_max}
                                        helperText={errors.edad_max}
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
                                    label="Categoría Activa"
                                />
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 3 }}>
                            <Button onClick={handleFormClose} color="inherit">Cancelar</Button>
                            <Button type="submit" variant="contained" color="primary">
                                {editingId ? 'Actualizar' : 'Guardar'}
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>

                {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR */}
                <Dialog open={isDeleteModalOpen} onClose={closeDeleteModal}>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <WarningAmberOutlinedIcon color="error" />
                        ¿Confirmar eliminación?
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Esta acción no se puede deshacer. La categoría se borrará permanentemente de la base de datos de la liga.
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
