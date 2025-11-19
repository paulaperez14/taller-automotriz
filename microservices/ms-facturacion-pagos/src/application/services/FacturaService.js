const { v4: uuidv4 } = require('uuid');
const FacturaRepository = require('../../domain/repositories/FacturaRepository');
const { publishEvent } = require('../../infrastructure/messaging/rabbitmq');

class FacturaService {
    /**
     * Crear una nueva factura a partir de una orden de servicio
     */
    async crear(ordenServicioId, clienteId, items) {
        // Validar que hay items
        if (!items || items.length === 0) {
            throw new Error('La factura debe tener al menos un item');
        }

        // Calcular totales
        const subtotal = items.reduce((acc, item) => {
            return acc + (item.cantidad * item.precio_unitario);
        }, 0);

        const impuestos = subtotal * 0.19; // IVA 19%
        const total = subtotal + impuestos;

        // Generar número de factura único
        const numeroFactura = this._generarNumeroFactura();

        // Crear factura
        const facturaId = uuidv4();
        const fecha = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const datosFactura = {
            factura_pago_id: facturaId,
            factura_id: facturaId, // Mismo ID para referencia
            orden_servicio_id: ordenServicioId,
            cliente_id: clienteId,
            numero_factura: numeroFactura,
            fecha,
            subtotal: parseFloat(subtotal.toFixed(2)),
            impuestos: parseFloat(impuestos.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            estado: 'PENDIENTE'
        };

        const factura = await FacturaRepository.create(datosFactura);

        // Publicar evento
        await publishEvent('billing_events', 'invoice.created', {
            factura_pago_id: facturaId,
            orden_servicio_id: ordenServicioId,
            cliente_id: clienteId,
            numero_factura: numeroFactura,
            total,
            estado: 'PENDIENTE'
        });

        console.log(`📄 Factura ${numeroFactura} creada: $${total.toFixed(2)}`);

        return {
            ...factura,
            items // Incluir items en la respuesta
        };
    }

    /**
     * Listar facturas con filtros y paginación
     */
    async listar(page = 1, limit = 10, filtros = {}) {
        const offset = (page - 1) * limit;

        const { facturas, total } = await FacturaRepository.findAll(limit, offset, filtros);

        return {
            facturas,
            paginacion: {
                total,
                pagina_actual: page,
                total_paginas: Math.ceil(total / limit),
                registros_por_pagina: limit
            }
        };
    }

    /**
     * Obtener factura por ID
     */
    async obtenerPorId(facturaId) {
        const factura = await FacturaRepository.findById(facturaId);

        if (!factura) {
            throw new Error('Factura no encontrada');
        }

        return factura;
    }

    /**
     * Obtener facturas de un cliente
     */
    async obtenerPorCliente(clienteId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        const { facturas, total } = await FacturaRepository.findByCliente(clienteId, limit, offset);

        return {
            cliente_id: clienteId,
            facturas,
            paginacion: {
                total,
                pagina_actual: page,
                total_paginas: Math.ceil(total / limit),
                registros_por_pagina: limit
            }
        };
    }

    /**
     * Actualizar estado de la factura
     */
    async actualizarEstado(facturaId, nuevoEstado) {
        const factura = await FacturaRepository.findById(facturaId);

        if (!factura) {
            throw new Error('Factura no encontrada');
        }

        // Validar transiciones de estado
        if (factura.estado === 'ANULADA') {
            throw new Error('No se puede modificar una factura anulada');
        }

        if (nuevoEstado === 'PAGADA' && factura.estado === 'ANULADA') {
            throw new Error('No se puede marcar como pagada una factura anulada');
        }

        const facturaActualizada = await FacturaRepository.updateEstado(facturaId, nuevoEstado);

        // Publicar evento
        await publishEvent('billing_events', 'invoice.status_changed', {
            factura_pago_id: facturaId,
            numero_factura: factura.numero_factura,
            estado_anterior: factura.estado,
            estado_nuevo: nuevoEstado
        });

        console.log(`📄 Factura ${factura.numero_factura} → ${nuevoEstado}`);

        return facturaActualizada;
    }

    /**
     * Obtener facturas pendientes
     */
    async obtenerPendientes() {
        return await FacturaRepository.findByEstado('PENDIENTE');
    }

    /**
     * Generar número de factura único
     */
    _generarNumeroFactura() {
        const fecha = new Date();
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const timestamp = Date.now().toString().slice(-6);

        return `F-${año}${mes}-${timestamp}`;
    }
}

module.exports = new FacturaService();
