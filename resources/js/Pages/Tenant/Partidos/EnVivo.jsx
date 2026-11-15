import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import TenantLayout from '@/Layouts/TenantLayout';

// [DEPURADO] Un solo import agrupado para componentes de Material UI
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    MenuItem,
    IconButton,
    Chip,
} from '@mui/material';

// [DEPURADO] Un solo import agrupado usando únicamente los iconos ya verificados en tu proyecto
import {
    SportsSoccer as SportsSoccerIcon,
    PlayArrow as PlayArrowIcon,
    Pause as PauseIcon,
    Stop as StopIcon,
    Delete as DeleteIcon,
    SwapHoriz as SwapHorizIcon,
    Style as StyleIcon,
    TimerOutlined as TimerOutlinedIcon,
    FreeBreakfast as FreeBreakfastIcon,
    Flag as FlagIcon,
    LockOutlined as LockOutlinedIcon,
    InfoOutlined as InfoOutlinedIcon,
} from '@mui/icons-material';

export default function EnVivo({ partido, jugadoresLocal = [], jugadoresVisitante = [] }) {
    const [openModal, setOpenModal] = useState(false);
    const [modalTipo, setModalTipo] = useState('');
    const [segundosTranscurridos, setSegundosTranscurridos] = useState(0);

    const eventosInicio = partido.eventos?.filter((e) => e.tipo === 'INICIO') || [];
    const eventoInicioActual = eventosInicio[eventosInicio.length - 1];

    const getPeriodoTexto = () => {
        if (partido.estado === 'EN_JUEGO') {
            return eventosInicio.length > 1 ? 'Segundo Tiempo' : 'Primer Tiempo';
        }
        if (partido.estado === 'ENTRETIEMPO') return 'Entretiempo';
        if (partido.estado === 'EN_PENALES') return 'Definición por Penales'; // [PENALES] Texto de periodo en tanda
        if (partido.estado === 'FINALIZADO') return 'Partido Finalizado';
        return 'Por Iniciar';
    };

    const getNombreJugador = (jugador) => {
        if (!jugador) return null;
        return jugador.nombre_completo || jugador.name || `${jugador.nombres || ''} ${jugador.apellidos || ''}`.trim() || null;
    };

    useEffect(() => {
        let timer;
        if (partido.estado === 'EN_JUEGO' && eventoInicioActual?.created_at) {
            const calcularSegundos = () => {
                const inicio = new Date(eventoInicioActual.created_at).getTime();
                const ahora = new Date().getTime();
                const diff = Math.max(0, Math.floor((ahora - inicio) / 1000));
                setSegundosTranscurridos(diff);
            };

            calcularSegundos();
            timer = setInterval(calcularSegundos, 1000);
        } else {
            setSegundosTranscurridos(0);
        }

        return () => clearInterval(timer);
    }, [partido.estado, eventoInicioActual]);

    const minutosReloj = Math.floor(segundosTranscurridos / 60);
    const segundosReloj = segundosTranscurridos % 60;
    const tiempoFormateado = `${String(minutosReloj).padStart(2, '0')}:${String(segundosReloj).padStart(2, '0')}`;
    const minutoActualPartido = minutosReloj > 0 ? minutosReloj + 1 : 1;

    const accionesHabilitadas = partido.estado === 'EN_JUEGO' || partido.estado === 'ENTRETIEMPO';
    const esEnPenales = partido.estado === 'EN_PENALES'; // [PENALES] Flag cuando el partido está en tanda
    const esFinalizado = partido.estado === 'FINALIZADO';
    const tienePenales = esEnPenales || (partido.penales_local !== null && partido.penales_visitante !== null); // [PENALES] Para mostrar marcador de penales en curso o finalizado

    const { data, setData, post, processing, reset } = useForm({
        tipo: '',
        minuto: '',
        equipo_id: '',
        jugador_id: '',
        jugador_ingresa_id: '',
        descripcion: '',
    });

    const jugadoresDelEquipo = String(data.equipo_id) === String(partido.equipo_local_id)
        ? jugadoresLocal
        : String(data.equipo_id) === String(partido.equipo_visitante_id)
            ? jugadoresVisitante
            : [];

    const esModalPenal = modalTipo === 'PENAL_ANOTADO' || modalTipo === 'PENAL_FALLADO'; // [PENALES] Identifica si el modal abierto es de cobro penal

    const abrirFormulario = (tipo, equipoId = null) => {
        if (esFinalizado) return;
        setModalTipo(tipo);
        setData({
            tipo: tipo,
            minuto: partido.estado === 'EN_JUEGO' ? minutoActualPartido : '',
            equipo_id: equipoId || partido.equipo_local_id,
            jugador_id: '',
            jugador_ingresa_id: '',
            descripcion: '',
        });
        setOpenModal(true);
    };

    const cerrarModal = () => {
        setOpenModal(false);
        reset();
    };

    const registrarEventoDirecto = (tipo) => {
        if (esFinalizado) return;
        const minutoEvento = (tipo === 'ENTRETIEMPO' || tipo === 'FIN') && partido.estado === 'EN_JUEGO'
            ? minutoActualPartido
            : null;

        router.post(
            route('tenant.partidos.eventos.store', partido.id),
            {
                tipo: tipo,
                minuto: minutoEvento,
            },
            { preserveScroll: true }
        );
    };

    const submitEvento = (e) => {
        e.preventDefault();
        if (esFinalizado) return;
        post(route('tenant.partidos.eventos.store', partido.id), {
            preserveScroll: true,
            onSuccess: () => cerrarModal(),
        });
    };

    const eliminarEvento = (eventoId) => {
        if (esFinalizado) return;
        if (confirm('¿Deseas eliminar este evento del historial? El marcador se recalculará.')) {
            router.delete(route('tenant.partidos.eventos.destroy', [partido.id, eventoId]), { preserveScroll: true });
        }
    };

    const renderEventoDetalle = (ev) => {
        const nombreJugador = getNombreJugador(ev.jugador);
        const nombreJugadorIngresa = getNombreJugador(ev.jugador_ingresa);

        switch (ev.tipo) {
            case 'GOL':
                return (
                    <div className="flex items-center gap-2">
                        <SportsSoccerIcon fontSize="small" className="text-emerald-600" />
                        <span><strong className="text-slate-900">GOL</strong> de {nombreJugador || 'Jugador'}</span>
                    </div>
                );
            case 'AUTOGOL':
                return (
                    <div className="flex items-center gap-2">
                        <SportsSoccerIcon fontSize="small" className="text-red-500" />
                        <span><strong className="text-red-600">AUTOGOL</strong> de {nombreJugador || 'Jugador'}</span>
                    </div>
                );
            // [PENALES] Renderizado en cronología para penal anotado
            case 'PENAL_ANOTADO':
                return (
                    <div className="flex items-center gap-2">
                        <SportsSoccerIcon fontSize="small" className="text-emerald-600" />
                        <span><strong className="text-emerald-700">Penal Anotado</strong> — {nombreJugador || 'Cobrador'}</span>
                    </div>
                );
            // [PENALES] Renderizado en cronología para penal fallado/atajado
            case 'PENAL_FALLADO':
                return (
                    <div className="flex items-center gap-2">
                        <SportsSoccerIcon fontSize="small" className="text-red-600" />
                        <span><strong className="text-red-600">Penal Fallado / Atajado</strong> — {nombreJugador || 'Cobrador'}</span>
                    </div>
                );
            case 'AMARILLA':
                return (
                    <div className="flex items-center gap-2">
                        <StyleIcon fontSize="small" className="text-amber-500" />
                        <span><strong className="text-slate-900">Tarjeta Amarilla</strong> — {nombreJugador || 'Jugador'}</span>
                    </div>
                );
            case 'ROJA':
                return (
                    <div className="flex items-center gap-2">
                        <StyleIcon fontSize="small" className="text-red-600" />
                        <span><strong className="text-slate-900">Tarjeta Roja</strong> — {nombreJugador || 'Jugador'}</span>
                    </div>
                );
            case 'CAMBIO':
                return (
                    <div className="flex items-center gap-2">
                        <SwapHorizIcon fontSize="small" className="text-indigo-500" />
                        <span><strong className="text-slate-900">Cambio</strong> — Sale: {nombreJugador || '-'} / Entra: {nombreJugadorIngresa || '-'}</span>
                    </div>
                );
            case 'INICIO': {
                const indexInicio = eventosInicio.findIndex((e) => e.id === ev.id);
                const tituloInicio = indexInicio > 0 ? 'Inicio del 2do Tiempo' : 'Inicio del 1er Tiempo';
                return (
                    <div className="flex items-center gap-2">
                        <PlayArrowIcon fontSize="small" className="text-emerald-600" />
                        <span><strong className="text-slate-900">{tituloInicio}</strong></span>
                    </div>
                );
            }
            case 'ENTRETIEMPO':
                return (
                    <div className="flex items-center gap-2">
                        <FreeBreakfastIcon fontSize="small" className="text-amber-600" />
                        <span><strong className="text-slate-900">Entretiempo / Descanso</strong></span>
                    </div>
                );
            case 'FIN':
                return (
                    <div className="flex items-center gap-2">
                        <FlagIcon fontSize="small" className="text-slate-700" />
                        <span><strong className="text-slate-900">Fin del Tiempo Reglamentario</strong></span>
                    </div>
                );
            // [PENALES] Renderizado en cronología para el cierre de la tanda
            case 'FIN_PENALES':
                return (
                    <div className="flex items-center gap-2">
                        <FlagIcon fontSize="small" className="text-purple-600" />
                        <span><strong className="text-slate-900">Fin de la Tanda de Penales</strong></span>
                    </div>
                );
            default:
                return <span>{ev.tipo}</span>;
        }
    };

    return (
        <TenantLayout header={`Panel en Vivo: ${partido.equipo_local?.nombre} vs ${partido.equipo_visitante?.nombre}`}>
            <Head title="Partido en Vivo" />

            <div className="max-w-5xl mx-auto space-y-6">

                {/* MARCADOR CABECERA */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                            {partido.torneo?.nombre} • {partido.jornada?.nombre}
                        </span>

                        <div className="flex items-center gap-3">
                            {partido.estado === 'EN_JUEGO' && (
                                <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 font-mono font-bold text-sm px-3 py-1 rounded-full border border-emerald-500/30 animate-pulse">
                                    <TimerOutlinedIcon fontSize="small" />
                                    <span>{tiempoFormateado}</span>
                                </div>
                            )}

                            {/* CHIP DE ESTADO DE ALTO CONTRASTE */}
                            <Chip
                                label={partido.estado.replace('_', ' ')} // [PENALES] Muestra "EN PENALES" limpio sin guion bajo
                                size="small"
                                sx={{
                                    fontWeight: 'bold',
                                    fontSize: '0.75rem',
                                    px: 1,
                                    color: '#ffffff',
                                    backgroundColor:
                                        partido.estado === 'EN_JUEGO'
                                            ? '#10b981'
                                            : partido.estado === 'ENTRETIEMPO'
                                            ? '#f59e0b'
                                            : partido.estado === 'EN_PENALES' // [PENALES] Color púrpura para tanda de penales
                                            ? '#8b5cf6'
                                            : partido.estado === 'FINALIZADO'
                                            ? '#ef4444'
                                            : '#6366f1',
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 items-center text-center py-4">
                        <div>
                            <h2 className="text-xl font-bold">{partido.equipo_local?.nombre}</h2>
                            <span className="text-xs text-slate-400">Local</span>
                        </div>

                        <div className="flex flex-col items-center justify-center">
                            <div className="text-4xl md:text-5xl font-black tracking-tight text-indigo-400">
                                {partido.goles_local ?? 0} - {partido.goles_visitante ?? 0}
                            </div>

                            {/* [PENALES] Marcador parcial o definitivo de la tanda de penales */}
                            {tienePenales && (
                                <div className="mt-2 px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-200 text-sm font-bold">
                                    Penales: {partido.penales_local ?? 0} - {partido.penales_visitante ?? 0}
                                </div>
                            )}

                            <span className="mt-2 inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-indigo-300 border border-slate-700/80">
                                {getPeriodoTexto()}
                            </span>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">{partido.equipo_visitante?.nombre}</h2>
                            <span className="text-xs text-slate-400">Visitante</span>
                        </div>
                    </div>

                    {/* BOTONES DE CONTROL DE TIEMPO (Se ocultan al finalizar) */}
                    {!esFinalizado && (
                        <div className="flex flex-wrap justify-center gap-3 pt-4 border-t border-slate-800">
                            {partido.estado === 'PROGRAMADO' && (
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<PlayArrowIcon />}
                                    onClick={() => registrarEventoDirecto('INICIO')}
                                >
                                    Iniciar Partido (1er Tiempo)
                                </Button>
                            )}

                            {partido.estado === 'EN_JUEGO' && (
                                <>
                                    <Button
                                        variant="contained"
                                        color="warning"
                                        startIcon={<PauseIcon />}
                                        onClick={() => registrarEventoDirecto('ENTRETIEMPO')}
                                    >
                                        Entretiempo
                                    </Button>

                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<StopIcon />}
                                        onClick={() => registrarEventoDirecto('FIN')}
                                    >
                                        Finalizar Partido
                                    </Button>
                                </>
                            )}

                            {partido.estado === 'ENTRETIEMPO' && (
                                <>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<PlayArrowIcon />}
                                        onClick={() => registrarEventoDirecto('INICIO')}
                                    >
                                        Iniciar 2do Tiempo
                                    </Button>

                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<StopIcon />}
                                        onClick={() => registrarEventoDirecto('FIN')}
                                    >
                                        Finalizar Partido
                                    </Button>
                                </>
                            )}

                            {/* [PENALES] Botón para cerrar la tanda una vez que exista un ganador */}
                            {esEnPenales && (
                                <Button
                                    variant="contained"
                                    color="error"
                                    disabled={(partido.penales_local ?? 0) === (partido.penales_visitante ?? 0)}
                                    startIcon={<StopIcon />}
                                    onClick={() => registrarEventoDirecto('FIN_PENALES')}
                                >
                                    Finalizar Tanda de Penales
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* BANNERS INFORMATIVOS DE ESTADO */}
                {/* [PENALES] Aviso cuando el partido entra en definición por penales */}
                {esEnPenales && (
                    <div className="bg-purple-50 border border-purple-200 text-purple-800 text-sm font-semibold px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm">
                        <InfoOutlinedIcon fontSize="small" className="text-purple-600" />
                        <span>Empate en el marcador global — Registra los cobros de la tanda de penales y finaliza cuando haya un ganador.</span>
                    </div>
                )}

                {esFinalizado && (
                    <div className="bg-slate-100 border border-slate-300 text-slate-800 text-sm font-semibold px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm">
                        <LockOutlinedIcon fontSize="small" className="text-red-600" />
                        <span>Partido Finalizado — El acta oficial ha sido cerrada y no admite modificaciones.</span>
                    </div>
                )}

                {partido.estado === 'PROGRAMADO' && (
                    <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-medium px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm">
                        <InfoOutlinedIcon fontSize="small" className="text-indigo-500" />
                        <span>Inicia el partido para habilitar el registro de goles, tarjetas y cambios.</span>
                    </div>
                )}

                {/* BOTONERA DE ACCIONES RÁPIDAS */}
                {/* [PENALES] Si está en penales muestra los botones de cobro; caso contrario muestra la botonera normal */}
                {esEnPenales ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<SportsSoccerIcon />}
                            onClick={() => abrirFormulario('PENAL_ANOTADO')}
                            sx={{ py: 1.5, borderRadius: 3 }}
                        >
                            + Penal Anotado
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<SportsSoccerIcon />}
                            onClick={() => abrirFormulario('PENAL_FALLADO')}
                            sx={{ py: 1.5, borderRadius: 3 }}
                        >
                            + Penal Fallado / Atajado
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Button
                            variant="outlined"
                            color="primary"
                            disabled={!accionesHabilitadas}
                            startIcon={<SportsSoccerIcon />}
                            onClick={() => abrirFormulario('GOL')}
                            sx={{ py: 1.5, borderRadius: 3 }}
                        >
                            + Gol
                        </Button>
                        <Button
                            variant="outlined"
                            color="warning"
                            disabled={!accionesHabilitadas}
                            startIcon={<StyleIcon />}
                            onClick={() => abrirFormulario('AMARILLA')}
                            sx={{ py: 1.5, borderRadius: 3 }}
                        >
                            + Tarjeta
                        </Button>
                        <Button
                            variant="outlined"
                            color="info"
                            disabled={!accionesHabilitadas}
                            startIcon={<SwapHorizIcon />}
                            onClick={() => abrirFormulario('CAMBIO')}
                            sx={{ py: 1.5, borderRadius: 3 }}
                        >
                            + Cambio
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            disabled={!accionesHabilitadas}
                            onClick={() => abrirFormulario('AUTOGOL')}
                            sx={{ py: 1.5, borderRadius: 3 }}
                        >
                            + Autogol
                        </Button>
                    </div>
                )}

                {/* HISTORIAL CRONOLÓGICO DE SOLO LECTURA SI ESTÁ FINALIZADO */}
                <div className="bg-white rounded-2xl border p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Cronología del Partido</h3>

                    {(!partido.eventos || partido.eventos.length === 0) ? (
                        <p className="text-sm text-slate-400 text-center py-8">Aún no se han registrado eventos en este partido.</p>
                    ) : (
                        <div className="space-y-3">
                            {partido.eventos.map((ev) => {
                                const esPenal = ev.tipo === 'PENAL_ANOTADO' || ev.tipo === 'PENAL_FALLADO'; // [PENALES] Etiqueta visual en cronología
                                return (
                                    <div key={ev.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 ${
                                                    esPenal ? 'bg-purple-50 text-purple-600' : 'bg-indigo-50 text-indigo-600'
                                                }`}
                                            >
                                                {esPenal ? 'PEN' : ev.minuto ? `${ev.minuto}'` : '--'}
                                            </span>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-800">
                                                    {renderEventoDetalle(ev)}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {ev.equipo?.nombre} {ev.descripcion && `• ${ev.descripcion}`}
                                                </p>
                                            </div>
                                        </div>

                                        {/* SE OCULTA EL BOTÓN DE ELIMINAR SI EL PARTIDO ESTÁ FINALIZADO */}
                                        {!esFinalizado && (
                                            <IconButton size="small" color="error" onClick={() => eliminarEvento(ev.id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL PARA EVENTOS */}
            <Dialog open={openModal} onClose={cerrarModal} fullWidth maxWidth="xs">
                <DialogTitle className="text-sm font-bold">
                    {/* [PENALES] Título amigable cuando se registra un penal */}
                    {esModalPenal ? 'Registrar Cobro de Penal' : `Registrar ${modalTipo}`}
                </DialogTitle>
                <form onSubmit={submitEvento}>
                    <DialogContent dividers className="space-y-4">
                        <TextField
                            select
                            fullWidth
                            label="Equipo"
                            value={data.equipo_id}
                            onChange={(e) => {
                                setData((prev) => ({
                                    ...prev,
                                    equipo_id: e.target.value,
                                    jugador_id: '',
                                    jugador_ingresa_id: '',
                                }));
                            }}
                        >
                            <MenuItem value={partido.equipo_local_id}>{partido.equipo_local?.nombre} (Local)</MenuItem>
                            <MenuItem value={partido.equipo_visitante_id}>{partido.equipo_visitante?.nombre} (Visitante)</MenuItem>
                        </TextField>

                        {modalTipo === 'AMARILLA' && (
                            <TextField
                                select
                                fullWidth
                                label="Sanción"
                                value={data.tipo}
                                onChange={(e) => setData('tipo', e.target.value)}
                            >
                                <MenuItem value="AMARILLA">Tarjeta Amarilla</MenuItem>
                                <MenuItem value="ROJA">Tarjeta Roja</MenuItem>
                            </TextField>
                        )}

                        {/* [PENALES] Selector para cambiar entre anotado o fallado dentro del modal */}
                        {esModalPenal && (
                            <TextField
                                select
                                fullWidth
                                label="Resultado del Cobro"
                                value={data.tipo}
                                onChange={(e) => setData('tipo', e.target.value)}
                            >
                                <MenuItem value="PENAL_ANOTADO">Penal Anotado (Gol)</MenuItem>
                                <MenuItem value="PENAL_FALLADO">Penal Fallado / Atajado</MenuItem>
                            </TextField>
                        )}

                        {/* [PENALES] El minuto reglamentario solo se pide fuera de la tanda de penales */}
                        {!esModalPenal && (
                            <TextField
                                fullWidth
                                type="number"
                                label="Minuto del evento"
                                value={data.minuto}
                                onChange={(e) => setData('minuto', e.target.value)}
                            />
                        )}

                        <TextField
                            select
                            fullWidth
                            label={
                                modalTipo === 'CAMBIO'
                                    ? 'Jugador que SALE'
                                    : esModalPenal
                                    ? 'Jugador que COBRA' // [PENALES] Etiqueta específica para el cobrador
                                    : 'Jugador'
                            }
                            value={data.jugador_id}
                            onChange={(e) => setData('jugador_id', e.target.value)}
                        >
                            {jugadoresDelEquipo.map((j) => (
                                <MenuItem key={j.id} value={j.id}>
                                    {j.name || `${j.nombres || ''} ${j.apellidos || ''}`.trim()} {j.numero ? `(#${j.numero})` : ''}
                                </MenuItem>
                            ))}
                        </TextField>

                        {modalTipo === 'CAMBIO' && (
                            <TextField
                                select
                                fullWidth
                                label="Jugador que ENTRA"
                                value={data.jugador_ingresa_id}
                                onChange={(e) => setData('jugador_ingresa_id', e.target.value)}
                            >
                                {jugadoresDelEquipo.map((j) => (
                                    <MenuItem key={j.id} value={j.id}>
                                        {j.name || `${j.nombres || ''} ${j.apellidos || ''}`.trim()} {j.numero ? `(#${j.numero})` : ''}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}

                        <TextField
                            fullWidth
                            label="Observación (opcional)"
                            value={data.descripcion}
                            onChange={(e) => setData('descripcion', e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button onClick={cerrarModal} disabled={processing}>Cancelar</Button>
                        <Button type="submit" variant="contained" disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar Evento'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </TenantLayout>
    );
}
