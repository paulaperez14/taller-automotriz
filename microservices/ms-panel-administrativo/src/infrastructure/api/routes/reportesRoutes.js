const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const ReportesController = require('../controllers/ReportesController');

// Generar reporte personalizado
router.post('/',
    [
        body('titulo').notEmpty().withMessage('Título requerido'),
        body('tipo').notEmpty().withMessage('Tipo requerido'),
        body('fecha_inicio').optional().isDate().withMessage('Fecha inicio inválida'),
        body('fecha_fin').optional().isDate().withMessage('Fecha fin inválida'),
    ],
    ReportesController.generar
);

// Listar reportes generados
router.get('/',
    [
        query('tipo').optional(),
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
    ],
    ReportesController.listar
);

// Obtener reporte por ID
router.get('/:id',
    [
        param('id').isUUID().withMessage('ID de reporte inválido'),
    ],
    ReportesController.obtenerPorId
);

// Reporte de servicios más solicitados
router.get('/analisis/servicios-populares',
    ReportesController.obtenerServiciosPopulares
);

// Reporte de rendimiento de mecánicos
router.get('/analisis/rendimiento-mecanicos',
    ReportesController.obtenerRendimientoMecanicos
);

module.exports = router;
