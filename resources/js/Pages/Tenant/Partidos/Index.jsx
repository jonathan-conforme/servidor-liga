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
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';

import AutoRenewIcon from '@mui/icons-material/AutoRenew';
import EditIcon from '@mui/icons-material/Edit';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function Index({ torneos = [], torneoSeleccionado = null, jornadasConPartidos = [] }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPartido, setSelectedPartido] = useState(null);

    const { data, setData, put, processing, errors, clearErrors, reset } = useForm({
        fecha_partido: '',
        cancha: '',
        goles_local: '',
        goles_visitante: '',
        estado: 'PROGRAMADO',
    });

    const handleTorneoChange = (e) => {
        router.get(route('tenant.partidos.index'), { torneo_id: e.target.value }, { preserveState: true });
    };

    const handleGenerarFixture = () => {
        if (confirm('¿Deseas generar el fixture automático? Esto creará las jornadas y partidos del torneo.')) {
            router.post(route('tenant.partidos.generar-fixture'), {
                torneo_id: torneoSeleccionado.id,
            });
        }
    };

    const openEditModal = (partido) => {
        setSelectedPartido(partido);

        let formattedFecha = '';
        if (partido.fecha_partido) {
            formattedFecha = partido.fecha_partido.substring(0, 16);
        }

        setData({
            fecha_partido: formattedFecha,
            cancha: partido.cancha || '',
            goles_local: partido.goles_local !== null ? partido.goles_local : '',
            goles_visitante: partido.goles_visitante !== null ? partido.goles_visitante : '',
            estado: partido.estado || 'PROGRAMADO',
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedPartido(null);
        reset();
    };

    const submitUpdate = (e) => {
        e.preventDefault();
        put(route('tenant.partidos.update', selectedPartido.id), {
            onSuccess: () => closeEditModal(),
        });
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'FINALIZADO': return 'success';
            case 'EN_JUEGO': return 'primary';
            case 'SUSPENDIDO': return 'error';
            default: return 'default';
        }
    };

    return (
        <TenantLayout>
            <div className="p-6">
                <Head title="Calendario de Partidos" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Partidos y Programación</h1>
                        <p className="text-sm text-gray-500">Asigna canchas, horarios e ingresa los marcadores de los encuentros</p>
                    </div>

                    <Stack direction="row" spacing={2}>
                        <FormControl size="small" sx={{ minWidth: 240 }}>
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

                        {torneoSeleccionado && (
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<AutoRenewIcon />}
                                onClick={handleGenerarFixture}
                            >
                                Generar Fixture
                            </Button>
                        )}
                    </Stack>
                </div>

                {/* LISTADO DE JORNADAS Y PARTIDOS */}
                {jornadasConPartidos.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-10 text-center text-gray-500 border border-gray-200">
                        <SportsScoreIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <p className="text-lg font-medium">Aún no se ha generado el fixture para este torneo.</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Inscribe a los equipos en el torneo y luego presiona <strong>"Generar Fixture"</strong>.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {jornadasConPartidos.map((jornada) => (
                            <Card key={jornada.id} variant="outlined" className="shadow-sm overflow-hidden">
                                <Box className="bg-slate-100 px-5 py-3 border-b flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-800 text-md">
                                            {jornada.nombre || `JORNADA ${jornada.numero}`}
                                        </h3>
                                        {jornada.fecha_programada && (
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <EventIcon fontSize="inherit" /> {jornada.fecha_programada}
                                            </span>
                                        )}
                                    </div>
                                    <Chip label={jornada.estado} size="small" color={jornada.estado === 'FINALIZADA' ? 'success' : 'default'} />
                                </Box>

                                <div className="divide-y">
                                    {jornada.partidos.length === 0 ? (
                                        <p className="p-4 text-xs text-gray-400 italic text-center">No hay partidos en esta jornada.</p>
                                    ) : (
                                        jornada.partidos.map((partido) => (
                                            <div key={partido.id} className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-slate-50">

                                                {/* Hora y Cancha */}
                                                <div className="w-full md:w-48 text-xs text-slate-500 space-y-1">
                                                    {partido.fecha_partido ? (
                                                        <div className="flex items-center gap-1 font-medium text-slate-700">
                                                            <EventIcon fontSize="inherit" />
                                                            {new Date(partido.fecha_partido).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                        </div>
                                                    ) : (
                                                        <span className="italic">Hora por definir</span>
                                                    )}
                                                    {partido.cancha && (
                                                        <div className="flex items-center gap-1">
                                                            <LocationOnIcon fontSize="inherit" /> {partido.cancha}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Marcador Versus */}
                                                <div className="flex-1 flex items-center justify-center gap-4 w-full">
                                                    <span className="flex-1 text-right font-semibold text-slate-800 text-sm">
                                                        {partido.equipo_local?.nombre}
                                                    </span>

                                                    <div className="px-4 py-1.5 bg-slate-100 rounded-lg font-bold text-slate-800 min-w-[90px] text-center border">
                                                        {partido.estado === 'FINALIZADO' || partido.estado === 'EN_JUEGO' ? (
                                                            `${partido.goles_local ?? 0} - ${partido.goles_visitante ?? 0}`
                                                        ) : (
                                                            <span className="text-xs text-slate-400">VS</span>
                                                        )}
                                                    </div>

                                                    <span className="flex-1 text-left font-semibold text-slate-800 text-sm">
                                                        {partido.equipo_visitante?.nombre}
                                                    </span>
                                                </div>

                                                {/* Estado y Edición */}
                                                <div className="flex items-center gap-3">
                                                    <Chip label={partido.estado} size="small" color={getEstadoColor(partido.estado)} variant="outlined" />
                                                    <IconButton color="primary" size="small" onClick={() => openEditModal(partido)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </div>

                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* MODAL EDITAR PARTIDO */}
                <Dialog open={isEditModalOpen} onClose={closeEditModal} fullWidth maxWidth="xs">
                    <DialogTitle className="text-sm font-bold">
                        {selectedPartido?.equipo_local?.nombre} vs {selectedPartido?.equipo_visitante?.nombre}
                    </DialogTitle>
                    <Box component="form" onSubmit={submitUpdate}>
                        <DialogContent dividers>
                            <Stack spacing={2.5}>
                                <TextField
                                    label="Fecha y Hora del Partido"
                                    type="datetime-local"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={data.fecha_partido}
                                    onChange={(e) => setData('fecha_partido', e.target.value)}
                                    error={Boolean(errors.fecha_partido)}
                                    helperText={errors.fecha_partido}
                                />

                                <TextField
                                    label="Cancha / Estadio"
                                    fullWidth
                                    placeholder="Ej: Cancha Principal #2"
                                    value={data.cancha}
                                    onChange={(e) => setData('cancha', e.target.value)}
                                    error={Boolean(errors.cancha)}
                                    helperText={errors.cancha}
                                />

                                <FormControl fullWidth required error={Boolean(errors.estado)}>
                                    <InputLabel>Estado del Partido</InputLabel>
                                    <Select
                                        value={data.estado}
                                        label="Estado del Partido"
                                        onChange={(e) => setData('estado', e.target.value)}
                                    >
                                        <MenuItem value="PROGRAMADO">PROGRAMADO</MenuItem>
                                        <MenuItem value="EN_JUEGO">EN JUEGO</MenuItem>
                                        <MenuItem value="FINALIZADO">FINALIZADO</MenuItem>
                                        <MenuItem value="SUSPENDIDO">SUSPENDIDO</MenuItem>
                                    </Select>
                                </FormControl>

                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        label={`Goles ${selectedPartido?.equipo_local?.nombre || 'Local'}`}
                                        type="number"
                                        fullWidth
                                        value={data.goles_local}
                                        onChange={(e) => setData('goles_local', e.target.value)}
                                        error={Boolean(errors.goles_local)}
                                        helperText={errors.goles_local}
                                    />
                                    <TextField
                                        label={`Goles ${selectedPartido?.equipo_visitante?.nombre || 'Visitante'}`}
                                        type="number"
                                        fullWidth
                                        value={data.goles_visitante}
                                        onChange={(e) => setData('goles_visitante', e.target.value)}
                                        error={Boolean(errors.goles_visitante)}
                                        helperText={errors.goles_visitante}
                                    />
                                </Stack>
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, py: 2 }}>
                            <Button onClick={closeEditModal} disabled={processing}>Cancelar</Button>
                            <Button type="submit" variant="contained" disabled={processing}>
                                {processing ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>
            </div>
        </TenantLayout>
    );
}
