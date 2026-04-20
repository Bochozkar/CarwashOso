import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert, CircularProgress,
  InputAdornment, MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import api from '../api/axios';
import ConfirmDialog from '../components/common/ConfirmDialog';

const emptyForm = { plate: '', brand: '', model: '', color: '', year: '', clientId: '' };

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const fetchAll = useCallback(async () => {
    try {
      const [vRes, cRes] = await Promise.all([api.get('/vehicles'), api.get('/clients')]);
      setVehicles(vRes.data);
      setClients(cRes.data);
    } catch {
      showSnack('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const showSnack = (msg, sev = 'success') => setSnack({ open: true, message: msg, severity: sev });

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (v) => {
    setEditing(v);
    setForm({ plate: v.plate, brand: v.brand, model: v.model, color: v.color || '', year: v.year || '', clientId: v.client?._id || v.clientId || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.plate || !form.brand || !form.clientId) return showSnack('Placa, marca y cliente son requeridos', 'error');
    try {
      if (editing) {
        await api.put(`/vehicles/${editing._id || editing.id}`, form);
        showSnack('Vehículo actualizado');
      } else {
        await api.post('/vehicles', form);
        showSnack('Vehículo creado');
      }
      setDialogOpen(false);
      fetchAll();
    } catch (err) {
      showSnack(err.response?.data?.message || 'Error al guardar', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/vehicles/${deleteId}`);
      showSnack('Vehículo eliminado');
      setConfirmOpen(false);
      fetchAll();
    } catch {
      showSnack('Error al eliminar', 'error');
    }
  };

  const filtered = vehicles.filter(v =>
    v.plate?.toLowerCase().includes(search.toLowerCase()) ||
    v.brand?.toLowerCase().includes(search.toLowerCase()) ||
    v.model?.toLowerCase().includes(search.toLowerCase())
  );

  const getClientName = (v) => v.client?.name || clients.find(c => (c._id || c.id) === v.clientId)?.name || '—';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">Vehículos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Nuevo</Button>
      </Box>
      <TextField
        placeholder="Buscar por placa, marca o modelo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: 350 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        size="small"
      />
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>Placa</b></TableCell>
                <TableCell><b>Marca</b></TableCell>
                <TableCell><b>Modelo</b></TableCell>
                <TableCell><b>Color</b></TableCell>
                <TableCell><b>Año</b></TableCell>
                <TableCell><b>Cliente</b></TableCell>
                <TableCell><b>Acciones</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((v) => (
                <TableRow key={v._id || v.id}>
                  <TableCell>{v.plate}</TableCell>
                  <TableCell>{v.brand}</TableCell>
                  <TableCell>{v.model}</TableCell>
                  <TableCell>{v.color}</TableCell>
                  <TableCell>{v.year}</TableCell>
                  <TableCell>{getClientName(v)}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => openEdit(v)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => { setDeleteId(v._id || v.id); setConfirmOpen(true); }}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={7} align="center">Sin resultados</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Editar Vehículo' : 'Nuevo Vehículo'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField select label="Cliente *" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} fullWidth>
              {clients.map(c => <MenuItem key={c._id || c.id} value={c._id || c.id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField label="Placa *" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} fullWidth />
            <TextField label="Marca *" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} fullWidth />
            <TextField label="Modelo" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} fullWidth />
            <TextField label="Color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} fullWidth />
            <TextField label="Año" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} fullWidth type="number" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={confirmOpen} title="Eliminar Vehículo" message="¿Eliminar este vehículo?" onConfirm={handleDelete} onCancel={() => setConfirmOpen(false)} />
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
