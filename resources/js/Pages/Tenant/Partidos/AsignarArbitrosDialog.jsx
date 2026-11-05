import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const ROLES = [
    { key: 'PRINCIPAL', label: 'Árbitro principal' },
    { key: 'ASISTENTE_1', label: 'Asistente 1' },
    { key: 'ASISTENTE_2', label: 'Asistente 2' },
    { key: 'CUARTO', label: 'Cuarto árbitro' },
];

export default function AsignarArbitrosDialog({ open, partido, arbitros = [], onClose }) {
    const { data, setData, put, processing, errors, clearErrors, reset } = useForm({
        PRINCIPAL: '', ASISTENTE_1: '', ASISTENTE_2: '', CUARTO: '',
    });

    useEffect(() => {
        if (!partido) return;
        const actuales = { PRINCIPAL: '', ASISTENTE_1: '', ASISTENTE_2: '', CUARTO: '' };
        (partido.arbitros || []).forEach((a) => { actuales[a.pivot.rol] = a.id; });
        setData(actuales);
        clearErrors();
    }, [partido]);

    const cerrar = () => { reset(); onClose(); };

    const submit = (e) => {
        e.preventDefault();
        put(route('tenant.partidos.arbitros.sync', partido.id), {
            preserveScroll: true,
            onSuccess: cerrar,
        });
    };

    return (
        <Dialog open={open} onClose={cerrar} fullWidth maxWidth="xs">
            <DialogTitle className="text-sm font-bold">
                Árbitros: {partido?.equipo_local?.nombre} vs {partido?.equipo_visitante?.nombre}
            </DialogTitle>
            <form onSubmit={submit}>
                <DialogContent dividers>
                    <Stack spacing={2.5}>
                        {errors.arbitros && (
                            <div className="p-2 rounded bg-red-50 border border-red-200 text-xs text-red-700">
                                {errors.arbitros}
                            </div>
                        )}
                        {ROLES.map(({ key, label }) => (
                            <TextField
                                key={key}
                                select
                                fullWidth
                                label={label}
                                value={data[key]}
                                onChange={(e) => setData(key, e.target.value)}
                                error={Boolean(errors[key])}
                                helperText={errors[key]}
                                required={key === 'PRINCIPAL'}
                            >
                                {key !== 'PRINCIPAL' && <MenuItem value=""><em>Sin asignar</em></MenuItem>}
                                {arbitros.map((a) => (
                                    <MenuItem key={a.id} value={a.id}>{a.apellidos} {a.nombres}</MenuItem>
                                ))}
                            </TextField>
                        ))}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={cerrar} disabled={processing}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={processing}>
                        {processing ? 'Guardando...' : 'Guardar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}