import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import TenantLayout from '@/Layouts/TenantLayout';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';

import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';

export default function Index({ torneos = [], torneoSeleccionado = null, jornadas = [] }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedJornada, setSelectedJornada] = useState(null);

    const { data, setData, put, processing, errors, clearErrors, reset } = useForm({
        nombre: '',
        fecha_programada: '',
        estado: 'PROGRAMADA',
        motivo_suspension: '',
    });

    const handleTorneoChange = (e) => {
        router.get(route('tenant.jornadas.index'), { torneo_id: e.target.value }, { preserveState: true });
    };

    const openEditModal = (jornada) => {
        setSelectedJornada(jornada);
        setData({
            nombre: jornada.nombre || `Jornada ${jornada.numero}`,
            fecha_programada: jornada.fecha_programada || '',
            estado: jornada.estado || 'PROGRAMADA',
            motivo_suspension: jornada.motivo_suspension || '',
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedJornada(null);
        reset();
    };

    const submitUpdate = (e) => {
        e.preventDefault();
        put(route('tenant.jornadas.update', selectedJornada.id), {
            onSuccess: () => closeEditModal(),
        });
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'FINALIZADA': return 'success';
            case 'EN_CURSO': return 'primary';
            case 'SUSPENDIDA': return 'error';
            default: return 'default';
        }
    };

    return (
        <TenantLayout>
            <div className="p-6">
                <Head title="Gestión de Jornadas" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Jornadas del Torneo</h1>
                        <p className="text-sm text-gray-500">Programación, estado de fechas y suspensiones generales</p>
                    </div>

                    <FormControl size="small" sx={{ minWidth: 250 }}>
                        <InputLabel id="select-torneo-label">Torneo Seleccionado</InputLabel>
                        <Select
                            labelId="select-torneo-label"
                            value={torneoSeleccionado?.id || ''}
                            label="Torneo Seleccionado"
                            onChange={handleTorneoChange}
                        >
                            {torneos.map((t) => (
                                <MenuItem key={t.id} value={t.id}>{t.nombre} ({t.anio})</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>

                {/* TABLA DE JORNADAS */}
                <div className="bg-white shadow-md rounded my-6 overflow-x-auto">
                    <table className="min-w-full w-full bg-white">
                        <thead>
                            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">N°</th>
                                <th className="py-3 px-6 text-left">Nombre Jornada</th>
                                <th className="py-3 px-6 text-center">Fecha Programada</th>
                                <th className="py-3 px-6 text-center">Estado</th>
                                <th className="py-3 px-6 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {jornadas.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-10 text-center text-gray-500">
                                        No hay jornadas registradas para este torneo.
                                    </td>
                                </tr>
                            ) : (
                                jornadas.map((j) => (
                                    <tr key={j.id} className="border-b border-gray-200 hover:bg-gray-100">
                                        <td className="py-3 px-6 text-left font-bold">#{j.numero}</td>
                                        <td className="py-3 px-6 text-left font-medium text-gray-800">
                                            {j.nombre || `Jornada ${j.numero}`}
                                            {j.estado === 'SUSPENDIDA' && j.motivo_suspension && (
                                                <span className="block text-xs text-red-500 italic mt-0.5">
                                                    Motivo: {j.motivo_suspension}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            {j.fecha_programada ? (
                                                <div className="flex items-center justify-center gap-1 text-gray-700">
                                                    <EventIcon fontSize="small" className="text-gray-400" />
                                                    <span>{j.fecha_programada}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Sin definir</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            <Chip label={j.estado} size="small" color={getEstadoColor(j.estado)} />
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            <IconButton color="primary" size="small" onClick={() => openEditModal(j)}>
                                                <EditIcon />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* MODAL EDITAR JORNADA */}
                <Dialog open={isEditModalOpen} onClose={closeEditModal} fullWidth maxWidth="xs">
                    <DialogTitle>Configurar Jornada #{selectedJornada?.numero}</DialogTitle>
                    <Box component="form" onSubmit={submitUpdate}>
                        <DialogContent>
                            <Stack spacing={2.5} sx={{ mt: 1 }}>
                                <TextField
                                    label="Nombre de la Jornada"
                                    fullWidth
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    error={Boolean(errors.nombre)}
                                    helperText={errors.nombre}
                                />

                                <TextField
                                    label="Fecha Programada (Ej: Domingo)"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={data.fecha_programada}
                                    onChange={(e) => setData('fecha_programada', e.target.value)}
                                    error={Boolean(errors.fecha_programada)}
                                    helperText={errors.fecha_programada}
                                />

                                <FormControl fullWidth required error={Boolean(errors.estado)}>
                                    <InputLabel>Estado de la Jornada</InputLabel>
                                    <Select
                                        value={data.estado}
                                        label="Estado de la Jornada"
                                        onChange={(e) => setData('estado', e.target.value)}
                                    >
                                        <MenuItem value="PROGRAMADA">PROGRAMADA</MenuItem>
                                        <MenuItem value="EN_CURSO">EN CURSO</MenuItem>
                                        <MenuItem value="FINALIZADA">FINALIZADA</MenuItem>
                                        <MenuItem value="SUSPENDIDA">SUSPENDIDA</MenuItem>
                                    </Select>
                                </FormControl>

                                {data.estado === 'SUSPENDIDA' && (
                                    <TextField
                                        label="Motivo de la Suspensión"
                                        multiline
                                        rows={3}
                                        fullWidth
                                        required
                                        placeholder="Ej: Inundación de cancha por fuertes lluvias"
                                        value={data.motivo_suspension}
                                        onChange={(e) => setData('motivo_suspension', e.target.value)}
                                        error={Boolean(errors.motivo_suspension)}
                                        helperText={errors.motivo_suspension}
                                    />
                                )}
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button onClick={closeEditModal} disabled={processing}>Cancelar</Button>
                            <Button type="submit" variant="contained" disabled={processing}>
                                {processing ? 'Guardando...' : 'Actualizar Jornada'}
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>
            </div>
        </TenantLayout>
    );
}
