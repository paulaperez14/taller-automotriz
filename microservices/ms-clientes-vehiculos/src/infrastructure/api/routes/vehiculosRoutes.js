const express = require('express');
const { body, param } = require('express-validator');
const VehiculosController = require('../controllers/VehiculosController');

const router = express.Router();

// Crear vehículo
router.post('/',
    [
        body('cliente_id').isUUID(),
        body('placa').notEmpty().trim(),
        body('marca').notEmpty().trim(),
        body('modelo').notEmpty().trim(),
        body('anio').isInt({ min: 1900 }),
        body('kilometraje_actual').optional().isInt({ min: 0 })
    ],
    VehiculosController.crear
);

// Listar vehículos
router.get('/', VehiculosController.listar);

// Obtener vehículo por ID
router.get('/:id',
    [param('id').isUUID()],
    VehiculosController.obtenerPorId
);

// Obtener vehículo por placa
router.get('/placa/:placa', VehiculosController.obtenerPorPlaca);

// Actualizar vehículo
router.put('/:id',
    [param('id').isUUID()],
    VehiculosController.actualizar
);

// Obtener historial de servicios
router.get('/:id/historial',
    [param('id').isUUID()],
    VehiculosController.obtenerHistorial
);

module.exports = router;
