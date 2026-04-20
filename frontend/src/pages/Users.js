import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert, CircularProgress,
  Chip, MenuItem, Switch, FormControlLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const roles = ['admin', 'gerente', 'cajero', 'lavador'];
const emptyForm = { name: '', email: '', password: '', role: 'cajero' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'gerente') navigate('/');
  }, [user, navigate]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch { showSnack('Error al cargar usuarios', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const showSnack = (msg, sev = 'success') => setSnack({ open: true, message: msg, severity: sev });

  const handleSave = async () => {
    if (!form.name || !form.email || (!editing && !form.password)) return showSnack('Todos los campos son requeridos', 'error');
    try {
      if (editing) {
        await api.put(`/users/${editing._id || editing.id}`, { name: form.name, role: form.role });
        showSnack('Usuario actualizado');
      } else {
        await api.post('/users', form);
        showSnack('Usuario creado');
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (err) {
      showSnack(err.response?.data?.message || 'Error al guardar', 'error');
    }
  };

  const handleToggleActive = async (u) => {
    try {
      await api.put(`/users/${u._id || u.id}/toggle-active`);
      showSnack('Estado actualizado');
      fetchUsers();
    } catch { showSnack('Error al cambiar estado', 'error'); }
  };

  const roleColors = { admin: 'error', gerente: 'warning', cajero: 'info', lavador: 'success' };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">Usuarios</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setForm(emptyForm); setDialogOpen(true); }}>Nuevo</Button>
      </Box>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>Nombre</b></TableCell>
                <TableCell><b>Email</b></TableCell>
                <TableCell><b>Rol</b></TableCell>
                <TableCell><b>Activo</b></TableCell>
                <TableCell><b>Acciones</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => (
                <TableRow key={u._id || u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell><Chip label={u.role} color={roleColors[u.role] || 'default'} size="small" /></TableCell>
                  <TableCell><Switch checked={u.active !== false} onChange={() => handleToggleActive(u)} size="small" /></TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => { setEditing(u); setForm({ name: u.name, email: u.email, password: '', role: u.role }); setDialogOpen(true); }}><EditIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth />
            <TextField label="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth disabled={!!editing} />
            {!editing && <TextField label="Contraseña *" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} fullWidth />}
            <TextField select label="Rol" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} fullWidth>
              {roles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
