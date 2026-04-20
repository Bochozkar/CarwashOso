import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, TextField, Chip, Snackbar, Alert,
  CircularProgress, InputAdornment, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import UmbrellaIcon from '@mui/icons-material/Umbrella';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ConfirmDialog from '../components/common/ConfirmDialog';

const statusColors = { activa: 'success', cancelada: 'error', garantia: 'warning' };

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const fetchSales = useCallback(async () => {
    try {
      const res = await api.get('/sales');
      setSales(res.data);
    } catch { showSnack('Error al cargar ventas', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const showSnack = (msg, sev = 'success') => setSnack({ open: true, message: msg, severity: sev });

  const handleCancel = (sale) => {
    setConfirmAction({ label: 'cancelar', id: sale._id || sale.id, endpoint: `/sales/${sale._id || sale.id}/cancel` });
    setConfirmOpen(true);
  };

  const handleGuarantee = (sale) => {
    setConfirmAction({ label: 'garantía', id: sale._id || sale.id, endpoint: `/sales/${sale._id || sale.id}/guarantee` });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    try {
      await api.put(confirmAction.endpoint);
      showSnack('Operación realizada');
      setConfirmOpen(false);
      fetchSales();
    } catch (err) {
      showSnack(err.response?.data?.message || 'Error', 'error');
    }
  };

  const filtered = sales.filter(s => {
    const matchSearch = !search ||
      s.folio?.toLowerCase().includes(search.toLowerCase()) ||
      s.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.vehicle?.plate?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">Bitácora de Ventas</Typography>
        <Button variant="contained" startIcon={<AddShoppingCartIcon />} onClick={() => navigate('/sales/new')}>Nueva Venta</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          placeholder="Buscar por folio, cliente o placa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 350 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          size="small"
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Estado</InputLabel>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Estado">
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="activa">Activa</MenuItem>
            <MenuItem value="cancelada">Cancelada</MenuItem>
            <MenuItem value="garantia">Garantía</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>Folio</b></TableCell>
                <TableCell><b>Cliente</b></TableCell>
                <TableCell><b>Vehículo</b></TableCell>
                <TableCell><b>Total</b></TableCell>
                <TableCell><b>Estado</b></TableCell>
                <TableCell><b>Fecha</b></TableCell>
                <TableCell><b>Acciones</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s._id || s.id}>
                  <TableCell>{s.folio}</TableCell>
                  <TableCell>{s.client?.name || '—'}</TableCell>
                  <TableCell>{s.vehicle?.plate || '—'}</TableCell>
                  <TableCell>${Number(s.total || 0).toFixed(2)}</TableCell>
                  <TableCell><Chip label={s.status} color={statusColors[s.status] || 'default'} size="small" /></TableCell>
                  <TableCell>{s.createdAt ? new Date(s.createdAt).toLocaleDateString('es-MX') : '—'}</TableCell>
                  <TableCell>
                    {s.status === 'activa' && (
                      <>
                        <IconButton size="small" color="error" title="Cancelar" onClick={() => handleCancel(s)}><CancelIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="warning" title="Garantía lluvia" onClick={() => handleGuarantee(s)}><UmbrellaIcon fontSize="small" /></IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={7} align="center">Sin resultados</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar acción"
        message={`¿Está seguro de realizar esta acción (${confirmAction?.label})?`}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
