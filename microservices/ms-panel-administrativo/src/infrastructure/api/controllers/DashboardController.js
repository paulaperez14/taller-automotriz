const { validationResult } = require('express-validator');
const DashboardService = require('../../../application/services/DashboardService');

class DashboardController {
    async obtenerResumen(req, res) {
        try {
            const resumen = await DashboardService.obtenerResumen();
            res.json(resumen);
        } catch (error) {
            console.error('❌ Error al obtener resumen:', error.message);
            res.status(500).json({
                error: 'Error al obtener resumen del dashboard',
                detalle: error.message
            });
        }
    }

    async obtenerIndicadores(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { tipo, periodo } = req.query;
            const indicadores = await DashboardService.obtenerIndicadores(tipo, periodo);

            res.json({
                tipo: tipo || 'TODOS',
                periodo: periodo || 'TODOS',
                total: indicadores.length,
                indicadores
            });
        } catch (error) {
            console.error('❌ Error al obtener indicadores:', error.message);
            res.status(500).json({
                error: 'Error al obtener indicadores',
                detalle: error.message
            });
        }
    }

    async obtenerEstadisticasServicios(req, res) {
        try {
            const { fecha_inicio, fecha_fin } = req.query;
            const estadisticas = await DashboardService.obtenerEstadisticasServicios(fecha_inicio, fecha_fin);

            res.json(estadisticas);
        } catch (error) {
            console.error('❌ Error al obtener estadísticas de servicios:', error.message);
            res.status(500).json({
                error: 'Error al obtener estadísticas de servicios',
                detalle: error.message
            });
        }
    }

    async obtenerEstadisticasIngresos(req, res) {
        try {
            const { fecha_inicio, fecha_fin } = req.query;
            const estadisticas = await DashboardService.obtenerEstadisticasIngresos(fecha_inicio, fecha_fin);

            res.json(estadisticas);
        } catch (error) {
            console.error('❌ Error al obtener estadísticas de ingresos:', error.message);
            res.status(500).json({
                error: 'Error al obtener estadísticas de ingresos',
                detalle: error.message
            });
        }
    }

    async obtenerEstadisticasInventario(req, res) {
        try {
            const estadisticas = await DashboardService.obtenerEstadisticasInventario();
            res.json(estadisticas);
        } catch (error) {
            console.error('❌ Error al obtener estadísticas de inventario:', error.message);
            res.status(500).json({
                error: 'Error al obtener estadísticas de inventario',
                detalle: error.message
            });
        }
    }

    async obtenerCitasPendientes(req, res) {
        try {
            const citas = await DashboardService.obtenerCitasPendientes();
            res.json({
                total: citas.length,
                citas
            });
        } catch (error) {
            console.error('❌ Error al obtener citas pendientes:', error.message);
            res.status(500).json({
                error: 'Error al obtener citas pendientes',
                detalle: error.message
            });
        }
    }

    async obtenerOrdenesActivas(req, res) {
        try {
            const ordenes = await DashboardService.obtenerOrdenesActivas();
            res.json({
                total: ordenes.length,
                ordenes
            });
        } catch (error) {
            console.error('❌ Error al obtener órdenes activas:', error.message);
            res.status(500).json({
                error: 'Error al obtener órdenes activas',
                detalle: error.message
            });
        }
    }

    async obtenerFacturasPendientes(req, res) {
        try {
            const facturas = await DashboardService.obtenerFacturasPendientes();
            res.json({
                total: facturas.length,
                facturas
            });
        } catch (error) {
            console.error('❌ Error al obtener facturas pendientes:', error.message);
            res.status(500).json({
                error: 'Error al obtener facturas pendientes',
                detalle: error.message
            });
        }
    }
}

module.exports = new DashboardController();
