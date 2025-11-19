const { validationResult } = require('express-validator');
const RepuestoService = require('../../../application/services/RepuestoService');

class RepuestosController {
    async crear(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const repuesto = await RepuestoService.crear(req.body);
            res.status(201).json({
                message: 'Repuesto creado exitosamente',
                data: repuesto
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async listar(req, res) {
        try {
            const { page = 1, limit = 10, categoria, proveedor_id, bajo_stock } = req.query;
            const filtros = { categoria, proveedor_id, bajo_stock: bajo_stock === 'true' };

            const repuestos = await RepuestoService.listar(page, limit, filtros);
            res.json({ data: repuestos });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerPorId(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const repuesto = await RepuestoService.obtenerPorId(req.params.id);
            if (!repuesto) {
                return res.status(404).json({ error: 'Repuesto no encontrado' });
            }
            res.json({ data: repuesto });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async actualizar(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const repuesto = await RepuestoService.actualizar(req.params.id, req.body);
            res.json({
                message: 'Repuesto actualizado exitosamente',
                data: repuesto
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async eliminar(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            await RepuestoService.eliminar(req.params.id);
            res.json({ message: 'Repuesto eliminado exitosamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async ajustarStock(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            await RepuestoService.ajustarStock(
                req.params.id,
                req.body.tipo,
                req.body.cantidad,
                req.body.motivo,
                req.body.orden_id
            );
            res.json({ message: 'Stock ajustado exitosamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async obtenerMovimientos(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const movimientos = await RepuestoService.obtenerMovimientos(req.params.id);
            res.json({ data: movimientos });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerBajoStock(req, res) {
        try {
            const repuestos = await RepuestoService.obtenerBajoStock();
            res.json({ data: repuestos });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async buscar(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const repuestos = await RepuestoService.buscar(req.params.termino);
            res.json({ data: repuestos });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new RepuestosController();
