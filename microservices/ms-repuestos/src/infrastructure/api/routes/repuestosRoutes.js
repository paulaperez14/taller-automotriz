const express = require('express');
const { body, param, query } = require('express-validator');
const RepuestosController = require('../controllers/RepuestosController');

const router = express.Router();

// Crear repuesto
router.post('/',
    [
        body('nombre').notEmpty().trim().withMessage('Nombre requerido'),
        body('codigo').notEmpty().trim().withMessage('Código requerido'),
        body('proveedor_id').isUUID().withMessage('ID de proveedor inválido'),
        body('precio_compra').isFloat({ min: 0 }).withMessage('Precio de compra inválido'),
        body('precio_venta').isFloat({ min: 0 }).withMessage('Precio de venta inválido'),
        body('stock_actual').isInt({ min: 0 }).withMessage('Stock actual inválido'),
        body('stock_minimo').isInt({ min: 0 }).withMessage('Stock mínimo inválido'),
        body('categoria').optional().trim(),
        body('ubicacion').optional().trim()
    ],
    RepuestosController.crear
);

// Listar repuestos
router.get('/',
    [
        query('categoria').optional().trim(),
        query('proveedor_id').optional().isUUID(),
        query('bajo_stock').optional().isBoolean()
    ],
    RepuestosController.listar
);

// Obtener repuesto por ID
router.get('/:id',
    [param('id').isUUID()],
    RepuestosController.obtenerPorId
);

// Actualizar repuesto
router.put('/:id',
    [
        param('id').isUUID(),
        body('nombre').optional().trim(),
        body('precio_compra').optional().isFloat({ min: 0 }),
        body('precio_venta').optional().isFloat({ min: 0 }),
        body('stock_minimo').optional().isInt({ min: 0 }),
        body('categoria').optional().trim(),
        body('ubicacion').optional().trim()
    ],
    RepuestosController.actualizar
);

// Eliminar repuesto
router.delete('/:id',
    [param('id').isUUID()],
    RepuestosController.eliminar
);

// Ajustar stock (entrada/salida)
router.post('/:id/ajustar-stock',
    [
        param('id').isUUID(),
        body('tipo').isIn(['ENTRADA', 'SALIDA']).withMessage('Tipo debe ser ENTRADA o SALIDA'),
        body('cantidad').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0'),
        body('motivo').notEmpty().trim(),
        body('orden_id').optional().isUUID()
    ],
    RepuestosController.ajustarStock
);

// Obtener historial de movimientos
router.get('/:id/movimientos',
    [param('id').isUUID()],
    RepuestosController.obtenerMovimientos
);

// Repuestos con stock bajo
router.get('/alertas/bajo-stock',
    RepuestosController.obtenerBajoStock
);

// Buscar por código o nombre
router.get('/buscar/:termino',
    [param('termino').notEmpty()],
    RepuestosController.buscar
);

module.exports = router;
