const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const FacturaRepository = require('../../domain/repositories/FacturaRepository');
const { publishEvent } = require('../../infrastructure/messaging/rabbitmq');

const CLIENTES_SERVICE_URL = process.env.CLIENTES_SERVICE_URL || 'http://ms-clientes-vehiculos:3005';
const REPARACIONES_SERVICE_URL = process.env.REPARACIONES_SERVICE_URL || 'http://ms-reparaciones:3003';

class FacturaService {
    /**
     * Enriquecer facturas con datos de clientes
     */
    async enriquecerFacturas(facturas) {
        if (!facturas || facturas.length === 0) return [];

        // Obtener IDs únicos de clientes
        const clienteIds = [...new Set(facturas.map(f => f.cliente_id).filter(Boolean))];

        if (clienteIds.length === 0) return facturas;

        // Obtener datos de clientes
        const clientesData = await this.obtenerClientes(clienteIds);
        const clientesMap = new Map(clientesData.map(c => [c.cliente_id, c]));

        // Enriquecer facturas
        return facturas.map(factura => {
            const cliente = clientesMap.get(factura.cliente_id);
            return {
                ...factura,
                cliente_nombre: cliente ? `${cliente.nombres} ${cliente.apellidos}` : null,
                cliente_telefono: cliente?.telefono
            };
        });
    }

    /**
     * Obtener datos de clientes
     */
    async obtenerClientes(clienteIds) {
        if (clienteIds.length === 0) return [];

        try {
            const requests = clienteIds.map(id =>
                axios.get(`${CLIENTES_SERVICE_URL}/api/clientes/${id}`).catch(() => null)
            );
            const responses = await Promise.all(requests);
            return responses.filter(r => r && r.data).map(r => r.data.data || r.data);
        } catch (error) {
            console.error('Error obteniendo clientes:', error.message);
            return [];
        }
    }
    /**
     * Crear una nueva factura a partir de una orden de servicio
     */
    async crear(ordenServicioId, clienteId, items, metodo_pago = null, notas = null) {
        // Validar que no exista ya una factura para esta orden
        const facturaExistente = await FacturaRepository.findByOrdenServicio(ordenServicioId);
        if (facturaExistente) {
            throw new Error(`Ya existe una factura para esta orden (${facturaExistente.numero_factura})`);
        }

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
            metodo_pago,
            notas,
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
            metodo_pago,
            estado: 'PENDIENTE'
        });

        console.log(`📄 Factura ${numeroFactura} creada: $${total.toFixed(2)} (${metodo_pago || 'Sin método'})`);

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

        // Enriquecer con datos de clientes
        const facturasEnriquecidas = await this.enriquecerFacturas(facturas);

        return {
            facturas: facturasEnriquecidas,
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

        // Enriquecer con datos del cliente
        const facturasEnriquecidas = await this.enriquecerFacturas([factura]);
        const facturaEnriquecida = facturasEnriquecidas[0] || factura;

        // Obtener detalles de la orden con sus servicios
        if (facturaEnriquecida.orden_servicio_id) {
            try {
                const ordenResponse = await axios.get(`${REPARACIONES_SERVICE_URL}/api/ordenes/${facturaEnriquecida.orden_servicio_id}`);
                const orden = ordenResponse.data.data || ordenResponse.data;

                // Agregar los servicios y detalles del vehículo a la factura
                facturaEnriquecida.servicios = orden.servicios || [];
                facturaEnriquecida.vehiculo_placa = orden.vehiculo_placa;
                facturaEnriquecida.vehiculo_marca = orden.vehiculo_marca;
                facturaEnriquecida.vehiculo_modelo = orden.vehiculo_modelo;
            } catch (error) {
                console.error('Error obteniendo detalles de la orden:', error.message);
                facturaEnriquecida.servicios = [];
            }
        }

        return facturaEnriquecida;
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
