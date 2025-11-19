const { validationResult } = require('express-validator');
const ReporteService = require('../../../application/services/ReporteService');

class ReportesController {
    async generar(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { titulo, tipo, fecha_inicio, fecha_fin, descripcion } = req.body;
            const reporte = await ReporteService.generar(titulo, tipo, fecha_inicio, fecha_fin, descripcion);

            res.status(201).json({
                mensaje: 'Reporte generado exitosamente',
                reporte
            });
        } catch (error) {
            console.error('❌ Error al generar reporte:', error.message);
            res.status(500).json({
                error: 'Error al generar el reporte',
                detalle: error.message
            });
        }
    }

    async listar(req, res) {
        try {
            const { tipo, page = 1, limit = 10 } = req.query;
            const resultado = await ReporteService.listar(tipo, parseInt(page), parseInt(limit));

            res.json(resultado);
        } catch (error) {
            console.error('❌ Error al listar reportes:', error.message);
            res.status(500).json({
                error: 'Error al listar reportes',
                detalle: error.message
            });
        }
    }

    async obtenerPorId(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { id } = req.params;
            const reporte = await ReporteService.obtenerPorId(id);

            if (!reporte) {
                return res.status(404).json({ error: 'Reporte no encontrado' });
            }

            res.json(reporte);
        } catch (error) {
            console.error('❌ Error al obtener reporte:', error.message);
            res.status(500).json({
                error: 'Error al obtener el reporte',
                detalle: error.message
            });
        }
    }

    async obtenerServiciosPopulares(req, res) {
        try {
            const servicios = await ReporteService.obtenerServiciosPopulares();
            res.json({
                total: servicios.length,
                servicios
            });
        } catch (error) {
            console.error('❌ Error al obtener servicios populares:', error.message);
            res.status(500).json({
                error: 'Error al obtener servicios populares',
                detalle: error.message
            });
        }
    }

    async obtenerRendimientoMecanicos(req, res) {
        try {
            const mecanicos = await ReporteService.obtenerRendimientoMecanicos();
            res.json({
                total: mecanicos.length,
                mecanicos
            });
        } catch (error) {
            console.error('❌ Error al obtener rendimiento de mecánicos:', error.message);
            res.status(500).json({
                error: 'Error al obtener rendimiento de mecánicos',
                detalle: error.message
            });
        }
    }
}

module.exports = new ReportesController();
