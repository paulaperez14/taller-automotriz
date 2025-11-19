const { validationResult } = require('express-validator');
const ProveedorService = require('../../../application/services/ProveedorService');

class ProveedoresController {
    async crear(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const proveedor = await ProveedorService.crear(req.body);
            res.status(201).json({
                message: 'Proveedor creado exitosamente',
                data: proveedor
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async listar(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const proveedores = await ProveedorService.listar(page, limit);
            res.json({ data: proveedores });
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

            const proveedor = await ProveedorService.obtenerPorId(req.params.id);
            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }
            res.json({ data: proveedor });
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

            const proveedor = await ProveedorService.actualizar(req.params.id, req.body);
            res.json({
                message: 'Proveedor actualizado exitosamente',
                data: proveedor
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

            await ProveedorService.eliminar(req.params.id);
            res.json({ message: 'Proveedor eliminado exitosamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async obtenerRepuestos(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const repuestos = await ProveedorService.obtenerRepuestos(req.params.id);
            res.json({ data: repuestos });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ProveedoresController();
