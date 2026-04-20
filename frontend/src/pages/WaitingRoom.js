import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, Typography, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../api/axios';

export default function WaitingRoom() {
  const [vehicles, setVehicles] = useState([]);

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await api.get('/processes?status=terminado');
      setVehicles(Array.isArray(res.data) ? res.data : []);
    } catch {
      setVehicles([]);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
    const interval = setInterval(fetchVehicles, 30000);
    return () => clearInterval(interval);
  }, [fetchVehicles]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#3E2723',
        background: 'linear-gradient(135deg, #3E2723 0%, #5D4037 50%, #8D6E63 100%)',
        p: 4,
        color: 'white',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" fontWeight="bold">
          🐻 CarwashOso
        </Typography>
        <Typography variant="h5" sx={{ opacity: 0.9, mt: 1 }}>
          Tu vehículo está listo
        </Typography>
      </Box>

      {vehicles.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h6" sx={{ opacity: 0.7 }}>
            No hay vehículos listos por el momento
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {vehicles.map((v) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={v._id || v.id}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderRadius: 3,
                  color: 'white',
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 60, color: '#A5D6A7', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" sx={{ letterSpacing: 2 }}>
                  {v.vehicle?.plate || v.plate || '—'}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  {v.client?.name || v.clientName || ''}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ position: 'fixed', bottom: 16, right: 16, opacity: 0.5 }}>
        <Typography variant="caption">Actualización automática cada 30s</Typography>
      </Box>
    </Box>
  );
}
