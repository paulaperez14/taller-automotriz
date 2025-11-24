# Frontend - Taller Automotriz

Aplicación React para el sistema de gestión de taller automotriz.

## 🚀 Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- API Gateway corriendo en `http://localhost:3000`

## 📦 Instalación

1. Instalar dependencias:
```bash
cd frontend
npm install
```

## ▶️ Ejecutar en Desarrollo

```bash
npm start
```

La aplicación se abrirá en `http://localhost:3001`

## 🔐 Acceso

### Credenciales de Prueba

- **Email**: `admin@taller.com`
- **Contraseña**: `admin123`

## 📁 Estructura del Proyecto

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Layout.js          # Navegación y estructura
│   │   ├── Layout.css
│   │   └── PrivateRoute.js    # Protección de rutas
│   ├── context/
│   │   └── AuthContext.js     # Contexto de autenticación
│   ├── pages/
│   │   ├── Login.js           # Página de login
│   │   ├── Dashboard.js       # Panel principal
│   │   ├── Clientes.js        # Gestión de clientes
│   │   ├── Vehiculos.js       # Gestión de vehículos
│   │   ├── Citas.js           # Gestión de citas
│   │   ├── Ordenes.js         # Órdenes de servicio
│   │   ├── Repuestos.js       # Inventario de repuestos
│   │   └── Facturas.js        # Gestión de facturas
│   ├── services/
│   │   ├── api.js             # Configuración de axios
│   │   └── index.js           # Servicios API
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
└── package.json
```

## 🎨 Funcionalidades

### ✅ Implementadas

1. **Autenticación**
   - Login con JWT
   - Persistencia de sesión (localStorage)
   - Logout
   - Protección de rutas

2. **Dashboard**
   - Resumen de citas, órdenes y facturas
   - Estadísticas de ingresos
   - Alertas de inventario

3. **Gestión de Clientes**
   - Listar clientes
   - Crear nuevo cliente
   - Formulario completo con validación

4. **Gestión de Vehículos**
   - Listar vehículos registrados

5. **Gestión de Citas**
   - Listar citas programadas
   - Estados visuales (badges)

6. **Órdenes de Servicio**
   - Listar órdenes
   - Visualizar estado y costos

7. **Inventario de Repuestos**
   - Listar repuestos
   - Alertas de stock bajo

8. **Facturas**
   - Listar facturas
   - Ver detalles de pagos

## 🔧 Configuración

### API Base URL

El frontend está configurado para conectarse a:
```
http://localhost:3000/api
```

Para cambiar la URL, edita `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

### Proxy (Desarrollo)

El `package.json` incluye un proxy para desarrollo:
```json
"proxy": "http://localhost:3000"
```

Esto permite hacer peticiones relativas durante el desarrollo.

## 🌐 Navegación

Una vez iniciada sesión, tendrás acceso a:

- **📊 Dashboard**: Vista general del sistema
- **👥 Clientes**: Gestión de clientes
- **🚙 Vehículos**: Gestión de vehículos
- **📅 Citas**: Programación de citas
- **🔧 Órdenes**: Órdenes de servicio
- **⚙️ Repuestos**: Inventario
- **💰 Facturas**: Facturación

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) para autenticación:

1. El usuario inicia sesión con email y contraseña
2. El backend valida credenciales y retorna un token
3. El token se guarda en `localStorage`
4. Todas las peticiones incluyen el token en el header `Authorization`
5. Si el token expira (401), el usuario es redirigido al login

### Flujo de Autenticación

```javascript
// Login
const response = await authService.login(email, password);
localStorage.setItem('authToken', response.token);

// Peticiones autenticadas (automático con interceptor)
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Logout
await authService.logout();
localStorage.removeItem('authToken');
```

## 📱 Responsive

La aplicación está optimizada para:
- ✅ Desktop (1200px+)
- ⚠️ Tablet (768px - 1199px) - Parcial
- ❌ Mobile (< 768px) - No optimizado

## 🎨 Estilos

- CSS puro (sin librerías adicionales)
- Diseño limpio y moderno
- Colores corporativos:
  - Primary: #007bff (azul)
  - Success: #28a745 (verde)
  - Danger: #dc3545 (rojo)
  - Dark: #2c3e50 (navbar)

## 🚧 Próximas Mejoras

- [ ] Formularios completos para todas las entidades
- [ ] Edición y eliminación de registros
- [ ] Búsqueda y filtrado avanzado
- [ ] Paginación de tablas
- [ ] Gráficos y reportes
- [ ] Notificaciones en tiempo real
- [ ] Responsive mobile
- [ ] Validación de formularios mejorada
- [ ] Manejo de errores más robusto
- [ ] Testing (Jest + React Testing Library)

## 🐛 Solución de Problemas

### Error: "Token no proporcionado"
- Asegúrate de haber iniciado sesión
- Verifica que el API Gateway esté corriendo en puerto 3000

### Error: "Network Error"
- Verifica que el API Gateway esté corriendo
- Revisa la consola del navegador para ver detalles

### La página se recarga constantemente
- Verifica que el token no esté expirado
- Limpia localStorage: `localStorage.clear()`

### Los datos no se cargan
- Verifica que los microservicios estén corriendo
- Revisa la consola del navegador (F12)
- Verifica la conexión a la base de datos

## 📚 Tecnologías Utilizadas

- **React 18**: Framework principal
- **React Router DOM 6**: Navegación
- **Axios**: Cliente HTTP
- **Context API**: Gestión de estado
- **CSS3**: Estilos

## 🔨 Build para Producción

```bash
npm run build
```

Esto genera una carpeta `build/` con los archivos optimizados para producción.

Para servir en producción, puedes usar:
- Nginx
- Apache
- Servidor estático de Node.js (serve)

```bash
# Con serve
npm install -g serve
serve -s build -l 3001
```

## 📞 Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.

---

**Desarrollado para CECAR - Ingeniería de Software**  
**Versión**: 1.0.0
