const { validationResult } = require('express-validator');
const FacturaService = require('../../../application/services/FacturaService');

class FacturasController {
    async crear(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { orden_servicio_id, cliente_id, items } = req.body;
            const factura = await FacturaService.crear(orden_servicio_id, cliente_id, items);

            res.status(201).json({
                mensaje: 'Factura creada exitosamente',
                factura
            });
        } catch (error) {
            console.error('❌ Error al crear factura:', error.message);
            res.status(500).json({
                error: 'Error al crear la factura',
                detalle: error.message
            });
        }
    }

    async listar(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { page = 1, limit = 10, estado, fecha_inicio, fecha_fin } = req.query;
            const filtros = { estado, fecha_inicio, fecha_fin };

            const resultado = await FacturaService.listar(
                parseInt(page),
                parseInt(limit),
                filtros
            );

            res.json(resultado);
        } catch (error) {
            console.error('❌ Error al listar facturas:', error.message);
            res.status(500).json({
                error: 'Error al listar facturas',
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
            const factura = await FacturaService.obtenerPorId(id);

            if (!factura) {
                return res.status(404).json({ error: 'Factura no encontrada' });
            }

            res.json(factura);
        } catch (error) {
            console.error('❌ Error al obtener factura:', error.message);
            res.status(500).json({
                error: 'Error al obtener la factura',
                detalle: error.message
            });
        }
    }

    async obtenerPorCliente(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { clienteId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const resultado = await FacturaService.obtenerPorCliente(
                clienteId,
                parseInt(page),
                parseInt(limit)
            );

            res.json(resultado);
        } catch (error) {
            console.error('❌ Error al obtener facturas del cliente:', error.message);
            res.status(500).json({
                error: 'Error al obtener facturas del cliente',
                detalle: error.message
            });
        }
    }

    async actualizarEstado(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { id } = req.params;
            const { estado } = req.body;

            const factura = await FacturaService.actualizarEstado(id, estado);

            res.json({
                mensaje: `Factura ${estado.toLowerCase()} exitosamente`,
                factura
            });
        } catch (error) {
            console.error('❌ Error al actualizar estado:', error.message);
            res.status(500).json({
                error: 'Error al actualizar estado de la factura',
                detalle: error.message
            });
        }
    }

    async obtenerPendientes(req, res) {
        try {
            const facturas = await FacturaService.obtenerPendientes();
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

module.exports = new FacturasController();
