import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Stepper, Step, StepLabel, Button, TextField,
  List, ListItem, ListItemButton, ListItemText, Divider, Checkbox,
  FormControlLabel, Paper, CircularProgress, Snackbar, Alert,
  Grid, Card, CardContent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const steps = ['Cliente', 'Vehículo', 'Servicios', 'Resumen'];

export default function SaleNew() {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();

  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [newClientForm, setNewClientForm] = useState({ name: '', phone: '', email: '' });
  const [showNewClient, setShowNewClient] = useState(false);

  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleResult, setVehicleResult] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [newVehicleForm, setNewVehicleForm] = useState({ plate: '', brand: '', model: '', color: '' });
  const [showNewVehicle, setShowNewVehicle] = useState(false);

  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedPackages, setSelectedPackages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    api.get('/services').then(r => setServices(r.data)).catch(() => {});
    api.get('/packages').then(r => setPackages(r.data)).catch(() => {});
  }, []);

  const showSnack = (msg, sev = 'success') => setSnack({ open: true, message: msg, severity: sev });

  const searchClients = async () => {
    if (!clientSearch.trim()) return;
    try {
      const res = await api.get(`/clients?search=${clientSearch}`);
      setClientResults(res.data);
    } catch { showSnack('Error al buscar clientes', 'error'); }
  };

  const searchVehicle = async () => {
    if (!vehicleSearch.trim()) return;
    try {
      const res = await api.get(`/vehicles?plate=${vehicleSearch}`);
      const found = Array.isArray(res.data) ? res.data[0] : res.data;
      setVehicleResult(found || null);
    } catch { showSnack('Error al buscar vehículo', 'error'); }
  };

  const createClient = async () => {
    if (!newClientForm.name || !newClientForm.phone) return showSnack('Nombre y teléfono requeridos', 'error');
    try {
      const res = await api.post('/clients', newClientForm);
      setSelectedClient(res.data);
      setShowNewClient(false);
      showSnack('Cliente creado');
    } catch { showSnack('Error al crear cliente', 'error'); }
  };

  const createVehicle = async () => {
    if (!newVehicleForm.plate || !newVehicleForm.brand) return showSnack('Placa y marca requeridas', 'error');
    try {
      const res = await api.post('/vehicles', { ...newVehicleForm, clientId: selectedClient?._id || selectedClient?.id });
      setSelectedVehicle(res.data);
      setShowNewVehicle(false);
      showSnack('Vehículo registrado');
    } catch { showSnack('Error al crear vehículo', 'error'); }
  };

  const toggleService = (s) => {
    setSelectedServices(prev =>
      prev.find(x => (x._id || x.id) === (s._id || s.id))
        ? prev.filter(x => (x._id || x.id) !== (s._id || s.id))
        : [...prev, s]
    );
  };

  const togglePackage = (p) => {
    setSelectedPackages(prev =>
      prev.find(x => (x._id || x.id) === (p._id || p.id))
        ? prev.filter(x => (x._id || x.id) !== (p._id || p.id))
        : [...prev, p]
    );
  };

  const total = [
    ...selectedServices.map(s => Number(s.price || 0)),
    ...selectedPackages.map(p => Number(p.price || 0)),
  ].reduce((a, b) => a + b, 0);

  const handleSubmit = async () => {
    if (!selectedClient || !selectedVehicle) return showSnack('Seleccione cliente y vehículo', 'error');
    setLoading(true);
    try {
      await api.post('/sales', {
        clientId: selectedClient._id || selectedClient.id,
        vehicleId: selectedVehicle._id || selectedVehicle.id,
        serviceIds: selectedServices.map(s => s._id || s.id),
        packageIds: selectedPackages.map(p => p._id || p.id),
        total,
      });
      showSnack('Venta creada exitosamente');
      setTimeout(() => navigate('/sales'), 1000);
    } catch (err) {
      showSnack(err.response?.data?.message || 'Error al crear venta', 'error');
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (activeStep === 0) return !!selectedClient;
    if (activeStep === 1) return !!selectedVehicle;
    if (activeStep === 2) return selectedServices.length > 0 || selectedPackages.length > 0;
    return true;
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Nueva Venta</Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {activeStep === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>Seleccionar Cliente</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField size="small" label="Buscar por nombre o teléfono" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} sx={{ width: 300 }} onKeyDown={(e) => e.key === 'Enter' && searchClients()} />
            <Button variant="outlined" onClick={searchClients}>Buscar</Button>
            <Button variant="text" onClick={() => setShowNewClient(true)}>+ Nuevo cliente</Button>
          </Box>
          {clientResults.length > 0 && (
            <Paper sx={{ mb: 2 }}>
              <List dense>
                {clientResults.map(c => (
                  <ListItem key={c._id || c.id} disablePadding>
                    <ListItemButton selected={selectedClient?._id === c._id} onClick={() => setSelectedClient(c)}>
                      <ListItemText primary={c.name} secondary={c.phone} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
          {showNewClient && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Nuevo Cliente</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TextField size="small" label="Nombre *" value={newClientForm.name} onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })} />
                <TextField size="small" label="Teléfono *" value={newClientForm.phone} onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })} />
                <TextField size="small" label="Email" value={newClientForm.email} onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" size="small" onClick={createClient}>Crear</Button>
                  <Button size="small" onClick={() => setShowNewClient(false)}>Cancelar</Button>
                </Box>
              </Box>
            </Paper>
          )}
          {selectedClient && <Paper sx={{ p: 2, bgcolor: 'success.light' }}><Typography>✓ Cliente: <b>{selectedClient.name}</b> ({selectedClient.phone})</Typography></Paper>}
        </Box>
      )}

      {activeStep === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>Seleccionar Vehículo</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField size="small" label="Buscar por placa" value={vehicleSearch} onChange={(e) => setVehicleSearch(e.target.value)} sx={{ width: 200 }} onKeyDown={(e) => e.key === 'Enter' && searchVehicle()} />
            <Button variant="outlined" onClick={searchVehicle}>Buscar</Button>
            <Button variant="text" onClick={() => setShowNewVehicle(true)}>+ Registrar vehículo</Button>
          </Box>
          {vehicleResult && !selectedVehicle && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography>{vehicleResult.plate} - {vehicleResult.brand} {vehicleResult.model}</Typography>
              <Button size="small" onClick={() => setSelectedVehicle(vehicleResult)}>Seleccionar</Button>
            </Paper>
          )}
          {showNewVehicle && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Registrar Vehículo</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TextField size="small" label="Placa *" value={newVehicleForm.plate} onChange={(e) => setNewVehicleForm({ ...newVehicleForm, plate: e.target.value })} />
                <TextField size="small" label="Marca *" value={newVehicleForm.brand} onChange={(e) => setNewVehicleForm({ ...newVehicleForm, brand: e.target.value })} />
                <TextField size="small" label="Modelo" value={newVehicleForm.model} onChange={(e) => setNewVehicleForm({ ...newVehicleForm, model: e.target.value })} />
                <TextField size="small" label="Color" value={newVehicleForm.color} onChange={(e) => setNewVehicleForm({ ...newVehicleForm, color: e.target.value })} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" size="small" onClick={createVehicle}>Registrar</Button>
                  <Button size="small" onClick={() => setShowNewVehicle(false)}>Cancelar</Button>
                </Box>
              </Box>
            </Paper>
          )}
          {selectedVehicle && <Paper sx={{ p: 2, bgcolor: 'success.light' }}><Typography>✓ Vehículo: <b>{selectedVehicle.plate}</b> - {selectedVehicle.brand} {selectedVehicle.model}</Typography></Paper>}
        </Box>
      )}

      {activeStep === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>Seleccionar Servicios y Paquetes</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Servicios</Typography>
              {services.map(s => (
                <FormControlLabel
                  key={s._id || s.id}
                  control={<Checkbox checked={!!selectedServices.find(x => (x._id || x.id) === (s._id || s.id))} onChange={() => toggleService(s)} />}
                  label={`${s.name} - $${Number(s.price).toFixed(2)}`}
                />
              ))}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Paquetes</Typography>
              {packages.map(p => (
                <FormControlLabel
                  key={p._id || p.id}
                  control={<Checkbox checked={!!selectedPackages.find(x => (x._id || x.id) === (p._id || p.id))} onChange={() => togglePackage(p)} />}
                  label={`${p.name} - $${Number(p.price).toFixed(2)}`}
                />
              ))}
            </Grid>
          </Grid>
          <Typography variant="h6" sx={{ mt: 2 }}>Total: ${total.toFixed(2)}</Typography>
        </Box>
      )}

      {activeStep === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>Resumen de Venta</Typography>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography><b>Cliente:</b> {selectedClient?.name}</Typography>
              <Typography><b>Vehículo:</b> {selectedVehicle?.plate} - {selectedVehicle?.brand} {selectedVehicle?.model}</Typography>
              <Divider sx={{ my: 1 }} />
              {selectedServices.map(s => <Typography key={s._id || s.id}>• {s.name} - ${Number(s.price).toFixed(2)}</Typography>)}
              {selectedPackages.map(p => <Typography key={p._id || p.id}>📦 {p.name} - ${Number(p.price).toFixed(2)}</Typography>)}
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6"><b>Total: ${total.toFixed(2)}</b></Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button disabled={activeStep === 0} onClick={() => setActiveStep(s => s - 1)}>Anterior</Button>
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" disabled={!canNext()} onClick={() => setActiveStep(s => s + 1)}>Siguiente</Button>
        ) : (
          <Button variant="contained" color="success" onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Confirmar Venta'}
          </Button>
        )}
        <Button color="error" onClick={() => navigate('/sales')}>Cancelar</Button>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
