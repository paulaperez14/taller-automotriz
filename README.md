# Sistema de Taller Automotriz - Microservicios

Sistema de gestión para taller automotriz basado en arquitectura de microservicios con Node.js, MySQL y RabbitMQ.

## 📋 Microservicios

| Microservicio | Puerto | Base de Datos | Descripción |
|--------------|--------|---------------|-------------|
| ms-autenticacion | 3001 | db_autenticacion | Gestión de usuarios y autenticación JWT |
| ms-agendamiento | 3002 | db_agendamiento | Agendamiento de citas |
| ms-reparaciones | 3003 | db_reparaciones | Órdenes de servicio y reparaciones |
| ms-repuestos | 3004 | db_repuestos | Inventario de repuestos |
| ms-clientes-vehiculos | 3005 | db_clientes_vehiculos | Gestión de clientes y vehículos |
| ms-facturacion-pagos | 3006 | db_facturacion_pagos | Facturación y pagos |
| ms-panel-administrativo | 3007 | db_panel_administrativo | Panel de administración |

## 🛠️ Requisitos Previos

- Docker Desktop
- Node.js 18+ (opcional, para desarrollo local)
- Git

## 🚀 Inicio Rápido

### 1. Clonar el repositorio

```bash
git clone https://github.com/paulaperez14/taller-automotriz.git
cd taller-automotriz
```

### 2. Configurar variables de entorno

Cada microservicio tiene un archivo `.env.example`. Copia y renombra a `.env`:

```bash
# Para cada microservicio
cd microservices/ms-autenticacion
cp .env.example .env
# Repetir para cada microservicio...
```

### 3. Iniciar la infraestructura

```bash
# Levantar solo las bases de datos y RabbitMQ
docker-compose up -d mysql-autenticacion mysql-agendamiento mysql-reparaciones mysql-repuestos mysql-clientes-vehiculos mysql-facturacion-pagos mysql-panel-administrativo rabbitmq phpmyadmin
```

### 4. Levantar todos los servicios

```bash
# Levantar todo el stack
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f ms-reparaciones
```

## 📊 Servicios Auxiliares

### PHPMyAdmin
- **URL**: http://localhost:8080
- **Servidor**: Seleccionar cualquier `mysql-*`
- **Usuario**: `root`
- **Contraseña**: `root123`

### RabbitMQ Management
- **URL**: http://localhost:15672
- **Usuario**: `admin`
- **Contraseña**: `admin123`

## 🗄️ Bases de Datos

Cada microservicio tiene su propia base de datos MySQL:

| Base de Datos | Puerto | Usuario | Contraseña |
|--------------|--------|---------|------------|
| db_autenticacion | 3307 | user_autenticacion | pass_autenticacion |
| db_agendamiento | 3308 | user_agendamiento | pass_agendamiento |
| db_reparaciones | 3309 | user_reparaciones | pass_reparaciones |
| db_repuestos | 3310 | user_repuestos | pass_repuestos |
| db_clientes_vehiculos | 3311 | user_clientes | pass_clientes |
| db_facturacion_pagos | 3312 | user_facturacion | pass_facturacion |
| db_panel_administrativo | 3313 | user_panel | pass_panel |

## 📡 Endpoints API

### ms-autenticacion (Puerto 3001)
```http
POST /api/auth/register    # Registrar usuario
POST /api/auth/login       # Iniciar sesión
GET  /api/auth/validate    # Validar token
POST /api/auth/refresh     # Renovar token
POST /api/auth/logout      # Cerrar sesión
GET  /health              # Health check
```

### ms-agendamiento (Puerto 3002)
```http
GET  /api/citas           # Listar citas
POST /api/citas           # Crear cita
GET  /api/citas/:id       # Obtener cita
PUT  /api/citas/:id       # Actualizar cita
DELETE /api/citas/:id     # Eliminar cita
GET  /health              # Health check
```

## 🧪 Desarrollo Local

### Instalar dependencias

```bash
cd microservices/ms-autenticacion
npm install
```

### Ejecutar en modo desarrollo

```bash
npm run dev
```

### Estructura de un Microservicio

```
ms-nombre/
├── src/
│   ├── index.js                          # Punto de entrada
│   ├── application/
│   │   └── services/                     # Lógica de negocio
│   ├── domain/
│   │   ├── entities/                     # Entidades de dominio
│   │   └── repositories/                 # Interfaces de repositorios
│   └── infrastructure/
│       ├── api/
│       │   ├── controllers/              # Controladores HTTP
│       │   └── routes/                   # Rutas Express
│       ├── database/
│       │   └── connection.js             # Conexión MySQL
│       └── messaging/
│           └── rabbitmq.js               # Mensajería RabbitMQ
├── .env.example
├── .gitignore
├── Dockerfile
└── package.json
```

## 🔄 Comunicación entre Microservicios

Los microservicios se comunican mediante:

1. **RabbitMQ (Eventos Asíncronos)**
   - `auth_events` - Eventos de autenticación
   - `appointments_events` - Eventos de citas
   - `repairs_events` - Eventos de reparaciones
   - `parts_events` - Eventos de repuestos
   - `clients_events` - Eventos de clientes
   - `billing_events` - Eventos de facturación

2. **HTTP REST (Consultas Síncronas)**
   - Para consultas que requieren respuesta inmediata

## 🛑 Detener Servicios

```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (¡CUIDADO! Elimina los datos)
docker-compose down -v

# Detener un servicio específico
docker-compose stop ms-reparaciones
```

## 🔧 Comandos Útiles

```bash
# Ver estado de los contenedores
docker-compose ps

# Reiniciar un servicio
docker-compose restart ms-reparaciones

# Ver logs en tiempo real
docker-compose logs -f ms-reparaciones

# Ejecutar comandos en un contenedor
docker-compose exec ms-reparaciones sh

# Reconstruir imágenes
docker-compose build ms-reparaciones

# Reconstruir y reiniciar
docker-compose up -d --build ms-reparaciones
```

## 📦 Scripts SQL

Los scripts de inicialización de bases de datos están en:
- `scripts/` - Scripts originales
- `docker/mysql/` - Scripts copiados para Docker

## 🏗️ Arquitectura

El proyecto sigue los principios de:

- **Domain-Driven Design (DDD)**: Separación de capas (domain, application, infrastructure)
- **Arquitectura Hexagonal**: Desacoplamiento de infraestructura
- **Event-Driven**: Comunicación asíncrona mediante eventos
- **CQRS**: Separación de comandos y consultas (opcional)
- **API Gateway**: Para centralizar acceso (futuro)

## 📝 Notas de Desarrollo

- Los microservicios están configurados con **hot-reload** en desarrollo
- Las bases de datos se inicializan automáticamente con datos de prueba
- Los logs se muestran en consola en modo desarrollo
- Se recomienda usar Postman o Thunder Client para pruebas de API

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es parte del curso de Ingeniería de Software - CECAR

## 👥 Autores

- Paula Pérez - [paulaperez14](https://github.com/paulaperez14)
