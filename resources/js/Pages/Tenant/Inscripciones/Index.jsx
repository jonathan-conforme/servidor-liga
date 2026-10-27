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
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';

import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import GroupsIcon from '@mui/icons-material/Groups';
import DeleteIcon from '@mui/icons-material/Delete';
import BadgeIcon from '@mui/icons-material/Badge';
import SearchIcon from '@mui/icons-material/Search';

// Función para calcular edad exacta
const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const cumple = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    const mes = hoy.getMonth() - cumple.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < cumple.getDate())) {
        edad--;
    }
    return edad;
};

export default function Index({
    torneos = [],
    torneoSeleccionado = null,
    inscripciones = [],
    equipos = [],
    categorias = [],
    jugadoresMaestros = []
}) {
    const [isEquipoModalOpen, setIsEquipoModalOpen] = useState(false);
    const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
    const [selectedInscripcion, setSelectedInscripcion] = useState(null);

    const [searchJugador, setSearchJugador] = useState('');
    const [isSavingRoster, setIsSavingRoster] = useState(false);
    const [rosterError, setRosterError] = useState('');

    const equipoForm = useForm({
        torneo_id: torneoSeleccionado?.id || '',
        equipo_id: '',
        categoria_id: '',
    });

    const [rosterData, setRosterData] = useState([]);

    const handleTorneoChange = (e) => {
        router.get(route('tenant.inscripciones.index'), { torneo_id: e.target.value }, { preserveState: true });
    };

    const openEquipoModal = () => {
        equipoForm.reset();
        equipoForm.clearErrors();
        equipoForm.setData({
            torneo_id: torneoSeleccionado?.id || '',
            equipo_id: '',
            categoria_id: '',
        });
        setIsEquipoModalOpen(true);
    };

    const closeEquipoModal = () => {
        equipoForm.clearErrors();
        setIsEquipoModalOpen(false);
    };

    const submitInscripcionEquipo = (e) => {
        e.preventDefault();
        equipoForm.post(route('tenant.inscripciones.store'), {
            onSuccess: () => {
                setIsEquipoModalOpen(false);
                equipoForm.reset();
            },
        });
    };

    const deleteInscripcion = (id) => {
        if (confirm('¿Eliminar la inscripción de este equipo?')) {
            router.delete(route('tenant.inscripciones.destroy', id));
        }
    };

    // --- ACCIONES PLANTILLA / ROSTER ---
    const openRosterModal = (inscripcion) => {
        setSelectedInscripcion(inscripcion);
        setSearchJugador('');
        setRosterError('');

        const categoria = inscripcion.categoria;
        const edadMin = categoria?.edad_min;
        const edadMax = categoria?.edad_max;

        // Map de jugadores ocupados por otros equipos en la misma categoría
        const ocupadosPorOtros = new Map();
        (inscripciones || []).forEach(otherIns => {
            if (otherIns.id !== inscripcion.id && otherIns.categoria_id === inscripcion.categoria_id) {
                (otherIns.jugadores || []).forEach(j => {
                    ocupadosPorOtros.set(j.id, otherIns.equipo?.nombre || 'Otro equipo');
                });
            }
        });

        const jugadoresInscritos = inscripcion.jugadores || [];
        const actualMap = new Map(jugadoresInscritos.map(j => [j.id, j.pivot?.numero_camiseta]));

        const initialRoster = jugadoresMaestros.map(j => {
            const equipoOcupante = ocupadosPorOtros.get(j.id);
            const edad = calcularEdad(j.fecha_nacimiento);

            let noAptoPorEdad = false;
            let motivoEdad = '';

            if (edad !== null) {
                if (edadMin !== null && edadMin !== '' && edad < edadMin) {
                    noAptoPorEdad = true;
                    motivoEdad = `Mínimo ${edadMin} años (${edad} a.)`;
                } else if (edadMax !== null && edadMax !== '' && edad > edadMax) {
                    noAptoPorEdad = true;
                    motivoEdad = `Máximo ${edadMax} años (${edad} a.)`;
                }
            }

            return {
                jugador_id: j.id,
                nombre_completo: `${j.apellidos || ''} ${j.nombres || ''}`.trim(),
                cedula: j.cedula !== null && j.cedula !== undefined ? String(j.cedula).trim() : '',
                edad: edad,
                posicion: j.posicion || '',
                selected: actualMap.has(j.id),
                numero_camiseta: actualMap.get(j.id) ?? '',
                ocupadoPor: equipoOcupante || null,
                noAptoPorEdad: noAptoPorEdad,
                motivoEdad: motivoEdad,
            };
        });

        setRosterData(initialRoster);
        setIsRosterModalOpen(true);
    };

    const closeRosterModal = () => {
        setIsRosterModalOpen(false);
        setSelectedInscripcion(null);
    };

    const handleToggleJugador = (id) => {
        setRosterData(prev => prev.map(item =>
            item.jugador_id === id ? { ...item, selected: !item.selected } : item
        ));
    };

    const handleDorsalChange = (id, value) => {
        setRosterData(prev => prev.map(item =>
            item.jugador_id === id ? { ...item, numero_camiseta: value } : item
        ));
    };

    const submitRoster = () => {
        setIsSavingRoster(true);
        setRosterError('');

        const seleccionados = rosterData
            .filter(item => item.selected && !item.ocupadoPor && !item.noAptoPorEdad)
            .map(item => ({
                jugador_id: item.jugador_id,
                numero_camiseta: item.numero_camiseta !== '' && item.numero_camiseta !== null
                    ? parseInt(item.numero_camiseta, 10)
                    : null,
            }));

        router.post(route('tenant.inscripciones.roster.store'), {
            equipo_torneo_id: selectedInscripcion.id,
            jugadores: seleccionados,
        }, {
            onSuccess: () => {
                setIsRosterModalOpen(false);
                setIsSavingRoster(false);
            },
            onError: (errors) => {
                setIsSavingRoster(false);
                if (errors.jugadores) {
                    setRosterError(Array.isArray(errors.jugadores) ? errors.jugadores[0] : errors.jugadores);
                }
            },
            onFinish: () => {
                setIsSavingRoster(false);
            }
        });
    };

    const filteredRoster = rosterData.filter(j => {
        if (!searchJugador.trim()) return true;

        const query = searchJugador.trim().toLowerCase();
        const queryClean = query.replace(/^0+/, '');

        const nombre = (j.nombre_completo || '').toLowerCase();
        const cedulaOriginal = j.cedula ? String(j.cedula).trim().toLowerCase() : '';
        const cedulaClean = cedulaOriginal.replace(/^0+/, '');

        return (
            nombre.includes(query) ||
            cedulaOriginal.includes(query) ||
            (queryClean !== '' && cedulaClean.includes(queryClean))
        );
    });

    return (
        <TenantLayout>
            <div className="p-6">
                <Head title="Inscripciones y Plantillas" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Inscripciones y Plantillas</h1>
                        <p className="text-sm text-gray-500">Asigna equipos y gestiona los dorsales de los jugadores por torneo</p>
                    </div>

                    <Stack direction="row" spacing={2}>
                        <FormControl size="small" sx={{ minWidth: 220 }}>
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

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={openEquipoModal}
                            disabled={!torneoSeleccionado}
                        >
                            + Inscribir Equipo
                        </Button>
                    </Stack>
                </div>

                {/* TABLA DE EQUIPOS INSCRITOS */}
                <div className="bg-white shadow-md rounded my-6 overflow-x-auto">
                    <table className="min-w-full w-full bg-white">
                        <thead>
                            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Equipo</th>
                                <th className="py-3 px-6 text-left">Categoría</th>
                                <th className="py-3 px-6 text-center">Plantilla Fichada</th>
                                <th className="py-3 px-6 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {!torneoSeleccionado || inscripciones.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-10 text-center text-gray-500">
                                        No hay equipos inscritos en este torneo aún.
                                    </td>
                                </tr>
                            ) : (
                                inscripciones.map((item) => (
                                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-100">
                                        <td className="py-3 px-6 text-left whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                    <SportsFootballIcon />
                                                </Avatar>
                                                <div className="font-medium text-gray-900">{item.equipo?.nombre}</div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                            <Chip label={item.categoria?.nombre || 'General'} size="small" color="info" variant="outlined" />
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            <Chip
                                                icon={<GroupsIcon />}
                                                label={`${item.jugadores?.length || 0} Jugadores`}
                                                color={(item.jugadores?.length || 0) > 0 ? 'success' : 'warning'}
                                                size="small"
                                            />
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<BadgeIcon />}
                                                    onClick={() => openRosterModal(item)}
                                                >
                                                    Fichar Plantilla
                                                </Button>
                                                <IconButton color="error" size="small" onClick={() => deleteInscripcion(item.id)}>
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

                {/* MODAL INSCRIBIR EQUIPO */}
                <Dialog open={isEquipoModalOpen} onClose={closeEquipoModal} fullWidth maxWidth="xs">
                    <DialogTitle>Inscribir Club en Torneo</DialogTitle>
                    <Box component="form" onSubmit={submitInscripcionEquipo}>
                        <DialogContent>
                            <Stack spacing={2.5} sx={{ mt: 1 }}>
                                {equipoForm.errors.equipo_id && (
                                    <Alert severity="error">{equipoForm.errors.equipo_id}</Alert>
                                )}

                                <FormControl fullWidth required error={Boolean(equipoForm.errors.equipo_id)}>
                                    <InputLabel>Seleccionar Equipo</InputLabel>
                                    <Select
                                        value={equipoForm.data.equipo_id}
                                        label="Seleccionar Equipo"
                                        onChange={(e) => equipoForm.setData('equipo_id', e.target.value)}
                                    >
                                        {equipos.map((eq) => (
                                            <MenuItem key={eq.id} value={eq.id}>{eq.nombre}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth required error={Boolean(equipoForm.errors.categoria_id)}>
                                    <InputLabel>Categoría</InputLabel>
                                    <Select
                                        value={equipoForm.data.categoria_id}
                                        label="Categoría"
                                        onChange={(e) => equipoForm.setData('categoria_id', e.target.value)}
                                    >
                                        {categorias.map((cat) => (
                                            <MenuItem key={cat.id} value={cat.id}>{cat.nombre}</MenuItem>
                                        ))}
                                    </Select>
                                    {equipoForm.errors.categoria_id && (
                                        <FormHelperText>{equipoForm.errors.categoria_id}</FormHelperText>
                                    )}
                                </FormControl>
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button onClick={closeEquipoModal} disabled={equipoForm.processing}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="contained" disabled={equipoForm.processing}>
                                {equipoForm.processing ? 'Inscribiendo...' : 'Inscribir'}
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>

                {/* MODAL PLANTILLA ROSTER */}
                <Dialog open={isRosterModalOpen} onClose={closeRosterModal} fullWidth maxWidth="md">
                    <DialogTitle>
                        Plantilla de Jugadores: {selectedInscripcion?.equipo?.nombre} ({selectedInscripcion?.categoria?.nombre || 'General'})
                    </DialogTitle>
                    <DialogContent dividers>
                        {rosterError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {rosterError}
                            </Alert>
                        )}

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                            <p className="text-xs text-gray-500">
                                Marca los jugadores que jugarán en este torneo y asígnales su número de camiseta.
                            </p>
                            <TextField
                                size="small"
                                placeholder="Buscar por nombre o cédula..."
                                value={searchJugador}
                                onChange={(e) => setSearchJugador(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ minWidth: 240 }}
                            />
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            <table className="min-w-full w-full">
                                <thead className="sticky top-0 bg-gray-100 shadow-sm z-10">
                                    <tr className="text-xs text-gray-600">
                                        <th className="p-2 text-left">Fichar</th>
                                        <th className="p-2 text-left">Jugador</th>
                                        <th className="p-2 text-left">Cédula</th>
                                        <th className="p-2 text-left">Estado / Restricción</th>
                                        <th className="p-2 text-center w-28">N° Dorsal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRoster.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-6 text-center text-gray-500 text-sm">
                                                No se encontraron jugadores.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRoster.map((j) => (
                                            <tr key={j.jugador_id} className={`border-b ${(j.ocupadoPor || j.noAptoPorEdad) ? 'bg-gray-50 opacity-75' : 'hover:bg-gray-50'}`}>
                                                <td className="p-2">
                                                    <Checkbox
                                                        checked={j.selected}
                                                        disabled={Boolean(j.ocupadoPor) || j.noAptoPorEdad}
                                                        onChange={() => handleToggleJugador(j.jugador_id)}
                                                        color="primary"
                                                    />
                                                </td>
                                                <td className="p-2 font-medium text-gray-800">
                                                    {j.nombre_completo}
                                                    {j.edad !== null && (
                                                        <span className="text-xs text-gray-400 block font-normal">
                                                            {j.edad} años
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-2 text-xs text-gray-500">{j.cedula || 'N/A'}</td>
                                                <td className="p-2 text-xs">
                                                    {j.ocupadoPor ? (
                                                        <Chip label={`En: ${j.ocupadoPor}`} size="small" color="error" variant="outlined" />
                                                    ) : j.noAptoPorEdad ? (
                                                        <Chip label={j.motivoEdad} size="small" color="warning" variant="outlined" />
                                                    ) : (
                                                        <span className="text-xs text-emerald-600 font-medium">Disponible</span>
                                                    )}
                                                </td>
                                                <td className="p-2 text-center">
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        disabled={!j.selected || Boolean(j.ocupadoPor) || j.noAptoPorEdad}
                                                        value={j.numero_camiseta}
                                                        onChange={(e) => handleDorsalChange(j.jugador_id, e.target.value)}
                                                        inputProps={{ style: { textAlign: 'center' } }}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button onClick={closeRosterModal} disabled={isSavingRoster}>
                            Cancelar
                        </Button>
                        <Button variant="contained" color="primary" onClick={submitRoster} disabled={isSavingRoster}>
                            {isSavingRoster ? 'Guardando...' : 'Guardar Plantilla'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </TenantLayout>
    );
}
