const express = require('express');
const { body, param } = require('express-validator');
const ClientesController = require('../controllers/ClientesController');

const router = express.Router();

// Crear cliente
router.post('/',
    [
        body('tipo_identificacion').isIn(['CEDULA', 'PASAPORTE', 'NIT']),
        body('identificacion').notEmpty().trim(),
        body('nombres').notEmpty().trim(),
        body('apellidos').notEmpty().trim(),
        body('telefono').notEmpty().trim(),
        body('email').optional().isEmail()
    ],
    ClientesController.crear
);

// Listar clientes
router.get('/', ClientesController.listar);

// Obtener cliente por ID
router.get('/:id',
    [param('id').isUUID()],
    ClientesController.obtenerPorId
);

// Actualizar cliente
router.put('/:id',
    [
        param('id').isUUID(),
        body('nombres').optional().trim(),
        body('apellidos').optional().trim(),
        body('telefono').optional().trim(),
        body('email').optional().isEmail()
    ],
    ClientesController.actualizar
);

// Eliminar cliente
router.delete('/:id',
    [param('id').isUUID()],
    ClientesController.eliminar
);

// Obtener vehículos de un cliente
router.get('/:id/vehiculos',
    [param('id').isUUID()],
    ClientesController.obtenerVehiculos
);

module.exports = router;
