const express = require('express');
const { body, param, query } = require('express-validator');
const CitasController = require('../controllers/CitasController');

const router = express.Router();

// Crear cita
router.post('/',
    [
        body('cliente_id').isUUID().withMessage('ID de cliente inválido'),
        body('vehiculo_id').isUUID().withMessage('ID de vehículo inválido'),
        body('fecha').isISO8601().withMessage('Fecha inválida'),
        body('hora').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Hora inválida (formato HH:mm)'),
        body('duracion_estimada').optional().isInt({ min: 15, max: 480 }).withMessage('Duración debe estar entre 15 y 480 minutos'),
        body('motivo').optional().trim(),
        body('mecanico_id').optional().isUUID()
    ],
    CitasController.crear
);

// Listar citas con filtros
router.get('/',
    [
        query('fecha').optional().isISO8601(),
        query('estado').optional().isIn(['PROGRAMADA', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA']),
        query('cliente_id').optional().isUUID(),
        query('mecanico_id').optional().isUUID()
    ],
    CitasController.listar
);

// Obtener cita por ID
router.get('/:id',
    [param('id').isUUID()],
    CitasController.obtenerPorId
);

// Actualizar cita
router.put('/:id',
    [
        param('id').isUUID(),
        body('fecha').optional().isISO8601(),
        body('hora').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
        body('duracion_estimada').optional().isInt({ min: 15, max: 480 }),
        body('estado').optional().isIn(['PROGRAMADA', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA']),
        body('motivo').optional().trim(),
        body('mecanico_id').optional().isUUID()
    ],
    CitasController.actualizar
);

// Cancelar cita
router.post('/:id/cancelar',
    [param('id').isUUID()],
    CitasController.cancelar
);

// Confirmar cita
router.post('/:id/confirmar',
    [param('id').isUUID()],
    CitasController.confirmar
);

// Completar cita
router.post('/:id/completar',
    [param('id').isUUID()],
    CitasController.completar
);

// Obtener disponibilidad de horarios
router.get('/disponibilidad/:fecha',
    [param('fecha').isISO8601()],
    CitasController.obtenerDisponibilidad
);

// Obtener citas por rango de fechas
router.get('/calendario/rango',
    [
        query('fecha_inicio').isISO8601(),
        query('fecha_fin').isISO8601()
    ],
    CitasController.obtenerPorRango
);

module.exports = router;
