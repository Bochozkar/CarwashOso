import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button,
  Chip, CircularProgress, MenuItem, Select, FormControl, InputLabel,
  Snackbar, Alert,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckIcon from '@mui/icons-material/Check';
import api from '../api/axios';

const statusColors = { 'En espera': 'warning', 'En proceso': 'info', 'Terminado': 'success' };

export default function Processes() {
  const [processes, setProcesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const showSnack = (msg, sev = 'success') => setSnack({ open: true, message: msg, severity: sev });

  const fetchAll = useCallback(async () => {
    try {
      const [pRes, uRes] = await Promise.allSettled([
        api.get('/processes'),
        api.get('/users'),
      ]);
      if (pRes.status === 'fulfilled') setProcesses(pRes.value.data);
      if (uRes.status === 'fulfilled') setUsers(uRes.value.data);
    } catch { showSnack('Error al cargar datos', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleStart = async (id) => {
    try {
      await api.put(`/processes/${id}/start`);
      showSnack('Proceso iniciado');
      fetchAll();
    } catch { showSnack('Error al iniciar proceso', 'error'); }
  };

  const handleFinish = async (id) => {
    try {
      await api.put(`/processes/${id}/finish`);
      showSnack('Proceso terminado');
      fetchAll();
    } catch { showSnack('Error al terminar proceso', 'error'); }
  };

  const handleAssign = async (id, userId) => {
    try {
      await api.put(`/processes/${id}/assign`, { userId });
      showSnack('Empleado asignado');
      fetchAll();
    } catch { showSnack('Error al asignar empleado', 'error'); }
  };

  const grouped = {
    'En espera': processes.filter(p => p.status === 'En espera' || p.status === 'pending'),
    'En proceso': processes.filter(p => p.status === 'En proceso' || p.status === 'in_progress'),
    'Terminado': processes.filter(p => p.status === 'Terminado' || p.status === 'done'),
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Línea de Proceso</Typography>
      <Grid container spacing={3}>
        {Object.entries(grouped).map(([status, items]) => (
          <Grid item xs={12} md={4} key={status}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              <Chip label={status} color={statusColors[status]} /> ({items.length})
            </Typography>
            {items.map(p => (
              <Card key={p._id || p.id} sx={{ mb: 2, border: 1, borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h6">{p.vehicle?.plate || p.plate || '—'}</Typography>
                  <Typography variant="body2" color="text.secondary">{p.client?.name || p.clientName || '—'}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {(p.services || []).map((s, i) => <Chip key={i} label={s.name || s} size="small" />)}
                  </Box>
                  <FormControl size="small" sx={{ mt: 1, minWidth: 150 }}>
                    <InputLabel>Asignar empleado</InputLabel>
                    <Select
                      value={p.assignedEmployee?._id || p.assignedEmployee || ''}
                      label="Asignar empleado"
                      onChange={(e) => handleAssign(p._id || p.id, e.target.value)}
                    >
                      <MenuItem value="">Sin asignar</MenuItem>
                      {users.filter(u => u.role === 'lavador').map(u => (
                        <MenuItem key={u._id || u.id} value={u._id || u.id}>{u.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </CardContent>
                <CardActions>
                  {(status === 'En espera') && (
                    <Button size="small" startIcon={<PlayArrowIcon />} onClick={() => handleStart(p._id || p.id)}>Iniciar</Button>
                  )}
                  {(status === 'En proceso') && (
                    <Button size="small" color="success" startIcon={<CheckIcon />} onClick={() => handleFinish(p._id || p.id)}>Terminar</Button>
                  )}
                </CardActions>
              </Card>
            ))}
            {items.length === 0 && <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>Sin vehículos</Typography>}
          </Grid>
        ))}
      </Grid>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
