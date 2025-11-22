# Seguimiento de Estado de Servicios

## Resumen de Funcionalidad

Se ha implementado un sistema de seguimiento granular del estado de cada servicio dentro de una orden de reparación. Esta funcionalidad permite a los mecánicos:

1. **Iniciar un servicio** (PENDIENTE → EN_PROCESO)
2. **Finalizar un servicio** (EN_PROCESO → COMPLETADO)
3. **Finalización automática de la orden** cuando todos los servicios están completados

## Flujo de Estados

### Estados de Servicio

```
PENDIENTE → EN_PROCESO → COMPLETADO
```

- **PENDIENTE**: Servicio aún no iniciado
- **EN_PROCESO**: Servicio en progreso
- **COMPLETADO**: Servicio terminado

### Estados de Orden

```
PENDIENTE → EN_PROCESO → FINALIZADO → ENTREGADO
```

### Lógica de Auto-finalización

Cuando el último servicio de una orden cambia a **COMPLETADO** y la orden está en estado **EN_PROCESO**, automáticamente la orden se marca como **FINALIZADO**, permitiendo la generación de facturas.

## Cambios Implementados

### Frontend

#### 1. `frontend/src/pages/mecanico/OrdenesMecanico.js`

**Función agregada** (líneas ~180-210):
```javascript
const actualizarEstadoServicio = async (servicioId, nuevoEstado) => {
    await ordenService.actualizarEstadoServicio(ordenSeleccionada.orden_id, servicioId, nuevoEstado);
    const response = await ordenService.getById(ordenSeleccionada.orden_id);
    const ordenActualizada = response.data.data || response.data;
    setOrdenSeleccionada(ordenActualizada);
    
    const todosCompletados = ordenActualizada.servicios?.every(s => s.estado === 'COMPLETADO');
    if (todosCompletados && ordenActualizada.estado === 'EN_PROCESO') {
        await ordenService.actualizarEstado(ordenSeleccionada.orden_id, 'FINALIZADO');
        showAlert('success', '¡Todos los servicios completados! La orden se marcó como FINALIZADA.');
    }
};
```

**Tabla de servicios actualizada** (líneas ~555-595):
- Nueva columna: **Estado** con badges de colores
- Botones condicionales:
  - **🔧 Iniciar**: Visible si estado = PENDIENTE
  - **✅ Finalizar**: Visible si estado = EN_PROCESO
  - Ningún botón si estado = COMPLETADO

**Estilos CSS agregados**:
```css
.badge-pendiente { background-color: #f59e0b; } /* Naranja */
.badge-en_proceso { background-color: #3b82f6; } /* Azul */
.badge-completado { background-color: #10b981; } /* Verde */
```

#### 2. `frontend/src/services/index.js`

**Método agregado**:
```javascript
actualizarEstadoServicio: (id, servicioId, estado) => 
    api.patch(`/ordenes/${id}/servicios/${servicioId}/estado`, { estado })
```

### Backend

#### 1. `microservices/ms-reparaciones/src/infrastructure/api/routes/ordenesRoutes.js`

**Nueva ruta**:
```javascript
router.patch('/:id/servicios/:servicioId/estado',
    [
        param('id').isUUID(),
        param('servicioId').isUUID(),
        body('estado').isIn(['PENDIENTE', 'EN_PROCESO', 'COMPLETADO'])
    ],
    OrdenesController.actualizarEstadoServicio
);
```

#### 2. `microservices/ms-reparaciones/src/infrastructure/api/controllers/OrdenesController.js`

**Nuevo controlador**:
```javascript
async actualizarEstadoServicio(req, res) {
    await OrdenService.actualizarEstadoServicio(
        req.params.id,
        req.params.servicioId,
        req.body.estado
    );
    
    const orden = await OrdenService.obtenerPorId(req.params.id);
    res.json({ 
        message: 'Estado del servicio actualizado exitosamente',
        data: orden 
    });
}
```

#### 3. `microservices/ms-reparaciones/src/application/services/OrdenService.js`

**Nuevo método del servicio**:
```javascript
async actualizarEstadoServicio(orden_id, servicio_id, nuevoEstado) {
    // Validar existencia de orden
    // Validar que la orden no esté finalizada/entregada/cancelada
    // Validar transiciones de estado
    // Actualizar estado del servicio
    // Publicar evento RabbitMQ
    // Retornar orden actualizada
}
```

**Validaciones implementadas**:
- La orden no puede estar FINALIZADA, ENTREGADA o CANCELADA
- Solo permite transiciones válidas:
  - PENDIENTE → EN_PROCESO
  - EN_PROCESO → COMPLETADO

#### 4. `microservices/ms-reparaciones/src/domain/repositories/ServicioRepository.js`

**Método existente usado**:
```javascript
async update(servicio_id, data) {
    // Actualiza cualquier campo del servicio, incluido 'estado'
}
```

### Base de Datos

La tabla `servicios` ya cuenta con la columna `estado`:

```sql
estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE' 
    COMMENT 'PENDIENTE, EN_PROCESO, COMPLETADO'
```

## Pruebas Sugeridas

### Escenario 1: Iniciar y Finalizar Servicios

1. Login como mecánico: `mecanico@taller.com` / `mecanico123`
2. Crear orden desde cita confirmada
3. Agregar múltiples servicios a la orden
4. Iniciar la orden (botón "🔧 Iniciar" en tabla principal)
5. Editar la orden (botón "✏️")
6. En la tabla de servicios:
   - Click "🔧 Iniciar" en primer servicio → estado cambia a EN_PROCESO (azul)
   - Click "✅ Finalizar" → estado cambia a COMPLETADO (verde)
7. Repetir para todos los servicios
8. Al finalizar el último servicio → alerta: "¡Todos los servicios completados! La orden se marcó como FINALIZADA."
9. Verificar que la orden aparece en estado FINALIZADO

### Escenario 2: Generar Factura

1. Con orden FINALIZADO del escenario 1
2. Ir a módulo "Facturas" (menú lateral)
3. Click "Nueva Factura"
4. Seleccionar la orden finalizada en el dropdown
5. Registrar pago (EFECTIVO, TARJETA, etc.)
6. Verificar factura creada correctamente

### Escenario 3: Validaciones de Estado

1. Intentar iniciar servicio que ya está EN_PROCESO → no debería mostrar botón
2. Intentar modificar servicio de orden FINALIZADA → backend rechaza con error
3. Verificar que servicios COMPLETADOS no muestran botones de acción

## Endpoints API

### PATCH `/api/ordenes/:orden_id/servicios/:servicio_id/estado`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body**:
```json
{
    "estado": "EN_PROCESO"
}
```

**Respuesta exitosa** (200):
```json
{
    "message": "Estado del servicio actualizado exitosamente",
    "data": {
        "orden_id": "uuid",
        "estado": "EN_PROCESO",
        "servicios": [
            {
                "servicio_id": "uuid",
                "descripcion": "Cambio de aceite",
                "estado": "EN_PROCESO",
                "costo": 50000
            }
        ]
    }
}
```

**Errores posibles**:
- 400: Transición de estado inválida
- 400: Orden en estado no modificable (FINALIZADO, ENTREGADO, CANCELADO)
- 404: Orden o servicio no encontrado
- 401: Token inválido o expirado

## Eventos RabbitMQ Publicados

```javascript
{
    exchange: 'repair_events',
    routingKey: 'service.status_changed',
    payload: {
        orden_id: 'uuid',
        servicio_id: 'uuid',
        estado_anterior: 'PENDIENTE',
        estado_nuevo: 'EN_PROCESO',
        timestamp: '2025-01-11T10:30:00.000Z'
    }
}
```

## Usuarios de Prueba

### Mecánico (Full CRUD)
- **Email**: mecanico@taller.com
- **Password**: mecanico123
- **Rol**: MECANICO

### Administrador (Solo Lectura)
- **Email**: admin@taller.com
- **Password**: admin123
- **Rol**: ADMINISTRADOR

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  OrdenesMecanico.js                                         │
│  ├─ actualizarEstadoServicio(servicioId, nuevoEstado)      │
│  ├─ Tabla de servicios con botones Iniciar/Finalizar       │
│  └─ Auto-finalización cuando todos servicios COMPLETADO    │
└────────────────────┬────────────────────────────────────────┘
                     │ PATCH /ordenes/:id/servicios/:sid/estado
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                            │
│  - Autenticación JWT                                        │
│  - Validación de rol MECANICO                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│               MS-REPARACIONES                               │
│  OrdenesController.actualizarEstadoServicio()               │
│  ├─ Validaciones                                            │
│  ├─ OrdenService.actualizarEstadoServicio()                 │
│  │   ├─ ServicioRepository.update(servicio_id, {estado})   │
│  │   └─ publishEvent('service.status_changed')             │
│  └─ Retorna orden actualizada                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   MYSQL DATABASE                            │
│  db_reparaciones.servicios                                  │
│  UPDATE servicios SET estado = ? WHERE servicio_id = ?      │
└─────────────────────────────────────────────────────────────┘
```

## Próximas Mejoras

1. **Notificaciones en tiempo real**: Usar WebSockets para notificar cambios de estado
2. **Historial de cambios**: Registrar auditoría de cambios de estado
3. **Estimación de tiempo**: Mostrar progreso estimado basado en horas_estimadas
4. **Asignación dinámica**: Permitir reasignar servicios específicos a diferentes mecánicos
5. **Dashboard de progreso**: Vista gráfica del estado de todos los servicios en órdenes activas
