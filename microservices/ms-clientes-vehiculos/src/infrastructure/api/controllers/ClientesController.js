const { validationResult } = require('express-validator');
const ClienteService = require('../../../application/services/ClienteService');

class ClientesController {
    async crear(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const cliente = await ClienteService.crear(req.body);
            res.status(201).json({ message: 'Cliente creado exitosamente', data: cliente });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async listar(req, res) {
        try {
            const { page = 1, limit = 10, search } = req.query;
            const clientes = await ClienteService.listar(page, limit, search);
            res.json({ data: clientes });
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

            const cliente = await ClienteService.obtenerPorId(req.params.id);
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }
            res.json({ data: cliente });
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

            const cliente = await ClienteService.actualizar(req.params.id, req.body);
            res.json({ message: 'Cliente actualizado exitosamente', data: cliente });
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

            await ClienteService.eliminar(req.params.id);
            res.json({ message: 'Cliente eliminado exitosamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async obtenerVehiculos(req, res) {
        try {
            const vehiculos = await ClienteService.obtenerVehiculos(req.params.id);
            res.json({ data: vehiculos });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ClientesController();
