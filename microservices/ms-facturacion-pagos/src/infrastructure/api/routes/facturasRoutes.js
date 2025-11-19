const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const FacturasController = require('../controllers/FacturasController');

// Crear factura desde una orden de servicio
router.post('/',
    [
        body('orden_servicio_id').notEmpty().isUUID().withMessage('Orden de servicio ID inválido'),
        body('cliente_id').notEmpty().isUUID().withMessage('Cliente ID inválido'),
        body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un item'),
        body('items.*.descripcion').notEmpty().withMessage('Descripción requerida'),
        body('items.*.cantidad').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0'),
        body('items.*.precio_unitario').isFloat({ min: 0 }).withMessage('Precio unitario inválido'),
    ],
    FacturasController.crear
);

// Listar facturas con filtros
router.get('/',
    [
        query('page').optional().isInt({ min: 1 }).withMessage('Página inválida'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite inválido'),
        query('estado').optional().isIn(['PENDIENTE', 'PAGADA', 'ANULADA']).withMessage('Estado inválido'),
        query('fecha_inicio').optional().isDate().withMessage('Fecha inicio inválida'),
        query('fecha_fin').optional().isDate().withMessage('Fecha fin inválida'),
    ],
    FacturasController.listar
);

// Obtener factura por ID
router.get('/:id',
    [
        param('id').isUUID().withMessage('ID de factura inválido'),
    ],
    FacturasController.obtenerPorId
);

// Obtener facturas de un cliente
router.get('/cliente/:clienteId',
    [
        param('clienteId').isUUID().withMessage('ID de cliente inválido'),
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
    ],
    FacturasController.obtenerPorCliente
);

// Actualizar estado de factura
router.patch('/:id/estado',
    [
        param('id').isUUID().withMessage('ID de factura inválido'),
        body('estado').isIn(['PENDIENTE', 'PAGADA', 'ANULADA']).withMessage('Estado inválido'),
    ],
    FacturasController.actualizarEstado
);

// Obtener facturas pendientes
router.get('/filtros/pendientes',
    FacturasController.obtenerPendientes
);

module.exports = router;
