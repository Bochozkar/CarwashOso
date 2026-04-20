# 🐻 CarwashOso

Plataforma integral para la administración de un carwash. Gestiona servicios, clientes, vehículos, empleados, ventas, procesos operativos e inventario.

## Stack

- **Frontend:** React 18 + MUI v5
- **Backend:** Node.js + Express.js
- **Base de datos:** MongoDB + Mongoose
- **Contenerización:** Docker + Docker Compose

## Módulos

| Módulo | Descripción |
|---|---|
| 🔐 Autenticación | JWT, roles (admin, gerente, cajero, empleado, lavador, secador, estético) |
| 👥 Clientes | CRUD de clientes con relación a vehículos |
| 🚗 Vehículos | CRUD con placa única, búsqueda rápida |
| 🧼 Servicios y Paquetes | Servicios individuales, paquetes, garantía por lluvia (24h/48h) |
| 🧾 Ventas | Generación de folio único, cancelación, garantía por lluvia |
| ⏱️ Línea de Proceso | Flujo del servicio: espera → proceso → terminado |
| 📺 Sala de Espera | Panel público para pantalla, actualización automática |
| 📦 Inventario | Control de stock, movimientos de entrada/salida |
| 💸 Gastos | Registro con subida de imágenes |
| 📊 Reportes | Diario por cajero, por rango de fechas |

## Inicio Rápido

### Producción (Docker)

```bash
# Clonar el repositorio
git clone https://github.com/Bochozkar/CarwashOso.git
cd CarwashOso

# Configurar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con tus valores

# Levantar todos los servicios
docker-compose up -d

# Cargar datos iniciales (primera vez)
docker exec carwashoso-backend node seeds/seed.js

# La aplicación estará disponible en http://localhost
```

### Desarrollo Local

**Backend:**
```bash
cd backend
cp .env.example .env
# Editar .env con MONGODB_URI local
npm install
npm run dev   # Puerto 5000
```

**Frontend:**
```bash
cd frontend
cp .env.example .env  # o crear .env con REACT_APP_API_URL
npm install
npm start     # Puerto 3000
```

## Cuentas de Demostración (después del seed)

| Email | Contraseña | Rol |
|---|---|---|
| admin@carwashoso.com | Admin123! | Administrador |
| gerente@carwashoso.com | Gerente123! | Gerente |
| cajero@carwashoso.com | Cajero123! | Cajero |

## API Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | /api/auth/login | Iniciar sesión |
| GET | /api/auth/me | Usuario actual |
| GET/POST | /api/clients | Listar/crear clientes |
| GET/POST | /api/vehicles | Listar/crear vehículos |
| GET | /api/vehicles/plate/:plate | Buscar por placa |
| GET/POST | /api/services | Listar/crear servicios |
| GET/POST | /api/packages | Listar/crear paquetes |
| GET/POST | /api/sales | Listar/crear ventas |
| PUT | /api/sales/:id/cancel | Cancelar venta |
| POST | /api/sales/:id/rain-guarantee | Aplicar garantía lluvia |
| GET/POST | /api/processes | Listar/crear procesos |
| GET/POST | /api/inventory | Listar/crear productos |
| POST | /api/inventory/:id/movement | Registrar movimiento |
| GET/POST | /api/expenses | Listar/crear gastos |
| GET | /api/reports/daily | Reporte diario |
| GET | /api/reports/range | Reporte por rango |

## Variables de Entorno

**Backend (.env):**
```
PORT=5000
MONGODB_URI=mongodb://mongo:27017/carwashoso
JWT_SECRET=tu_secreto_jwt_muy_largo_y_seguro
NODE_ENV=development
```

**Frontend (.env):**
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Estructura del Proyecto

```
CarwashOso/
├── backend/
│   ├── src/
│   │   ├── config/         # Conexión DB
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── middleware/     # Auth, upload, validation
│   │   ├── models/         # Esquemas Mongoose
│   │   ├── routes/         # Rutas Express
│   │   └── utils/          # Utilidades
│   ├── seeds/              # Datos iniciales
│   └── uploads/            # Imágenes de gastos
├── frontend/
│   └── src/
│       ├── api/            # Cliente Axios
│       ├── context/        # Auth Context
│       ├── components/     # Componentes reutilizables
│       └── pages/          # Páginas de la app
├── docker-compose.yml
└── README.md
```