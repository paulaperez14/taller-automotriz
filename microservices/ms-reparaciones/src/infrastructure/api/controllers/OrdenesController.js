const { validationResult } = require('express-validator');
const OrdenService = require('../../../application/services/OrdenService');

class OrdenesController {
    async crear(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const orden = await OrdenService.crear(req.body);
            res.status(201).json({
                message: 'Orden de servicio creada exitosamente',
                data: orden
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

            const { page = 1, limit = 10, estado, mecanico_id, cliente_id, fecha_inicio, fecha_fin } = req.query;
            const filtros = { estado, mecanico_id, cliente_id, fecha_inicio, fecha_fin };

            const ordenes = await OrdenService.listar(page, limit, filtros);
            res.json({ data: ordenes });
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

            const orden = await OrdenService.obtenerPorId(req.params.id);
            if (!orden) {
                return res.status(404).json({ error: 'Orden no encontrada' });
            }
            res.json({ data: orden });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async actualizarEstado(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            await OrdenService.actualizarEstado(req.params.id, req.body.estado);
            res.json({ message: 'Estado actualizado exitosamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async agregarServicio(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const servicio = await OrdenService.agregarServicio(req.params.id, req.body);
            res.status(201).json({
                message: 'Servicio agregado exitosamente',
                data: servicio
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async eliminarServicio(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            await OrdenService.eliminarServicio(req.params.id, req.params.servicioId);
            res.json({ message: 'Servicio eliminado exitosamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async actualizarEstadoServicio(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            await OrdenService.actualizarEstadoServicio(
                req.params.id,
                req.params.servicioId,
                req.body.estado
            );

            // Retornar la orden actualizada con todos sus servicios
            const orden = await OrdenService.obtenerPorId(req.params.id);
            res.json({
                message: 'Estado del servicio actualizado exitosamente',
                data: orden
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async agregarRepuesto(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            await OrdenService.agregarRepuesto(
                req.params.ordenId,
                req.params.servicioId,
                req.body
            );
            res.status(201).json({ message: 'Repuesto agregado exitosamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async actualizarDiagnostico(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            await OrdenService.actualizarDiagnostico(req.params.id, req.body.diagnostico);
            res.json({ message: 'Diagnóstico actualizado exitosamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async asignarMecanico(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            await OrdenService.asignarMecanico(req.params.id, req.body.mecanico_id);
            res.json({ message: 'Mecánico asignado exitosamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async obtenerPorMecanico(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const ordenes = await OrdenService.obtenerPorMecanico(req.params.mecanico_id);
            res.json({ data: ordenes });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerHistorialVehiculo(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const historial = await OrdenService.obtenerHistorialVehiculo(req.params.vehiculo_id);
            res.json({ data: historial });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async calcularCostoTotal(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const costo = await OrdenService.calcularCostoTotal(req.params.id);
            res.json({ data: costo });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async finalizarOrden(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            await OrdenService.finalizarOrden(req.params.id);
            res.json({ message: 'Orden finalizada exitosamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async entregarOrden(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            await OrdenService.entregarOrden(req.params.id);
            res.json({ message: 'Orden entregada exitosamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async cancelarOrden(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            await OrdenService.cancelarOrden(req.params.id, req.body.motivo_cancelacion);
            res.json({ message: 'Orden cancelada exitosamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new OrdenesController();
