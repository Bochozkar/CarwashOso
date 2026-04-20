import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert, CircularProgress,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import api from '../api/axios';
import ConfirmDialog from '../components/common/ConfirmDialog';

const emptyForm = { description: '', amount: '', date: '', category: '', image: null };

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const fetchExpenses = useCallback(async () => {
    try {
      const params = {};
      if (dateStart) params.start = dateStart;
      if (dateEnd) params.end = dateEnd;
      const res = await api.get('/expenses', { params });
      setExpenses(res.data);
    } catch { showSnack('Error al cargar gastos', 'error'); }
    finally { setLoading(false); }
  }, [dateStart, dateEnd]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const showSnack = (msg, sev = 'success') => setSnack({ open: true, message: msg, severity: sev });

  const handleSave = async () => {
    if (!form.description || !form.amount || !form.date) return showSnack('Descripción, monto y fecha son requeridos', 'error');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== null) fd.append(k, v); });
      await api.post('/expenses', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      showSnack('Gasto registrado');
      setDialogOpen(false);
      fetchExpenses();
    } catch { showSnack('Error al guardar gasto', 'error'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/expenses/${deleteId}`);
      showSnack('Gasto eliminado');
      setConfirmOpen(false);
      fetchExpenses();
    } catch { showSnack('Error al eliminar', 'error'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">Gastos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm(emptyForm); setDialogOpen(true); }}>Nuevo</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField label="Fecha inicio" type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
        <TextField label="Fecha fin" type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
        <Button variant="outlined" onClick={fetchExpenses}>Filtrar</Button>
      </Box>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>Descripción</b></TableCell>
                <TableCell><b>Monto</b></TableCell>
                <TableCell><b>Fecha</b></TableCell>
                <TableCell><b>Categoría</b></TableCell>
                <TableCell><b>Imagen</b></TableCell>
                <TableCell><b>Acciones</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map(e => (
                <TableRow key={e._id || e.id}>
                  <TableCell>{e.description}</TableCell>
                  <TableCell>${Number(e.amount).toFixed(2)}</TableCell>
                  <TableCell>{e.date ? new Date(e.date).toLocaleDateString('es-MX') : '—'}</TableCell>
                  <TableCell>{e.category && <Chip label={e.category} size="small" />}</TableCell>
                  <TableCell>{e.hasImage || e.imageUrl ? <ImageIcon color="action" /> : '—'}</TableCell>
                  <TableCell>
                    <IconButton size="small" color="error" onClick={() => { setDeleteId(e._id || e.id); setConfirmOpen(true); }}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {expenses.length === 0 && <TableRow><TableCell colSpan={6} align="center">Sin gastos</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Gasto</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Descripción *" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth />
            <TextField label="Monto *" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} fullWidth />
            <TextField label="Fecha *" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Categoría" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} fullWidth />
            <Button variant="outlined" component="label">
              Adjuntar imagen
              <input type="file" accept="image/*" hidden onChange={(e) => setForm({ ...form, image: e.target.files[0] })} />
            </Button>
            {form.image && <Typography variant="caption">{form.image.name}</Typography>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={confirmOpen} title="Eliminar Gasto" message="¿Eliminar este gasto?" onConfirm={handleDelete} onCancel={() => setConfirmOpen(false)} />
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
