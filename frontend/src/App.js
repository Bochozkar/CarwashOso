import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Vehicles from './pages/Vehicles';
import Services from './pages/Services';
import Packages from './pages/Packages';
import Sales from './pages/Sales';
import SaleNew from './pages/SaleNew';
import Processes from './pages/Processes';
import WaitingRoom from './pages/WaitingRoom';
import Inventory from './pages/Inventory';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Users from './pages/Users';

const theme = createTheme({
  palette: {
    primary: { main: '#5D4037' },
    secondary: { main: '#FFA000' },
    background: { default: '#FAFAFA' },
  },
});

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/waiting-room" element={<WaitingRoom />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="services" element={<Services />} />
        <Route path="packages" element={<Packages />} />
        <Route path="sales" element={<Sales />} />
        <Route path="sales/new" element={<SaleNew />} />
        <Route path="processes" element={<Processes />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="reports" element={<Reports />} />
        <Route path="users" element={<Users />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
