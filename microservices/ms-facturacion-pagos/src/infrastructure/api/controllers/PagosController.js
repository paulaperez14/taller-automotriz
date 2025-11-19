const { validationResult } = require('express-validator');
const PagoService = require('../../../application/services/PagoService');

class PagosController {
    async registrar(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { factura_pago_id, monto, metodo_pago, referencia, comprobante } = req.body;

            const pago = await PagoService.registrar({
                factura_pago_id,
                monto,
                metodo_pago,
                referencia,
                comprobante
            });

            res.status(201).json({
                mensaje: 'Pago registrado exitosamente',
                pago
            });
        } catch (error) {
            console.error('❌ Error al registrar pago:', error.message);
            res.status(400).json({
                error: 'Error al registrar el pago',
                detalle: error.message
            });
        }
    }

    async listarPorFactura(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { facturaId } = req.params;
            const pagos = await PagoService.listarPorFactura(facturaId);

            res.json({
                factura_pago_id: facturaId,
                total_pagos: pagos.length,
                pagos
            });
        } catch (error) {
            console.error('❌ Error al listar pagos:', error.message);
            res.status(500).json({
                error: 'Error al listar pagos',
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
            const pago = await PagoService.obtenerPorId(id);

            if (!pago) {
                return res.status(404).json({ error: 'Pago no encontrado' });
            }

            res.json(pago);
        } catch (error) {
            console.error('❌ Error al obtener pago:', error.message);
            res.status(500).json({
                error: 'Error al obtener el pago',
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

            const pago = await PagoService.actualizarEstado(id, estado);

            res.json({
                mensaje: `Pago ${estado.toLowerCase()} exitosamente`,
                pago
            });
        } catch (error) {
            console.error('❌ Error al actualizar estado del pago:', error.message);
            res.status(500).json({
                error: 'Error al actualizar estado del pago',
                detalle: error.message
            });
        }
    }
}

module.exports = new PagosController();
