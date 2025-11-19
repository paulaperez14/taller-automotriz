# API Gateway - Sistema Taller Automotriz

## 🚀 Descripción

API Gateway que actúa como punto de entrada único para todos los microservicios del sistema de taller automotriz. Proporciona enrutamiento, autenticación, rate limiting y logging centralizado.

## 📋 Características

- ✅ **Enrutamiento inteligente** a 7 microservicios
- ✅ **Autenticación JWT** centralizada
- ✅ **Rate Limiting** para prevenir abuso
- ✅ **CORS** configurado
- ✅ **Logging** de todas las peticiones
- ✅ **Security headers** con Helmet
- ✅ **Health check** endpoint

## 🔗 Endpoints Disponibles

### Información del Gateway

```
GET http://localhost:3000/
```

Retorna información sobre los endpoints disponibles.

```
GET http://localhost:3000/health
```

Health check del gateway.

### Rutas Públicas (sin autenticación)

#### Autenticación
- `POST /api/auth/registro` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Refrescar token

### Rutas Protegidas (requieren token JWT)

#### Clientes y Vehículos
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Crear cliente
- `GET /api/clientes/:id` - Obtener cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente
- `GET /api/vehiculos` - Listar vehículos
- `POST /api/vehiculos` - Crear vehículo
- etc.

#### Citas (Agendamiento)
- `GET /api/citas` - Listar citas
- `POST /api/citas` - Crear cita
- `GET /api/citas/:id` - Obtener cita
- `PUT /api/citas/:id` - Actualizar cita
- `DELETE /api/citas/:id` - Cancelar cita

#### Órdenes de Servicio
- `GET /api/ordenes` - Listar órdenes
- `POST /api/ordenes` - Crear orden
- `GET /api/ordenes/:id` - Obtener orden
- `PUT /api/ordenes/:id` - Actualizar orden

#### Repuestos e Inventario
- `GET /api/repuestos` - Listar repuestos
- `POST /api/repuestos` - Crear repuesto
- `GET /api/proveedores` - Listar proveedores
- `POST /api/proveedores` - Crear proveedor

#### Facturación y Pagos
- `GET /api/facturas` - Listar facturas
- `POST /api/facturas` - Crear factura
- `GET /api/pagos` - Listar pagos
- `POST /api/pagos` - Registrar pago

#### Panel Administrativo
- `GET /api/dashboard/resumen` - Dashboard general
- `GET /api/dashboard/estadisticas/servicios` - Estadísticas de servicios
- `GET /api/dashboard/estadisticas/ingresos` - Estadísticas de ingresos
- `GET /api/reportes` - Listar reportes
- `POST /api/reportes` - Generar reporte

## 🔐 Autenticación

Todas las rutas protegidas requieren un token JWT en el header `Authorization`:

```bash
Authorization: Bearer <token>
```

### Ejemplo con cURL

```bash
# 1. Login para obtener token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@taller.com",
    "password": "admin123"
  }'

# 2. Usar el token en peticiones
curl -X GET http://localhost:3000/api/clientes \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Ejemplo con JavaScript (Frontend)

```javascript
// Configurar axios con interceptor
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usar en la aplicación
async function getClientes() {
  try {
    const response = await api.get('/clientes');
    console.log(response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      // Token inválido o expirado, redirigir al login
      window.location.href = '/login';
    }
  }
}
```

### Ejemplo con PowerShell

```powershell
# 1. Login
$loginBody = @{
    email = "admin@taller.com"
    password = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"

$token = $loginResponse.token

# 2. Hacer petición autenticada
$headers = @{
    Authorization = "Bearer $token"
}

$clientes = Invoke-RestMethod -Uri "http://localhost:3000/api/clientes" -Method Get -Headers $headers
```

## 📊 Rate Limiting

- **Ventana**: 15 minutos (configurable)
- **Máximo de peticiones**: 100 por ventana (configurable)
- **Mensaje de error**: "Demasiadas peticiones desde esta IP, por favor intente más tarde."

## 🔧 Configuración

### Variables de Entorno

```env
PORT=3000

# Microservices URLs (internas de Docker)
AUTH_SERVICE_URL=http://ms-autenticacion:3001
AGENDAMIENTO_SERVICE_URL=http://ms-agendamiento:3002
REPARACIONES_SERVICE_URL=http://ms-reparaciones:3003
REPUESTOS_SERVICE_URL=http://ms-repuestos:3004
CLIENTES_SERVICE_URL=http://ms-clientes-vehiculos:3005
FACTURACION_SERVICE_URL=http://ms-facturacion-pagos:3006
PANEL_SERVICE_URL=http://ms-panel-administrativo:3007

# JWT Secret (debe coincidir con ms-autenticacion)
JWT_SECRET=tu_secreto_super_seguro_aqui

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100
```

## 🐳 Docker

El API Gateway está configurado en el `docker-compose.yml` principal:

```yaml
api-gateway:
  build: ./infrastructure/api-gateway
  container_name: api-gateway
  ports:
    - "3000:3000"
  depends_on:
    - ms-autenticacion
    - ms-agendamiento
    - ms-reparaciones
    - ms-repuestos
    - ms-clientes-vehiculos
    - ms-facturacion-pagos
    - ms-panel-administrativo
```

## 🧪 Pruebas

### Health Check

```bash
curl http://localhost:3000/health
```

### Probar autenticación

```bash
# Sin token - debe retornar 401
curl http://localhost:3000/api/clientes

# Con token inválido - debe retornar 401
curl http://localhost:3000/api/clientes \
  -H "Authorization: Bearer token_invalido"

# Con token válido - debe funcionar
curl http://localhost:3000/api/clientes \
  -H "Authorization: Bearer <token_valido>"
```

## 🏗️ Arquitectura

```
Frontend (React/Vue/Angular)
         ↓
    API Gateway :3000
         ↓
    ┌────┴────┬────────┬──────────┬─────────┬────────────┬──────────────┐
    ↓         ↓        ↓          ↓         ↓            ↓              ↓
 ms-auth  ms-agenda ms-repar  ms-repues ms-clientes ms-factur  ms-panel
  :3001    :3002     :3003     :3004     :3005       :3006      :3007
```

## 🔒 Seguridad

1. **Helmet**: Headers de seguridad HTTP
2. **CORS**: Configurado para permitir orígenes específicos
3. **JWT**: Validación centralizada de tokens
4. **Rate Limiting**: Protección contra ataques de fuerza bruta
5. **Proxy Headers**: Información del usuario autenticado se pasa a microservicios mediante headers `X-User-Id` y `X-User-Email`

## 📝 Logs

Todas las peticiones se registran con Morgan en formato `combined`:

```
::ffff:172.20.0.1 - - [19/Nov/2025:00:35:00 +0000] "GET /health HTTP/1.1" 200 55
::ffff:172.20.0.1 - - [19/Nov/2025:00:35:15 +0000] "GET /api/clientes HTTP/1.1" 401 89
```

## 🚦 Errores Comunes

### 401 Unauthorized
- Token no proporcionado
- Token expirado
- Token inválido

### 503 Service Unavailable
- Un microservicio está caído
- Timeout de conexión

### 404 Not Found
- Endpoint no existe
- Verificar la ruta en la documentación

### 429 Too Many Requests
- Se excedió el límite de peticiones
- Esperar 15 minutos o ajustar configuración

## 📚 Frontend Integration

### Configuración Base

```javascript
// src/config/api.js
export const API_BASE_URL = 'http://localhost:3000/api';

// src/services/api.js
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Uso en Componentes

```javascript
// src/services/clienteService.js
import api from './api';

export const clienteService = {
  getAll: () => api.get('/clientes'),
  getById: (id) => api.get(`/clientes/${id}`),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  delete: (id) => api.delete(`/clientes/${id}`)
};

// src/components/ClientesList.vue
import { clienteService } from '@/services/clienteService';

export default {
  async mounted() {
    try {
      const response = await clienteService.getAll();
      this.clientes = response.data;
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  }
};
```

## 🎯 Próximos Pasos

Para construir el frontend:

1. Configurar axios/fetch con `http://localhost:3000/api` como base URL
2. Implementar login y almacenar token en localStorage
3. Agregar interceptor para incluir token en cada petición
4. Manejar errores 401 (token expirado) y redirigir al login
5. Implementar refresh token si es necesario

---

**Autor**: CECAR - Ingeniería de Software  
**Versión**: 1.0.0  
**Puerto**: 3000
