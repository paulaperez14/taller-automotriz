const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const DashboardController = require('../controllers/DashboardController');

// Obtener resumen general del dashboard
router.get('/resumen',
    DashboardController.obtenerResumen
);

// Obtener indicadores por tipo
router.get('/indicadores',
    [
        query('tipo').optional().isIn(['SERVICIOS', 'INGRESOS', 'EFICIENCIA', 'SATISFACCION'])
            .withMessage('Tipo inválido'),
        query('periodo').optional().isIn(['DIARIO', 'SEMANAL', 'MENSUAL', 'ANUAL'])
            .withMessage('Periodo inválido'),
    ],
    DashboardController.obtenerIndicadores
);

// Obtener estadísticas de servicios
router.get('/estadisticas/servicios',
    [
        query('fecha_inicio').optional().isDate().withMessage('Fecha inicio inválida'),
        query('fecha_fin').optional().isDate().withMessage('Fecha fin inválida'),
    ],
    DashboardController.obtenerEstadisticasServicios
);

// Obtener estadísticas de ingresos
router.get('/estadisticas/ingresos',
    [
        query('fecha_inicio').optional().isDate().withMessage('Fecha inicio inválida'),
        query('fecha_fin').optional().isDate().withMessage('Fecha fin inválida'),
    ],
    DashboardController.obtenerEstadisticasIngresos
);

// Obtener estadísticas de inventario
router.get('/estadisticas/inventario',
    DashboardController.obtenerEstadisticasInventario
);

// Obtener citas pendientes
router.get('/citas/pendientes',
    DashboardController.obtenerCitasPendientes
);

// Obtener órdenes activas
router.get('/ordenes/activas',
    DashboardController.obtenerOrdenesActivas
);

// Obtener facturas pendientes
router.get('/facturas/pendientes',
    DashboardController.obtenerFacturasPendientes
);

module.exports = router;
