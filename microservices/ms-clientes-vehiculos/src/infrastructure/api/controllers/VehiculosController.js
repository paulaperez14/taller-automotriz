const { validationResult } = require('express-validator');
const VehiculoService = require('../../../application/services/VehiculoService');

class VehiculosController {
    async crear(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const vehiculo = await VehiculoService.crear(req.body);
            res.status(201).json({ message: 'Vehículo creado exitosamente', data: vehiculo });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async listar(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const vehiculos = await VehiculoService.listar(page, limit);
            res.json({ data: vehiculos });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerPorId(req, res) {
        try {
            const vehiculo = await VehiculoService.obtenerPorId(req.params.id);
            if (!vehiculo) {
                return res.status(404).json({ error: 'Vehículo no encontrado' });
            }
            res.json({ data: vehiculo });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerPorPlaca(req, res) {
        try {
            const vehiculo = await VehiculoService.obtenerPorPlaca(req.params.placa);
            if (!vehiculo) {
                return res.status(404).json({ error: 'Vehículo no encontrado' });
            }
            res.json({ data: vehiculo });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async actualizar(req, res) {
        try {
            const vehiculo = await VehiculoService.actualizar(req.params.id, req.body);
            res.json({ message: 'Vehículo actualizado exitosamente', data: vehiculo });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async obtenerHistorial(req, res) {
        try {
            const historial = await VehiculoService.obtenerHistorial(req.params.id);
            res.json({ data: historial });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new VehiculosController();
