const { validationResult } = require('express-validator');
const CitaService = require('../../../application/services/CitaService');

class CitasController {
    async crear(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const cita = await CitaService.crear(req.body);
            res.status(201).json({
                message: 'Cita creada exitosamente',
                data: cita
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async listar(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { page = 1, limit = 10, fecha, estado, cliente_id, mecanico_id } = req.query;
            const filtros = { fecha, estado, cliente_id, mecanico_id };

            const citas = await CitaService.listar(page, limit, filtros);
            res.json({ data: citas });
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

            const cita = await CitaService.obtenerPorId(req.params.id);
            if (!cita) {
                return res.status(404).json({ error: 'Cita no encontrada' });
            }
            res.json({ data: cita });
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

            const cita = await CitaService.actualizar(req.params.id, req.body);
            res.json({
                message: 'Cita actualizada exitosamente',
                data: cita
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async cancelar(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            await CitaService.cambiarEstado(req.params.id, 'CANCELADA');
            res.json({ message: 'Cita cancelada exitosamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async confirmar(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            await CitaService.cambiarEstado(req.params.id, 'CONFIRMADA');
            res.json({ message: 'Cita confirmada exitosamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async completar(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            await CitaService.cambiarEstado(req.params.id, 'COMPLETADA');
            res.json({ message: 'Cita completada exitosamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async obtenerDisponibilidad(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const disponibilidad = await CitaService.obtenerDisponibilidad(req.params.fecha);
            res.json({ data: disponibilidad });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerPorRango(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { fecha_inicio, fecha_fin } = req.query;
            const citas = await CitaService.obtenerPorRango(fecha_inicio, fecha_fin);
            res.json({ data: citas });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new CitasController();
