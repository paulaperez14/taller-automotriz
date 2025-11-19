const { v4: uuidv4 } = require('uuid');
const OrdenRepository = require('../../domain/repositories/OrdenRepository');
const ServicioRepository = require('../../domain/repositories/ServicioRepository');
const { publishEvent } = require('../../infrastructure/messaging/rabbitmq');

class OrdenService {
    async crear(data) {
        const orden = {
            orden_id: uuidv4(),
            cliente_id: data.cliente_id,
            vehiculo_id: data.vehiculo_id,
            mecanico_id: data.mecanico_id,
            diagnostico: data.diagnostico,
            estado: 'PENDIENTE',
            fecha_creacion: new Date().toISOString().split('T')[0],
            fecha_estimada_finalizacion: data.fecha_estimada || null
        };

        // Crear orden
        await OrdenRepository.create(orden);        // Agregar servicios
        for (const servicio of data.servicios) {
            const servicioData = {
                servicio_id: uuidv4(),
                orden_id: orden.orden_id,
                descripcion: servicio.descripcion,
                costo_mano_obra: servicio.costo_mano_obra,
                tiempo_estimado: servicio.tiempo_estimado
            };
            await ServicioRepository.create(servicioData);

            // Si el servicio incluye repuestos
            if (servicio.repuestos && servicio.repuestos.length > 0) {
                for (const repuesto of servicio.repuestos) {
                    await ServicioRepository.agregarRepuesto(servicioData.servicio_id, {
                        repuesto_id: repuesto.repuesto_id,
                        cantidad: repuesto.cantidad,
                        precio_unitario: repuesto.precio_unitario
                    });
                }
            }
        }

        // Publicar evento
        await publishEvent('repair_events', 'order.created', {
            orden_id: orden.orden_id,
            cliente_id: orden.cliente_id,
            vehiculo_id: orden.vehiculo_id,
            mecanico_id: orden.mecanico_id,
            estado: orden.estado,
            timestamp: new Date().toISOString()
        });

        return await this.obtenerPorId(orden.orden_id);
    }

    async listar(page = 1, limit = 10, filtros = {}) {
        const offset = (page - 1) * limit;
        return await OrdenRepository.findAll(offset, limit, filtros);
    }

    async obtenerPorId(orden_id) {
        const orden = await OrdenRepository.findById(orden_id);
        if (!orden) return null;

        // Obtener servicios con sus repuestos
        const servicios = await ServicioRepository.findByOrdenId(orden_id);

        for (const servicio of servicios) {
            servicio.repuestos = await ServicioRepository.getRepuestosByServicioId(servicio.servicio_id);
        }

        orden.servicios = servicios;
        return orden;
    }

    async actualizarEstado(orden_id, nuevoEstado) {
        const orden = await OrdenRepository.findById(orden_id);
        if (!orden) {
            throw new Error('Orden no encontrada');
        }

        // Validar transiciones de estado
        const transicionesValidas = {
            'PENDIENTE': ['EN_PROCESO', 'CANCELADO'],
            'EN_PROCESO': ['FINALIZADO', 'CANCELADO'],
            'FINALIZADO': ['ENTREGADO'],
            'ENTREGADO': [],
            'CANCELADO': []
        };

        if (!transicionesValidas[orden.estado].includes(nuevoEstado)) {
            throw new Error(`No se puede cambiar de ${orden.estado} a ${nuevoEstado}`);
        }

        await OrdenRepository.update(orden_id, { estado: nuevoEstado });

        // Nota: La tabla usa updated_at automático, no necesitamos actualizar fechas manualmente

        // Publicar evento
        const eventoMap = {
            'EN_PROCESO': 'order.started',
            'FINALIZADO': 'order.completed',
            'ENTREGADO': 'order.delivered',
            'CANCELADO': 'order.cancelled'
        }; await publishEvent('repair_events', eventoMap[nuevoEstado], {
            orden_id,
            estado_anterior: orden.estado,
            estado_nuevo: nuevoEstado,
            timestamp: new Date().toISOString()
        });

        return await this.obtenerPorId(orden_id);
    }

    async agregarServicio(orden_id, servicioData) {
        const orden = await OrdenRepository.findById(orden_id);
        if (!orden) {
            throw new Error('Orden no encontrada');
        }

        if (['FINALIZADO', 'ENTREGADO', 'CANCELADO'].includes(orden.estado)) {
            throw new Error(`No se pueden agregar servicios a una orden en estado ${orden.estado}`);
        }

        const servicio = {
            servicio_id: uuidv4(),
            orden_id,
            descripcion: servicioData.descripcion,
            costo_mano_obra: servicioData.costo_mano_obra,
            tiempo_estimado: servicioData.tiempo_estimado
        };

        await ServicioRepository.create(servicio);

        await publishEvent('repair_events', 'service.added', {
            orden_id,
            servicio_id: servicio.servicio_id,
            timestamp: new Date().toISOString()
        });

        return servicio;
    }

    async agregarRepuesto(orden_id, servicio_id, repuestoData) {
        const orden = await OrdenRepository.findById(orden_id);
        if (!orden) {
            throw new Error('Orden no encontrada');
        }

        const servicio = await ServicioRepository.findById(servicio_id);
        if (!servicio || servicio.orden_id !== orden_id) {
            throw new Error('Servicio no encontrado en esta orden');
        }

        if (['FINALIZADO', 'ENTREGADO', 'CANCELADO'].includes(orden.estado)) {
            throw new Error(`No se pueden agregar repuestos a una orden en estado ${orden.estado}`);
        }

        await ServicioRepository.agregarRepuesto(servicio_id, repuestoData);

        // Publicar evento para decrementar inventario
        await publishEvent('repair_events', 'part.used', {
            orden_id,
            servicio_id,
            repuesto_id: repuestoData.repuesto_id,
            cantidad: repuestoData.cantidad,
            timestamp: new Date().toISOString()
        });

        return repuestoData;
    }

    async actualizarDiagnostico(orden_id, diagnostico) {
        const orden = await OrdenRepository.findById(orden_id);
        if (!orden) {
            throw new Error('Orden no encontrada');
        }

        await OrdenRepository.update(orden_id, { diagnostico });

        await publishEvent('repair_events', 'diagnosis.updated', {
            orden_id,
            timestamp: new Date().toISOString()
        });
    }

    async asignarMecanico(orden_id, mecanico_id) {
        const orden = await OrdenRepository.findById(orden_id);
        if (!orden) {
            throw new Error('Orden no encontrada');
        }

        await OrdenRepository.update(orden_id, { mecanico_id });

        await publishEvent('repair_events', 'mechanic.assigned', {
            orden_id,
            mecanico_anterior: orden.mecanico_id,
            mecanico_nuevo: mecanico_id,
            timestamp: new Date().toISOString()
        });
    }

    async obtenerPorMecanico(mecanico_id) {
        return await OrdenRepository.findByMecanico(mecanico_id);
    }

    async obtenerHistorialVehiculo(vehiculo_id) {
        return await OrdenRepository.findByVehiculo(vehiculo_id);
    }

    async calcularCostoTotal(orden_id) {
        const orden = await this.obtenerPorId(orden_id);
        if (!orden) {
            throw new Error('Orden no encontrada');
        }

        let costoManoObra = 0;
        let costoRepuestos = 0;

        for (const servicio of orden.servicios) {
            costoManoObra += parseFloat(servicio.costo_mano_obra || 0);

            if (servicio.repuestos) {
                for (const repuesto of servicio.repuestos) {
                    costoRepuestos += parseFloat(repuesto.precio_unitario) * parseInt(repuesto.cantidad);
                }
            }
        }

        const subtotal = costoManoObra + costoRepuestos;
        const iva = subtotal * 0.19; // IVA 19%
        const total = subtotal + iva;

        return {
            orden_id,
            costo_mano_obra: costoManoObra.toFixed(2),
            costo_repuestos: costoRepuestos.toFixed(2),
            subtotal: subtotal.toFixed(2),
            iva: iva.toFixed(2),
            total: total.toFixed(2)
        };
    }

    async finalizarOrden(orden_id) {
        await this.actualizarEstado(orden_id, 'FINALIZADO');

        // Calcular costo total y publicar evento para facturación
        const costo = await this.calcularCostoTotal(orden_id);

        await publishEvent('repair_events', 'order.ready_for_billing', {
            orden_id,
            costo: costo,
            timestamp: new Date().toISOString()
        });
    }

    async entregarOrden(orden_id) {
        await this.actualizarEstado(orden_id, 'ENTREGADO');
    }

    async cancelarOrden(orden_id, motivo = null) {
        const orden = await OrdenRepository.findById(orden_id);
        if (!orden) {
            throw new Error('Orden no encontrada');
        }

        if (['FINALIZADO', 'ENTREGADO'].includes(orden.estado)) {
            throw new Error(`No se puede cancelar una orden en estado ${orden.estado}`);
        }

        await OrdenRepository.update(orden_id, {
            estado: 'CANCELADO',
            motivo_cancelacion: motivo
        });

        await publishEvent('repair_events', 'order.cancelled', {
            orden_id,
            motivo,
            timestamp: new Date().toISOString()
        });
    }
}

module.exports = new OrdenService();
