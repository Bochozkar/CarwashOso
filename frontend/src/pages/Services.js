import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert, CircularProgress, MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import api from '../api/axios';
import ConfirmDialog from '../components/common/ConfirmDialog';

const emptyForm = { name: '', type: 'lavado', price: '', duration: '' };
const types = ['lavado', 'detallado', 'pulido', 'encerado', 'otro'];

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const fetchServices = useCallback(async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch { showSnack('Error al cargar servicios', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const showSnack = (msg, sev = 'success') => setSnack({ open: true, message: msg, severity: sev });

  const handleSave = async () => {
    if (!form.name || !form.price) return showSnack('Nombre y precio son requeridos', 'error');
    try {
      if (editing) {
        await api.put(`/services/${editing._id || editing.id}`, form);
        showSnack('Servicio actualizado');
      } else {
        await api.post('/services', form);
        showSnack('Servicio creado');
      }
      setDialogOpen(false);
      fetchServices();
    } catch (err) {
      showSnack(err.response?.data?.message || 'Error al guardar', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/services/${deleteId}`);
      showSnack('Servicio eliminado');
      setConfirmOpen(false);
      fetchServices();
    } catch { showSnack('Error al eliminar', 'error'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">Servicios</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setForm(emptyForm); setDialogOpen(true); }}>Nuevo</Button>
      </Box>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>Nombre</b></TableCell>
                <TableCell><b>Tipo</b></TableCell>
                <TableCell><b>Precio</b></TableCell>
                <TableCell><b>Duración (min)</b></TableCell>
                <TableCell><b>Acciones</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s._id || s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.type}</TableCell>
                  <TableCell>${Number(s.price).toFixed(2)}</TableCell>
                  <TableCell>{s.duration}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => { setEditing(s); setForm({ name: s.name, type: s.type, price: s.price, duration: s.duration || '' }); setDialogOpen(true); }}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => { setDeleteId(s._id || s.id); setConfirmOpen(true); }}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth />
            <TextField select label="Tipo" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} fullWidth>
              {types.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField label="Precio *" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} fullWidth />
            <TextField label="Duración (min)" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={confirmOpen} title="Eliminar Servicio" message="¿Eliminar este servicio?" onConfirm={handleDelete} onCancel={() => setConfirmOpen(false)} />
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
