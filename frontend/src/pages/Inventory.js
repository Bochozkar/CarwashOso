import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert, CircularProgress,
  MenuItem, Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import api from '../api/axios';

const emptyProduct = { name: '', category: '', stock: 0, minStock: 0, unit: 'pcs' };
const emptyMovement = { type: 'entrada', quantity: 1, reason: '', notes: '' };

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productDialog, setProductDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [movDialog, setMovDialog] = useState(false);
  const [movForm, setMovForm] = useState(emptyMovement);
  const [movItemId, setMovItemId] = useState(null);
  const [histDialog, setHistDialog] = useState(false);
  const [history, setHistory] = useState([]);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const fetchItems = useCallback(async () => {
    try {
      const res = await api.get('/inventory');
      setItems(res.data);
    } catch { showSnack('Error al cargar inventario', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const showSnack = (msg, sev = 'success') => setSnack({ open: true, message: msg, severity: sev });

  const handleSaveProduct = async () => {
    if (!form.name) return showSnack('Nombre requerido', 'error');
    try {
      if (editing) {
        await api.put(`/inventory/${editing._id || editing.id}`, form);
        showSnack('Producto actualizado');
      } else {
        await api.post('/inventory', form);
        showSnack('Producto creado');
      }
      setProductDialog(false);
      fetchItems();
    } catch { showSnack('Error al guardar', 'error'); }
  };

  const handleMovement = async () => {
    if (!movForm.quantity || movForm.quantity <= 0) return showSnack('Cantidad requerida', 'error');
    try {
      await api.post(`/inventory/${movItemId}/movements`, movForm);
      showSnack('Movimiento registrado');
      setMovDialog(false);
      fetchItems();
    } catch { showSnack('Error al registrar movimiento', 'error'); }
  };

  const openHistory = async (id) => {
    try {
      const res = await api.get(`/inventory/${id}/movements`);
      setHistory(res.data);
      setHistDialog(true);
    } catch { showSnack('Error al cargar historial', 'error'); }
  };

  const getStockColor = (item) => {
    if (item.stock <= 0) return 'error.light';
    if (item.stock < item.minStock) return 'warning.light';
    return undefined;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">Inventario</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setForm(emptyProduct); setProductDialog(true); }}>Nuevo</Button>
      </Box>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>Producto</b></TableCell>
                <TableCell><b>Categoría</b></TableCell>
                <TableCell><b>Stock</b></TableCell>
                <TableCell><b>Stock Mínimo</b></TableCell>
                <TableCell><b>Unidad</b></TableCell>
                <TableCell><b>Estado</b></TableCell>
                <TableCell><b>Acciones</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map(item => (
                <TableRow key={item._id || item.id} sx={{ bgcolor: getStockColor(item) }}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.stock}</TableCell>
                  <TableCell>{item.minStock}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>
                    {item.stock <= 0 ? <Chip label="Sin stock" color="error" size="small" /> :
                      item.stock < item.minStock ? <Chip label="Bajo" color="warning" size="small" /> :
                        <Chip label="OK" color="success" size="small" />}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => { setEditing(item); setForm({ name: item.name, category: item.category, stock: item.stock, minStock: item.minStock, unit: item.unit }); setProductDialog(true); }}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="primary" onClick={() => { setMovItemId(item._id || item.id); setMovForm(emptyMovement); setMovDialog(true); }}><MoveToInboxIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => openHistory(item._id || item.id)}><HistoryIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={productDialog} onClose={() => setProductDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth />
            <TextField label="Categoría" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} fullWidth />
            <TextField label="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} fullWidth />
            <TextField label="Stock Mínimo" type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} fullWidth />
            <TextField label="Unidad" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialog(false)}>Cancelar</Button>
          <Button onClick={handleSaveProduct} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={movDialog} onClose={() => setMovDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Agregar Movimiento</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField select label="Tipo" value={movForm.type} onChange={(e) => setMovForm({ ...movForm, type: e.target.value })} fullWidth>
              <MenuItem value="entrada">Entrada</MenuItem>
              <MenuItem value="salida">Salida</MenuItem>
            </TextField>
            <TextField label="Cantidad *" type="number" value={movForm.quantity} onChange={(e) => setMovForm({ ...movForm, quantity: Number(e.target.value) })} fullWidth />
            <TextField label="Razón" value={movForm.reason} onChange={(e) => setMovForm({ ...movForm, reason: e.target.value })} fullWidth />
            <TextField label="Notas" value={movForm.notes} onChange={(e) => setMovForm({ ...movForm, notes: e.target.value })} fullWidth multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMovDialog(false)}>Cancelar</Button>
          <Button onClick={handleMovement} variant="contained">Registrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={histDialog} onClose={() => setHistDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Historial de Movimientos</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tipo</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Razón</TableCell>
                <TableCell>Fecha</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((m, i) => (
                <TableRow key={i}>
                  <TableCell><Chip label={m.type} color={m.type === 'entrada' ? 'success' : 'error'} size="small" /></TableCell>
                  <TableCell>{m.quantity}</TableCell>
                  <TableCell>{m.reason}</TableCell>
                  <TableCell>{m.createdAt ? new Date(m.createdAt).toLocaleDateString('es-MX') : '—'}</TableCell>
                </TableRow>
              ))}
              {history.length === 0 && <TableRow><TableCell colSpan={4} align="center">Sin historial</TableCell></TableRow>}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
