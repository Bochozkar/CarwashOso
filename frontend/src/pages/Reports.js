import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, TextField,
  CircularProgress,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import PrintIcon from '@mui/icons-material/Print';
import api from '../api/axios';
import dayjs from 'dayjs';

export default function Reports() {
  const [dailyStats, setDailyStats] = useState(null);
  const [rangeData, setRangeData] = useState([]);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [loadingRange, setLoadingRange] = useState(false);
  const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));

  useEffect(() => {
    const today = dayjs().format('YYYY-MM-DD');
    api.get(`/reports/daily?date=${today}`)
      .then(r => setDailyStats(r.data))
      .catch(() => setDailyStats(null))
      .finally(() => setLoadingDaily(false));
  }, []);

  const fetchRange = async () => {
    setLoadingRange(true);
    try {
      const res = await api.get(`/reports/range?start=${startDate}&end=${endDate}`);
      setRangeData(res.data);
    } catch { setRangeData([]); }
    finally { setLoadingRange(false); }
  };

  useEffect(() => { fetchRange(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Reportes</Typography>
        <Button startIcon={<PrintIcon />} variant="outlined" onClick={() => window.print()}>Imprimir</Button>
      </Box>

      <Typography variant="h6" gutterBottom>Reporte del día</Typography>
      {loadingDaily ? <CircularProgress /> : (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6} md={3}>
            <Card><CardContent>
              <Typography variant="body2" color="text.secondary">Total ventas</Typography>
              <Typography variant="h5" fontWeight="bold">{dailyStats?.totalSales ?? '—'}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card><CardContent>
              <Typography variant="body2" color="text.secondary">Ingresos</Typography>
              <Typography variant="h5" fontWeight="bold">{dailyStats?.totalRevenue != null ? `$${dailyStats.totalRevenue.toFixed(2)}` : '—'}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card><CardContent>
              <Typography variant="body2" color="text.secondary">Cajero top</Typography>
              <Typography variant="h5" fontWeight="bold">{dailyStats?.topCashier || '—'}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card><CardContent>
              <Typography variant="body2" color="text.secondary">Cancelaciones</Typography>
              <Typography variant="h5" fontWeight="bold">{dailyStats?.cancellations ?? '—'}</Typography>
            </CardContent></Card>
          </Grid>
        </Grid>
      )}

      <Typography variant="h6" gutterBottom>Reporte por rango de fechas</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField label="Fecha inicio" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
        <TextField label="Fecha fin" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
        <Button variant="outlined" onClick={fetchRange} disabled={loadingRange}>Consultar</Button>
      </Box>
      <Card>
        <CardContent>
          {loadingRange ? <CircularProgress /> : rangeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rangeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#FFA000" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>Sin datos para el rango seleccionado</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
