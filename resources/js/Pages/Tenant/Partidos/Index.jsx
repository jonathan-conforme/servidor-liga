import React, { useState, useEffect, useMemo } from 'react';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import TenantLayout from '@/Layouts/TenantLayout';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
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
import Alert from '@mui/material/Alert';

import AutoRenewIcon from '@mui/icons-material/AutoRenew';
import EditIcon from '@mui/icons-material/Edit';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AsignarArbitrosDialog from './AsignarArbitrosDialog';
import GavelIcon from '@mui/icons-material/Gavel';

const FASES_ELIMINATORIAS = ['OCTAVOS', 'CUARTOS', 'SEMIFINAL', 'FINAL'];

export default function Index({
    torneos = [],
    torneoSeleccionado = null,
    categorias = [],
    categoriaIdSeleccionada = '',
    jornadasConPartidos = [],
    grupos = [],
    fixture = { existe: false, bloqueado: false },
    playoffs = { aplica: false, puede_generar: false },
    arbitros = [],
}) {
    const { errors: pageErrors } = usePage().props;
    const [arbitrosPartido, setArbitrosPartido] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPartido, setSelectedPartido] = useState(null);
    const [filtroGrupo, setFiltroGrupo] = useState('');

    // Modal híbrido de Play-offs
    const [isPlayoffModalOpen, setIsPlayoffModalOpen] = useState(false);
    const [crucesEditables, setCrucesEditables] = useState([]);
    const [playoffErrorLocal, setPlayoffErrorLocal] = useState('');
    const [isGeneratingPlayoffs, setIsGeneratingPlayoffs] = useState(false);

    useEffect(() => {
        setFiltroGrupo('');
    }, [torneoSeleccionado?.id, categoriaIdSeleccionada]);

    const gruposDisponibles = useMemo(() => {
        if (grupos.length > 0) return grupos;

        const map = new Map();
        jornadasConPartidos.forEach((j) => {
            (j.partidos || []).forEach((p) => {
                if (p.grupo && !map.has(p.grupo.id)) {
                    map.set(p.grupo.id, p.grupo);
                }
            });
        });

        return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
    }, [grupos, jornadasConPartidos]);

    const jornadasFiltradas = useMemo(() => {
        if (!filtroGrupo) return jornadasConPartidos;

        return jornadasConPartidos
            .map((j) => ({
                ...j,
                partidos: (j.partidos || []).filter((p) => String(p.grupo_id) === String(filtroGrupo)),
            }))
            .filter((j) => j.partidos.length > 0);
    }, [jornadasConPartidos, filtroGrupo]);

    const { data, setData, put, processing, errors, clearErrors, reset } = useForm({
        fecha_partido: '',
        cancha: '',
        goles_local: '',
        goles_visitante: '',
        penales_local: '',
        penales_visitante: '',
        estado: 'PROGRAMADO',
    });

    const handleTorneoChange = (e) => {
        router.get(route('tenant.partidos.index'), { torneo_id: e.target.value }, { preserveState: true });
    };

    const handleCategoriaChange = (e) => {
        router.get(
            route('tenant.partidos.index'),
            { torneo_id: torneoSeleccionado?.id, categoria_id: e.target.value },
            { preserveState: true }
        );
    };

    const handleGenerarFixture = (regenerar = false) => {
        const msg = regenerar
            ? 'Esto BORRARÁ el fixture actual y creará uno nuevo. ¿Continuar?'
            : '¿Deseas generar el fixture automático? Esto creará las jornadas y partidos del torneo.';

        if (confirm(msg)) {
            router.post(route('tenant.partidos.generar-fixture'), {
                torneo_id: torneoSeleccionado.id,
                regenerar,
            });
        }
    };

    const openPlayoffModal = () => {
        setPlayoffErrorLocal('');
        setCrucesEditables(
            (playoffs.llaves_sugeridas || []).map((c) => ({
                llave: c.llave,
                equipo_local_id: c.equipo_local_id || '',
                equipo_visitante_id: c.equipo_visitante_id || '',
                etiqueta_local: c.etiqueta_local,
                etiqueta_visitante: c.etiqueta_visitante,
            }))
        );
        setIsPlayoffModalOpen(true);
    };

    const handleCruceChange = (index, campo, valor) => {
        setCrucesEditables((prev) =>
            prev.map((item, idx) => (idx === index ? { ...item, [campo]: valor } : item))
        );
    };

    const submitGenerarPlayoffs = (e) => {
        e.preventDefault();
        setPlayoffErrorLocal('');

        const usados = new Set();
        for (const c of crucesEditables) {
            if (!c.equipo_local_id || !c.equipo_visitante_id) {
                setPlayoffErrorLocal(`Selecciona ambos equipos en la Llave #${c.llave}.`);
                return;
            }
            if (String(c.equipo_local_id) === String(c.equipo_visitante_id)) {
                setPlayoffErrorLocal(`En la Llave #${c.llave} no puede enfrentarse un equipo contra sí mismo.`);
                return;
            }
            if (usados.has(String(c.equipo_local_id)) || usados.has(String(c.equipo_visitante_id))) {
                setPlayoffErrorLocal('No puedes repetir un mismo equipo en dos llaves distintas.');
                return;
            }
            usados.add(String(c.equipo_local_id));
            usados.add(String(c.equipo_visitante_id));
        }

        setIsGeneratingPlayoffs(true);

        router.post(
            route('tenant.partidos.generar-playoffs'),
            {
                torneo_id: torneoSeleccionado.id,
                categoria_id: categoriaIdSeleccionada || null,
                fase: playoffs.fase_siguiente,
                llaves: crucesEditables.map((c) => ({
                    equipo_local_id: c.equipo_local_id,
                    equipo_visitante_id: c.equipo_visitante_id,
                })),
            },
            {
                preserveScroll: true,
                onSuccess: () => setIsPlayoffModalOpen(false),
                onError: (errs) => {
                    if (errs.playoffs) {
                        setPlayoffErrorLocal(Array.isArray(errs.playoffs) ? errs.playoffs[0] : errs.playoffs);
                    }
                },
                onFinish: () => setIsGeneratingPlayoffs(false),
            }
        );
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
            goles_local: partido.goles_local ?? '',
            goles_visitante: partido.goles_visitante ?? '',
            penales_local: partido.penales_local ?? '',
            penales_visitante: partido.penales_visitante ?? '',
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
            preserveScroll: true,
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

    const esPartidoEliminatorio = FASES_ELIMINATORIAS.includes(selectedPartido?.fase);

    return (
        <TenantLayout>
            <div className="p-6">
                <Head title="Calendario de Partidos" />
                {(pageErrors?.fixture || pageErrors?.playoffs) && (
                    <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">
                        {pageErrors.fixture || pageErrors.playoffs}
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Partidos y Programación</h1>
                        <p className="text-sm text-gray-500">Asigna canchas, horarios e ingresa los marcadores de los encuentros</p>
                    </div>

                    <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
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

                        {categorias.length > 1 && (
                            <FormControl size="small" sx={{ minWidth: 160 }}>
                                <InputLabel id="select-cat-partidos-label">Categoría</InputLabel>
                                <Select
                                    labelId="select-cat-partidos-label"
                                    value={categoriaIdSeleccionada}
                                    label="Categoría"
                                    onChange={handleCategoriaChange}
                                >
                                    {categorias.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {gruposDisponibles.length > 0 && (
                            <FormControl size="small" sx={{ minWidth: 160 }}>
                                <InputLabel id="select-grupo-filtro-label">Filtrar por Grupo</InputLabel>
                                <Select
                                    labelId="select-grupo-filtro-label"
                                    value={filtroGrupo}
                                    label="Filtrar por Grupo"
                                    onChange={(e) => setFiltroGrupo(e.target.value)}
                                >
                                    <MenuItem value="">Todos los grupos</MenuItem>
                                    {gruposDisponibles.map((g) => (
                                        <MenuItem key={g.id} value={g.id}>
                                            {g.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {torneoSeleccionado && !fixture.existe && (
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<AutoRenewIcon />}
                                onClick={() => handleGenerarFixture(false)}
                            >
                                Generar Fixture
                            </Button>
                        )}

                        {torneoSeleccionado && fixture.existe && !fixture.bloqueado && (
                            <Button
                                variant="outlined"
                                color="warning"
                                startIcon={<AutoRenewIcon />}
                                onClick={() => handleGenerarFixture(true)}
                            >
                                Regenerar Fixture
                            </Button>
                        )}

                        {playoffs.aplica && playoffs.puede_generar && (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<EmojiEventsIcon />}
                                onClick={openPlayoffModal}
                            >
                                {`Generar ${playoffs.fase_label}`}
                            </Button>
                        )}

                        {fixture.bloqueado && !playoffs.puede_generar && (
                            <Chip
                                label={playoffs.motivo || 'Fixture bloqueado (hay partidos jugados)'}
                                color="info"
                                size="small"
                            />
                        )}
                    </Stack>
                </div>

                {/* LISTADO DE JORNADAS Y PARTIDOS */}
                {jornadasFiltradas.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-10 text-center text-gray-500 border border-gray-200">
                        <SportsScoreIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <p className="text-lg font-medium">
                            {filtroGrupo
                                ? 'No hay partidos para el grupo seleccionado.'
                                : 'Aún no se ha generado el fixture para este torneo.'}
                        </p>
                        {!filtroGrupo && (
                            <p className="text-sm text-gray-400 mt-1">
                                Inscribe a los equipos en el torneo y luego presiona <strong>"Generar Fixture"</strong>.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {jornadasFiltradas.map((jornada) => (
                            <Card key={jornada.id} variant="outlined" className="shadow-sm overflow-hidden">
                                <Box className="bg-slate-100 px-5 py-3 border-b flex justify-between items-center">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold text-slate-800 text-md">
                                            {jornada.nombre || `JORNADA ${jornada.numero}`}
                                        </h3>
                                        {jornada.fecha_programada && (
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <EventIcon fontSize="inherit" /> {jornada.fecha_programada}
                                            </span>
                                        )}
                                        {jornada.descansan?.length > 0 && (
                                            <Chip
                                                size="small"
                                                variant="outlined"
                                                color="warning"
                                                label={`Descansa: ${jornada.descansan.map((e) => e.nombre).join(', ')}`}
                                            />
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

                                                {/* Grupo / Llave, Hora y Cancha */}
                                                <div className="w-full md:w-52 text-xs text-slate-500 space-y-1">
                                                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                                        {partido.grupo && (
                                                            <Chip
                                                                label={partido.grupo.nombre}
                                                                size="small"
                                                                color="secondary"
                                                                variant="outlined"
                                                                sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
                                                            />
                                                        )}
                                                        {FASES_ELIMINATORIAS.includes(partido.fase) && (
                                                            <Chip
                                                                label={`${partido.fase}${partido.llave ? ` · Llave ${partido.llave}` : ''}`}
                                                                size="small"
                                                                color="warning"
                                                                variant="outlined"
                                                                sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
                                                            />
                                                        )}
                                                        {partido.categoria && (
                                                            <Chip
                                                                label={partido.categoria.nombre}
                                                                size="small"
                                                                color="info"
                                                                variant="outlined"
                                                                sx={{ height: 22, fontSize: '0.7rem' }}
                                                            />
                                                        )}
                                                    </div>

                                                    {partido.fecha_partido ? (
                                                        <div className="flex items-center gap-1 font-medium text-slate-700">
                                                            <EventIcon fontSize="inherit" />
                                                            {new Date(partido.fecha_partido).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                        </div>
                                                    ) : (
                                                        <span className="italic block">Hora por definir</span>
                                                    )}

                                                    {partido.cancha && (
                                                        <div className="flex items-center gap-1">
                                                            <LocationOnIcon fontSize="inherit" /> {partido.cancha}
                                                        </div>
                                                    )}

                                                    {(() => {
                                                        const principal = partido.arbitros?.find((a) => a.pivot.rol === 'PRINCIPAL');
                                                        return principal ? (
                                                            <div className="flex items-center gap-1">
                                                                <GavelIcon fontSize="inherit" /> {principal.apellidos} {principal.nombres}
                                                            </div>
                                                        ) : null;
                                                    })()}
                                                </div>

                                                {/* Marcador Versus */}
                                                <div className="flex-1 flex items-center justify-center gap-4 w-full">
                                                    <span className="flex-1 text-right font-semibold text-slate-800 text-sm">
                                                        {partido.equipo_local?.nombre}
                                                    </span>

                                                    <div className="px-4 py-1.5 bg-slate-100 rounded-lg font-bold text-slate-800 min-w-[96px] text-center border">
                                                        {partido.estado === 'FINALIZADO' || partido.estado === 'EN_JUEGO' ? (
                                                            <div>
                                                                <div>{`${partido.goles_local ?? 0} - ${partido.goles_visitante ?? 0}`}</div>
                                                                {partido.penales_local != null && partido.penales_visitante != null && (
                                                                    <div className="text-[10px] font-semibold text-indigo-600">
                                                                        {`Pen: ${partido.penales_local} - ${partido.penales_visitante}`}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-400">VS</span>
                                                        )}
                                                    </div>

                                                    <span className="flex-1 text-left font-semibold text-slate-800 text-sm">
                                                        {partido.equipo_visitante?.nombre}
                                                    </span>
                                                </div>

                                                {/* Estado y Edición */}
                                                <div className="flex items-center gap-2">
                                                    <Chip label={partido.estado} size="small" color={getEstadoColor(partido.estado)} variant="outlined" />
                                                    <IconButton color="primary" size="small" onClick={() => openEditModal(partido)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton color="secondary" size="small" onClick={() => setArbitrosPartido(partido)} title="Asignar árbitros">
                                                        <GavelIcon fontSize="small" />
                                                    </IconButton>
                                                    <Link
                                                        href={route('tenant.partidos.en-vivo', partido.id)}
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
                                                        title="Abrir panel en vivo"
                                                    >
                                                        <SportsSoccerIcon fontSize="small" />
                                                        <span>En vivo</span>
                                                    </Link>
                                                </div>

                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* MODAL HÍBRIDO GENERAR PLAY-OFFS (AUTOMÁTICO + MANUAL) */}
                <Dialog open={isPlayoffModalOpen} onClose={() => setIsPlayoffModalOpen(false)} fullWidth maxWidth="md">
                    <DialogTitle className="font-bold">
                        {`Configurar Llaves — ${playoffs.fase_label || ''}`}
                    </DialogTitle>
                    <Box component="form" onSubmit={submitGenerarPlayoffs}>
                        <DialogContent dividers>
                            <Stack spacing={2.5}>
                                <p className="text-xs text-slate-600">
                                    Los cruces se precargaron automáticamente según la tabla de posiciones
                                    {playoffs.es_ida_vuelta ? ' (formato Ida y Vuelta)' : ' (Partido Único)'}.
                                    Puedes ajustar cualquier equipo manualmente antes de confirmar.
                                </p>

                                {playoffs.alertas?.length > 0 && (
                                    <Alert severity="warning">
                                        <strong>Atención — Revisa los siguientes cruces:</strong>
                                        <ul className="list-disc ml-5 mt-1 text-xs">
                                            {playoffs.alertas.map((alerta, i) => (
                                                <li key={i}>{alerta}</li>
                                            ))}
                                        </ul>
                                    </Alert>
                                )}

                                {playoffErrorLocal && (
                                    <Alert severity="error">{playoffErrorLocal}</Alert>
                                )}

                                {crucesEditables.map((cruce, idx) => (
                                    <div key={cruce.llave} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                                        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                                            <span>{`LLAVE #${cruce.llave}`}</span>
                                            <span className="text-slate-400 font-normal">
                                                {`Sugerido: ${cruce.etiqueta_local} vs ${cruce.etiqueta_visitante}`}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <FormControl size="small" fullWidth>
                                                <InputLabel>{`Local (${cruce.etiqueta_local})`}</InputLabel>
                                                <Select
                                                    value={cruce.equipo_local_id}
                                                    label={`Local (${cruce.etiqueta_local})`}
                                                    onChange={(e) => handleCruceChange(idx, 'equipo_local_id', e.target.value)}
                                                >
                                                    {(playoffs.equipos_disponibles || []).map((eq) => (
                                                        <MenuItem key={eq.id} value={eq.id}>
                                                            {`${eq.nombre}${eq.detalle ? ` (${eq.detalle})` : ''}`}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>

                                            <FormControl size="small" fullWidth>
                                                <InputLabel>{`Visitante (${cruce.etiqueta_visitante})`}</InputLabel>
                                                <Select
                                                    value={cruce.equipo_visitante_id}
                                                    label={`Visitante (${cruce.etiqueta_visitante})`}
                                                    onChange={(e) => handleCruceChange(idx, 'equipo_visitante_id', e.target.value)}
                                                >
                                                    {(playoffs.equipos_disponibles || []).map((eq) => (
                                                        <MenuItem key={eq.id} value={eq.id}>
                                                            {`${eq.nombre}${eq.detalle ? ` (${eq.detalle})` : ''}`}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </div>
                                    </div>
                                ))}
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, py: 2 }}>
                            <Button onClick={() => setIsPlayoffModalOpen(false)} disabled={isGeneratingPlayoffs}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="contained" color="success" disabled={isGeneratingPlayoffs}>
                                {isGeneratingPlayoffs ? 'Generando...' : `Confirmar y Generar ${playoffs.fase_label || ''}`}
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>

                {/* MODAL EDITAR PARTIDO */}
                <Dialog open={isEditModalOpen} onClose={closeEditModal} fullWidth maxWidth="xs">
                    <DialogTitle className="text-sm font-bold">
                        {`${selectedPartido?.equipo_local?.nombre || ''} vs ${selectedPartido?.equipo_visitante?.nombre || ''}`}
                    </DialogTitle>
                    <Box component="form" onSubmit={submitUpdate}>
                        <DialogContent dividers>
                            <Stack spacing={2.5}>
                                <TextField
                                    label="Fecha y Hora del Partido"
                                    type="datetime-local"
                                    fullWidth
                                    slotProps={{ inputLabel: { shrink: true } }}
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
                                        disabled
                                        label={`Goles ${selectedPartido?.equipo_local?.nombre || 'Local'}`}
                                        type="number"
                                        fullWidth
                                        value={data.goles_local}
                                        onChange={(e) => setData('goles_local', e.target.value)}
                                        error={Boolean(errors.goles_local)}
                                        helperText={errors.goles_local}
                                    />
                                    <TextField
                                    disabled
                                        label={`Goles ${selectedPartido?.equipo_visitante?.nombre || 'Visitante'}`}
                                        type="number"
                                        fullWidth
                                        value={data.goles_visitante}
                                        onChange={(e) => setData('goles_visitante', e.target.value)}
                                        error={Boolean(errors.goles_visitante)}
                                        helperText={errors.goles_visitante}
                                    />
                                </Stack>

                                {esPartidoEliminatorio && (
                                    <Stack direction="row" spacing={2}>
                                        <TextField
                                            label="Penales Local (si empatan)"
                                            type="number"
                                            fullWidth
                                            value={data.penales_local}
                                            onChange={(e) => setData('penales_local', e.target.value)}
                                        />
                                        <TextField
                                            label="Penales Visitante"
                                            type="number"
                                            fullWidth
                                            value={data.penales_visitante}
                                            onChange={(e) => setData('penales_visitante', e.target.value)}
                                        />
                                    </Stack>
                                )}
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

                <AsignarArbitrosDialog
                    open={Boolean(arbitrosPartido)}
                    partido={arbitrosPartido}
                    arbitros={arbitros}
                    onClose={() => setArbitrosPartido(null)}
                />
            </div>
        </TenantLayout>
    );
}
