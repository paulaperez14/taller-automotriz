const { validationResult } = require('express-validator');
const CatalogoServicioService = require('../../../application/services/CatalogoServicioService');

class CatalogoServiciosController {
    async listar(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { categoria, activo, busqueda } = req.query;
            const filtros = { categoria, activo, busqueda };

            const servicios = await CatalogoServicioService.listar(filtros);
            res.json({ data: servicios });
        } catch (error) {
            console.error('Error listando servicios:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerPorId(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const servicio = await CatalogoServicioService.obtenerPorId(req.params.id);
            res.json({ data: servicio });
        } catch (error) {
            console.error('Error obteniendo servicio:', error);
            res.status(404).json({ error: error.message });
        }
    }

    async obtenerPorCategoria(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const servicios = await CatalogoServicioService.obtenerPorCategoria(req.params.categoria);
            res.json({ data: servicios });
        } catch (error) {
            console.error('Error obteniendo servicios por categoría:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async crear(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const servicio = await CatalogoServicioService.crear(req.body);
            res.status(201).json({
                message: 'Servicio creado exitosamente',
                data: servicio
            });
        } catch (error) {
            console.error('Error creando servicio:', error);
            res.status(400).json({ error: error.message });
        }
    }

    async actualizar(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const servicio = await CatalogoServicioService.actualizar(req.params.id, req.body);
            res.json({
                message: 'Servicio actualizado exitosamente',
                data: servicio
            });
        } catch (error) {
            console.error('Error actualizando servicio:', error);
            res.status(400).json({ error: error.message });
        }
    }

    async eliminar(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            await CatalogoServicioService.eliminar(req.params.id);
            res.json({ message: 'Servicio eliminado exitosamente' });
        } catch (error) {
            console.error('Error eliminando servicio:', error);
            res.status(400).json({ error: error.message });
        }
    }

    async toggleActivo(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const servicio = await CatalogoServicioService.toggleActivo(req.params.id);
            res.json({
                message: 'Estado del servicio actualizado',
                data: servicio
            });
        } catch (error) {
            console.error('Error cambiando estado del servicio:', error);
            res.status(400).json({ error: error.message });
        }
    }

    async obtenerCategorias(req, res) {
        try {
            const categorias = await CatalogoServicioService.obtenerCategorias();
            res.json({ data: categorias });
        } catch (error) {
            console.error('Error obteniendo categorías:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new CatalogoServiciosController();
