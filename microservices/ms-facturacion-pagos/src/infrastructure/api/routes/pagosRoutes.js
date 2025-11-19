const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const PagosController = require('../controllers/PagosController');

// Registrar un pago
router.post('/',
    [
        body('factura_pago_id').notEmpty().isUUID().withMessage('ID de factura inválido'),
        body('monto').isFloat({ min: 0.01 }).withMessage('Monto debe ser mayor a 0'),
        body('metodo_pago').isIn(['EFECTIVO', 'TARJETA_CREDITO', 'TARJETA_DEBITO', 'TRANSFERENCIA', 'PSE'])
            .withMessage('Método de pago inválido'),
        body('referencia').optional().isString(),
        body('comprobante').optional().isString(),
    ],
    PagosController.registrar
);

// Listar pagos de una factura
router.get('/factura/:facturaId',
    [
        param('facturaId').isUUID().withMessage('ID de factura inválido'),
    ],
    PagosController.listarPorFactura
);

// Obtener detalle de un pago
router.get('/:id',
    [
        param('id').isUUID().withMessage('ID de pago inválido'),
    ],
    PagosController.obtenerPorId
);

// Actualizar estado de pago (aprobar/rechazar)
router.patch('/:id/estado',
    [
        param('id').isUUID().withMessage('ID de pago inválido'),
        body('estado').isIn(['APROBADO', 'RECHAZADO']).withMessage('Estado debe ser APROBADO o RECHAZADO'),
    ],
    PagosController.actualizarEstado
);

module.exports = router;
