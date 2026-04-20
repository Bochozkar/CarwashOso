import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert, CircularProgress,
  Checkbox, FormControlLabel, FormGroup, Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import api from '../api/axios';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', serviceIds: [], rainGuarantee: false });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const fetchAll = useCallback(async () => {
    try {
      const [pRes, sRes] = await Promise.all([api.get('/packages'), api.get('/services')]);
      setPackages(pRes.data);
      setServices(sRes.data);
    } catch { showSnack('Error al cargar datos', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const showSnack = (msg, sev = 'success') => setSnack({ open: true, message: msg, severity: sev });

  const openAdd = () => { setEditing(null); setForm({ name: '', price: '', serviceIds: [], rainGuarantee: false }); setDialogOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, price: p.price,
      serviceIds: (p.services || []).map(s => s._id || s.id || s),
      rainGuarantee: p.rainGuarantee || false,
    });
    setDialogOpen(true);
  };

  const toggleService = (id) => {
    setForm(f => ({
      ...f,
      serviceIds: f.serviceIds.includes(id) ? f.serviceIds.filter(x => x !== id) : [...f.serviceIds, id],
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return showSnack('Nombre y precio son requeridos', 'error');
    try {
      if (editing) {
        await api.put(`/packages/${editing._id || editing.id}`, form);
        showSnack('Paquete actualizado');
      } else {
        await api.post('/packages', form);
        showSnack('Paquete creado');
      }
      setDialogOpen(false);
      fetchAll();
    } catch (err) {
      showSnack(err.response?.data?.message || 'Error al guardar', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/packages/${deleteId}`);
      showSnack('Paquete eliminado');
      setConfirmOpen(false);
      fetchAll();
    } catch { showSnack('Error al eliminar', 'error'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">Paquetes</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Nuevo</Button>
      </Box>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>Nombre</b></TableCell>
                <TableCell><b>Precio</b></TableCell>
                <TableCell><b>Servicios</b></TableCell>
                <TableCell><b>Garantía lluvia</b></TableCell>
                <TableCell><b>Acciones</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {packages.map((p) => (
                <TableRow key={p._id || p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>${Number(p.price).toFixed(2)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {(p.services || []).map((s, i) => (
                        <Chip key={i} label={s.name || s} size="small" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>{p.rainGuarantee ? 'Sí' : 'No'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => openEdit(p)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => { setDeleteId(p._id || p.id); setConfirmOpen(true); }}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Editar Paquete' : 'Nuevo Paquete'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth />
            <TextField label="Precio *" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} fullWidth />
            <Typography variant="subtitle2">Servicios incluidos:</Typography>
            <FormGroup>
              {services.map(s => (
                <FormControlLabel
                  key={s._id || s.id}
                  control={<Checkbox checked={form.serviceIds.includes(s._id || s.id)} onChange={() => toggleService(s._id || s.id)} />}
                  label={`${s.name} - $${s.price}`}
                />
              ))}
            </FormGroup>
            <FormControlLabel
              control={<Checkbox checked={form.rainGuarantee} onChange={(e) => setForm({ ...form, rainGuarantee: e.target.checked })} />}
              label="Garantía de lluvia"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={confirmOpen} title="Eliminar Paquete" message="¿Eliminar este paquete?" onConfirm={handleDelete} onCancel={() => setConfirmOpen(false)} />
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
