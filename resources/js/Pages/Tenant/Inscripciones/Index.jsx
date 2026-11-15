import React, { useState, useEffect } from 'react'; // [PAGINACIÓN BACKEND] Se agrega useEffect
import { Head, useForm, router, usePage } from '@inertiajs/react';
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
import TablePagination from '@mui/material/TablePagination'; // [PAGINACIÓN BACKEND] Paginador de MUI

import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import GroupsIcon from '@mui/icons-material/Groups';
import DeleteIcon from '@mui/icons-material/Delete';
import BadgeIcon from '@mui/icons-material/Badge';
import SearchIcon from '@mui/icons-material/Search';
import ShuffleIcon from '@mui/icons-material/Shuffle';

export default function Index({
    torneos = [],
    torneoSeleccionado = null,
    inscripciones = [],
    grupos = [],
    equipos = [],
    categorias = [],
}) {
    const { errors: pageErrors = {} } = usePage().props;

    const [isEquipoModalOpen, setIsEquipoModalOpen] = useState(false);
    const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
    const [selectedInscripcion, setSelectedInscripcion] = useState(null);

    const [searchJugador, setSearchJugador] = useState('');
    const [isSavingRoster, setIsSavingRoster] = useState(false);
    const [rosterError, setRosterError] = useState('');
    const [isSortingGrupos, setIsSortingGrupos] = useState(false);
    const [updatingGrupoId, setUpdatingGrupoId] = useState(null);

    // [PAGINACIÓN BACKEND] Estados para controlar la página del servidor y mantener seleccionados en memoria
    const [rosterRows, setRosterRows] = useState([]);
    const [rosterTotal, setRosterTotal] = useState(0);
    const [rosterPage, setRosterPage] = useState(0); // Base 0 para MUI; se envía +1 a Laravel
    const [rosterRowsPerPage, setRosterRowsPerPage] = useState(10);
    const [loadingRoster, setLoadingRoster] = useState(false);
    const [selectedMap, setSelectedMap] = useState({}); // { [jugador_id]: { jugador_id, numero_camiseta } }

    const esTorneoDeGrupos = torneoSeleccionado?.tipo_competicion === 'GRUPOS_ELIMINACION';

    const equipoForm = useForm({
        torneo_id: torneoSeleccionado?.id || '',
        equipo_id: '',
        categoria_id: '',
        grupo_id: '',
    });

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
            grupo_id: '',
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

    // --- ACCIONES DE GRUPOS ---
    const handleSortearGrupos = () => {
        if (!torneoSeleccionado) return;

        const hayGruposAsignados = inscripciones.some((item) => Boolean(item.grupo_id));
        if (
            hayGruposAsignados &&
            !confirm('Ya existen equipos con grupo asignado. ¿Deseas volver a sortear y reemplazar la distribución actual?')
        ) {
            return;
        }

        setIsSortingGrupos(true);
        router.post(
            route('tenant.inscripciones.sortear-grupos'),
            { torneo_id: torneoSeleccionado.id },
            {
                preserveScroll: true,
                onFinish: () => setIsSortingGrupos(false),
            }
        );
    };

    const handleAsignarGrupo = (inscripcionId, nuevoGrupoId) => {
        setUpdatingGrupoId(inscripcionId);
        router.patch(
            route('tenant.inscripciones.asignar-grupo', inscripcionId),
            { grupo_id: nuevoGrupoId === '' ? null : nuevoGrupoId },
            {
                preserveScroll: true,
                onFinish: () => setUpdatingGrupoId(null),
            }
        );
    };

    // --- ACCIONES PLANTILLA / ROSTER (PAGINACIÓN EN SERVIDOR) ---
    // [PAGINACIÓN BACKEND] Consulta una página específica al controlador
    const fetchRosterPage = async (inscripcionId, pageZeroBased = 0, perPage = 10, search = '') => {
        setLoadingRoster(true);
        try {
            const { data } = await window.axios.get(
                route('tenant.inscripciones.roster.jugadores', inscripcionId),
                {
                    params: {
                        page: pageZeroBased + 1,
                        per_page: perPage,
                        search,
                    },
                }
            );
            setRosterRows(data.data || []);
            setRosterTotal(Number(data.total ?? 0));
        } finally {
            setLoadingRoster(false);
        }
    };

    const openRosterModal = (inscripcion) => {
        setSelectedInscripcion(inscripcion);
        setSearchJugador('');
        setRosterError('');
        setRosterPage(0); // [PAGINACIÓN BACKEND] Reinicia a la página 1

        // [PAGINACIÓN BACKEND] Precarga en memoria los jugadores ya fichados para no perderlos al paginar
        const inicial = {};
        (inscripcion.jugadores || []).forEach((j) => {
            inicial[j.id] = {
                jugador_id: j.id,
                numero_camiseta: j.pivot?.numero_camiseta ?? '',
            };
        });
        setSelectedMap(inicial);
        setIsRosterModalOpen(true);
    };

    // [PAGINACIÓN BACKEND] Dispara la carga al abrir, cambiar página, cambiar tamaño o buscar (con debounce)
    useEffect(() => {
        if (!isRosterModalOpen || !selectedInscripcion) return;

        const delay = searchJugador ? 300 : 0;
        const timer = setTimeout(() => {
            fetchRosterPage(selectedInscripcion.id, rosterPage, rosterRowsPerPage, searchJugador);
        }, delay);

        return () => clearTimeout(timer);
    }, [isRosterModalOpen, selectedInscripcion, rosterPage, rosterRowsPerPage, searchJugador]);

    const closeRosterModal = () => {
        setIsRosterModalOpen(false);
        setSelectedInscripcion(null);
        setRosterRows([]);
    };

    // [PAGINACIÓN BACKEND] Marca o desmarca en el mapa persistente sin importar en qué página esté
    const handleToggleJugador = (id) => {
        setSelectedMap((prev) => {
            const copia = { ...prev };
            if (copia[id]) {
                delete copia[id];
            } else {
                copia[id] = { jugador_id: id, numero_camiseta: '' };
            }
            return copia;
        });
    };

    // [PAGINACIÓN BACKEND] Actualiza el dorsal en el mapa persistente
    const handleDorsalChange = (id, value) => {
        setSelectedMap((prev) => ({
            ...prev,
            [id]: {
                jugador_id: id,
                numero_camiseta: value,
            },
        }));
    };

    const submitRoster = () => {
        setIsSavingRoster(true);
        setRosterError('');

        // [PAGINACIÓN BACKEND] Envía todos los jugadores acumulados en selectedMap de todas las páginas
        const seleccionados = Object.values(selectedMap).map((item) => ({
            jugador_id: item.jugador_id,
            numero_camiseta:
                item.numero_camiseta !== '' && item.numero_camiseta !== null
                    ? parseInt(item.numero_camiseta, 10)
                    : null,
        }));

        router.post(
            route('tenant.inscripciones.roster.store'),
            {
                equipo_torneo_id: selectedInscripcion.id,
                jugadores: seleccionados,
            },
            {
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
                },
            }
        );
    };

    // [PAGINACIÓN BACKEND] Total de jugadores seleccionados acumulados en todas las páginas
    const totalSeleccionados = Object.keys(selectedMap).length;

    return (
        <TenantLayout>
            <div className="p-6">
                <Head title="Inscripciones y Plantillas" />

                {pageErrors.grupos && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {Array.isArray(pageErrors.grupos) ? pageErrors.grupos[0] : pageErrors.grupos}
                    </Alert>
                )}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Inscripciones y Plantillas</h1>
                        <p className="text-sm text-gray-500">Asigna equipos, grupos y dorsales de los jugadores por torneo</p>
                    </div>

                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                        <FormControl size="small" sx={{ minWidth: 220 }}>
                            <InputLabel id="select-torneo-label">Torneo Seleccionado</InputLabel>
                            <Select
                                labelId="select-torneo-label"
                                value={torneoSeleccionado?.id || ''}
                                label="Torneo Seleccionado"
                                onChange={handleTorneoChange}
                            >
                                {torneos.map((t) => (
                                    <MenuItem key={t.id} value={t.id}>
                                        {`${t.nombre} (${t.anio})`}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {esTorneoDeGrupos && (
                            <Button
                                variant="outlined"
                                color="secondary"
                                startIcon={<ShuffleIcon />}
                                onClick={handleSortearGrupos}
                                disabled={!torneoSeleccionado || inscripciones.length === 0 || isSortingGrupos}
                            >
                                {isSortingGrupos ? 'Sorteando...' : 'Sortear Grupos'}
                            </Button>
                        )}

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
                                {esTorneoDeGrupos && (
                                    <th className="py-3 px-6 text-left">Grupo</th>
                                )}
                                <th className="py-3 px-6 text-center">Plantilla Fichada</th>
                                <th className="py-3 px-6 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {!torneoSeleccionado || inscripciones.length === 0 ? (
                                <tr>
                                    <td colSpan={esTorneoDeGrupos ? 5 : 4} className="py-10 text-center text-gray-500">
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
                                        {esTorneoDeGrupos && (
                                            <td className="py-3 px-6 text-left">
                                                <FormControl size="small" sx={{ minWidth: 140 }}>
                                                    <Select
                                                        displayEmpty
                                                        value={item.grupo_id ?? ''}
                                                        disabled={updatingGrupoId === item.id}
                                                        onChange={(e) => handleAsignarGrupo(item.id, e.target.value)}
                                                        sx={{
                                                            bgcolor: item.grupo_id ? 'background.paper' : '#fffbeb',
                                                            fontSize: '0.875rem',
                                                        }}
                                                    >
                                                        <MenuItem value="">
                                                            <em className="text-amber-700 not-italic">Sin grupo</em>
                                                        </MenuItem>
                                                        {grupos.map((g) => (
                                                            <MenuItem key={g.id} value={g.id}>
                                                                {g.nombre}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </td>
                                        )}
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

                                {esTorneoDeGrupos && (
                                    <FormControl fullWidth error={Boolean(equipoForm.errors.grupo_id)}>
                                        <InputLabel id="select-grupo-modal-label">Grupo (Opcional)</InputLabel>
                                        <Select
                                            labelId="select-grupo-modal-label"
                                            value={equipoForm.data.grupo_id}
                                            label="Grupo (Opcional)"
                                            onChange={(e) => equipoForm.setData('grupo_id', e.target.value)}
                                        >
                                            <MenuItem value="">
                                                <em>Sin grupo (asignar o sortear después)</em>
                                            </MenuItem>
                                            {grupos.map((g) => (
                                                <MenuItem key={g.id} value={g.id}>{g.nombre}</MenuItem>
                                            ))}
                                        </Select>
                                        {equipoForm.errors.grupo_id && (
                                            <FormHelperText>{equipoForm.errors.grupo_id}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
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
                        {/* [PAGINACIÓN BACKEND] Muestra contador total de seleccionados en todas las páginas */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span>
                                Plantilla de Jugadores: {selectedInscripcion?.equipo?.nombre} ({selectedInscripcion?.categoria?.nombre || 'General'})
                            </span>
                            <Chip
                                label={`${totalSeleccionados} Seleccionados`}
                                color="primary"
                                size="small"
                            />
                        </div>
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
                                onChange={(e) => {
                                    // [PAGINACIÓN BACKEND] Reinicia a página 0 al cambiar la búsqueda
                                    setSearchJugador(e.target.value);
                                    setRosterPage(0);
                                }}
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

                        <div className="max-h-96 overflow-y-auto border rounded-t">
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
                                    {/* [PAGINACIÓN BACKEND] Estado de carga y filas devueltas por el servidor */}
                                    {loadingRoster ? (
                                        <tr>
                                            <td colSpan="5" className="p-6 text-center text-gray-500 text-sm">
                                                Cargando jugadores...
                                            </td>
                                        </tr>
                                    ) : rosterRows.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-6 text-center text-gray-500 text-sm">
                                                No se encontraron jugadores.
                                            </td>
                                        </tr>
                                    ) : (
                                        rosterRows.map((j) => {
                                            const isSelected = Boolean(selectedMap[j.jugador_id]); // [PAGINACIÓN BACKEND] Lee estado del mapa persistente
                                            const dorsalActual = selectedMap[j.jugador_id]?.numero_camiseta ?? ''; // [PAGINACIÓN BACKEND] Lee dorsal del mapa persistente

                                            return (
                                                <tr key={j.jugador_id} className={`border-b ${(j.ocupadoPor || j.noAptoPorEdad) ? 'bg-gray-50 opacity-75' : 'hover:bg-gray-50'}`}>
                                                    <td className="p-2">
                                                        <Checkbox
                                                            checked={isSelected}
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
                                                            disabled={!isSelected || Boolean(j.ocupadoPor) || j.noAptoPorEdad}
                                                            value={dorsalActual}
                                                            onChange={(e) => handleDorsalChange(j.jugador_id, e.target.value)}
                                                            inputProps={{ style: { textAlign: 'center' } }}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* [PAGINACIÓN BACKEND] Controles de paginación conectados al total del servidor */}
                        <TablePagination
                            component="div"
                            count={rosterTotal}
                            page={rosterPage}
                            onPageChange={(event, newPage) => setRosterPage(newPage)}
                            rowsPerPage={rosterRowsPerPage}
                            onRowsPerPageChange={(event) => {
                                setRosterRowsPerPage(parseInt(event.target.value, 10));
                                setRosterPage(0);
                            }}
                            rowsPerPageOptions={[10, 20, 50]}
                            labelRowsPerPage="Jugadores por página:"
                            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
                            className="border-x border-b rounded-b bg-gray-50"
                        />
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