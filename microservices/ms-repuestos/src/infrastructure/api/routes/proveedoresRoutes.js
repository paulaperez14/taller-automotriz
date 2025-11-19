const express = require('express');
const { body, param } = require('express-validator');
const ProveedoresController = require('../controllers/ProveedoresController');

const router = express.Router();

// Crear proveedor
router.post('/',
    [
        body('nombre').notEmpty().trim().withMessage('Nombre requerido'),
        body('telefono').optional().trim(),
        body('email').optional().isEmail().withMessage('Email inválido'),
        body('direccion').optional().trim(),
        body('tiempo_entrega_dias').optional().isInt({ min: 1 })
    ],
    ProveedoresController.crear
);// Listar proveedores
router.get('/', ProveedoresController.listar);

// Obtener proveedor por ID
router.get('/:id',
    [param('id').isUUID()],
    ProveedoresController.obtenerPorId
);

// Actualizar proveedor
router.put('/:id',
    [
        param('id').isUUID(),
        body('nombre').optional().trim(),
        body('telefono').optional().trim(),
        body('email').optional().isEmail(),
        body('direccion').optional().trim(),
        body('tiempo_entrega_dias').optional().isInt({ min: 1 })
    ],
    ProveedoresController.actualizar
);// Eliminar proveedor
router.delete('/:id',
    [param('id').isUUID()],
    ProveedoresController.eliminar
);

// Obtener repuestos de un proveedor
router.get('/:id/repuestos',
    [param('id').isUUID()],
    ProveedoresController.obtenerRepuestos
);

module.exports = router;
