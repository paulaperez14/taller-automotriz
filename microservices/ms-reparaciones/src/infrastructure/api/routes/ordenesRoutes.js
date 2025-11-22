const express = require('express');
const { body, param, query } = require('express-validator');
const OrdenesController = require('../controllers/OrdenesController');

const router = express.Router();

// Crear orden de servicio
router.post('/',
    [
        body('cliente_id').isUUID().withMessage('ID de cliente inválido'),
        body('vehiculo_id').isUUID().withMessage('ID de vehículo inválido'),
        body('cita_id').optional().isUUID().withMessage('ID de cita inválido'),
        body('mecanico_id').isUUID().withMessage('ID de mecánico requerido'),
        body('diagnostico').notEmpty().trim().withMessage('Diagnóstico requerido'),
        body('servicios').isArray({ min: 1 }).withMessage('Debe incluir al menos un servicio'),
        body('servicios.*.descripcion').notEmpty(),
        body('servicios.*.costo_mano_obra').isFloat({ min: 0 }),
        body('servicios.*.tiempo_estimado').isInt({ min: 1 })
    ],
    OrdenesController.crear
);

// Listar órdenes con filtros
router.get('/',
    [
        query('estado').optional().isIn(['PENDIENTE', 'EN_PROCESO', 'FINALIZADO', 'ENTREGADO', 'CANCELADO']),
        query('mecanico_id').optional().isUUID(),
        query('cliente_id').optional().isUUID(),
        query('fecha_inicio').optional().isISO8601(),
        query('fecha_fin').optional().isISO8601()
    ],
    OrdenesController.listar
);

// Obtener orden por ID con detalles completos
router.get('/:id',
    [param('id').isUUID()],
    OrdenesController.obtenerPorId
);

// Actualizar estado de orden
router.patch('/:id/estado',
    [
        param('id').isUUID(),
        body('estado').isIn(['PENDIENTE', 'EN_PROCESO', 'FINALIZADO', 'ENTREGADO', 'CANCELADO'])
    ],
    OrdenesController.actualizarEstado
);

// Agregar servicio a orden existente
router.post('/:id/servicios',
    [
        param('id').isUUID(),
        body('descripcion').notEmpty().trim(),
        body('costo_mano_obra').isFloat({ min: 0 }),
        body('tiempo_estimado').isInt({ min: 1 })
    ],
    OrdenesController.agregarServicio
);

// Eliminar servicio de orden
router.delete('/:id/servicios/:servicioId',
    [
        param('id').isUUID(),
        param('servicioId').isUUID()
    ],
    OrdenesController.eliminarServicio
);

// Actualizar estado de un servicio
router.patch('/:id/servicios/:servicioId/estado',
    [
        param('id').isUUID(),
        param('servicioId').isUUID(),
        body('estado').isIn(['PENDIENTE', 'EN_PROCESO', 'COMPLETADO'])
    ],
    OrdenesController.actualizarEstadoServicio
);

// Agregar repuesto a un servicio
router.post('/:ordenId/servicios/:servicioId/repuestos',
    [
        param('ordenId').isUUID(),
        param('servicioId').isUUID(),
        body('repuesto_id').isUUID(),
        body('cantidad').isInt({ min: 1 }),
        body('precio_unitario').isFloat({ min: 0 })
    ],
    OrdenesController.agregarRepuesto
);

// Actualizar diagnóstico
router.patch('/:id/diagnostico',
    [
        param('id').isUUID(),
        body('diagnostico').notEmpty().trim()
    ],
    OrdenesController.actualizarDiagnostico
);

// Asignar/cambiar mecánico
router.patch('/:id/mecanico',
    [
        param('id').isUUID(),
        body('mecanico_id').isUUID()
    ],
    OrdenesController.asignarMecanico
);

// Obtener órdenes por mecánico
router.get('/mecanico/:mecanico_id',
    [param('mecanico_id').isUUID()],
    OrdenesController.obtenerPorMecanico
);

// Obtener historial de vehículo
router.get('/vehiculo/:vehiculo_id/historial',
    [param('vehiculo_id').isUUID()],
    OrdenesController.obtenerHistorialVehiculo
);

// Calcular costo total de orden
router.get('/:id/costo',
    [param('id').isUUID()],
    OrdenesController.calcularCostoTotal
);

// Marcar orden como finalizada
router.post('/:id/finalizar',
    [param('id').isUUID()],
    OrdenesController.finalizarOrden
);

// Marcar orden como entregada
router.post('/:id/entregar',
    [param('id').isUUID()],
    OrdenesController.entregarOrden
);

// Cancelar orden
router.post('/:id/cancelar',
    [
        param('id').isUUID(),
        body('motivo_cancelacion').optional().trim()
    ],
    OrdenesController.cancelarOrden
);

module.exports = router;
