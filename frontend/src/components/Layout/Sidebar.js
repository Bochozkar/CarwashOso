import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import TimelineIcon from '@mui/icons-material/Timeline';
import TvIcon from '@mui/icons-material/Tv';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BarChartIcon from '@mui/icons-material/BarChart';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 240;

const navItems = [
  { label: 'Dashboard', icon: <HomeIcon />, path: '/' },
  { label: 'Clientes', icon: <PeopleIcon />, path: '/clients' },
  { label: 'Vehículos', icon: <DirectionsCarIcon />, path: '/vehicles' },
  { label: 'Servicios', icon: <CleaningServicesIcon />, path: '/services' },
  { label: 'Paquetes', icon: <InventoryIcon />, path: '/packages' },
  { label: 'Bitácora', icon: <ReceiptIcon />, path: '/sales' },
  { label: 'Nueva Venta', icon: <AddShoppingCartIcon />, path: '/sales/new' },
  { label: 'Línea de Proceso', icon: <TimelineIcon />, path: '/processes' },
  { label: 'Sala de Espera', icon: <TvIcon />, path: '/waiting-room' },
  { label: 'Inventario', icon: <WarehouseIcon />, path: '/inventory' },
  { label: 'Gastos', icon: <AttachMoneyIcon />, path: '/expenses' },
  { label: 'Reportes', icon: <BarChartIcon />, path: '/reports' },
];

const adminItems = [
  { label: 'Usuarios', icon: <ManageAccountsIcon />, path: '/users' },
];

export default function Sidebar({ open, onClose, variant }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin' || user?.role === 'gerente';
  const allItems = isAdmin ? [...navItems, ...adminItems] : navItems;

  const handleNav = (path) => {
    navigate(path);
    if (variant === 'temporary') onClose();
  };

  const drawerContent = (
    <Box>
      <Toolbar />
      <Divider />
      <List dense>
        {allItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNav(item.path)}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
