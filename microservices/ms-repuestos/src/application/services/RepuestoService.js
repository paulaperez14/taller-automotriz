const { v4: uuidv4 } = require('uuid');
const RepuestoRepository = require('../../domain/repositories/RepuestoRepository');
const MovimientoRepository = require('../../domain/repositories/MovimientoRepository');
const { publishEvent } = require('../../infrastructure/messaging/rabbitmq');

class RepuestoService {
    async crear(data) {
        // Verificar código duplicado
        const existente = await RepuestoRepository.findByCodigo(data.codigo);
        if (existente) {
            throw new Error('Ya existe un repuesto con ese código');
        }

        const repuesto = {
            repuesto_id: uuidv4(),
            nombre: data.nombre,
            codigo: data.codigo,
            proveedor_id: data.proveedor_id,
            precio_compra: data.precio_compra,
            precio_venta: data.precio_venta,
            stock_actual: data.stock_actual || 0,
            stock_minimo: data.stock_minimo || 0,
            categoria: data.categoria || null,
            ubicacion: data.ubicacion || null
        };

        await RepuestoRepository.create(repuesto);

        // Si hay stock inicial, registrar movimiento
        if (repuesto.stock_actual > 0) {
            await this._registrarMovimiento(
                repuesto.repuesto_id,
                'ENTRADA',
                repuesto.stock_actual,
                'Stock inicial',
                null,
                0,
                repuesto.stock_actual
            );
        } await publishEvent('parts_events', 'part.created', {
            repuesto_id: repuesto.repuesto_id,
            codigo: repuesto.codigo,
            nombre: repuesto.nombre,
            timestamp: new Date().toISOString()
        });

        return repuesto;
    }

    async listar(page = 1, limit = 10, filtros = {}) {
        const offset = (page - 1) * limit;
        return await RepuestoRepository.findAll(offset, limit, filtros);
    }

    async obtenerPorId(repuesto_id) {
        return await RepuestoRepository.findById(repuesto_id);
    }

    async actualizar(repuesto_id, data) {
        const repuesto = await RepuestoRepository.findById(repuesto_id);
        if (!repuesto) {
            throw new Error('Repuesto no encontrado');
        }

        await RepuestoRepository.update(repuesto_id, data);

        await publishEvent('parts_events', 'part.updated', {
            repuesto_id,
            cambios: Object.keys(data),
            timestamp: new Date().toISOString()
        });

        return await RepuestoRepository.findById(repuesto_id);
    }

    async eliminar(repuesto_id) {
        const repuesto = await RepuestoRepository.findById(repuesto_id);
        if (!repuesto) {
            throw new Error('Repuesto no encontrado');
        }

        if (repuesto.cantidad_disponible > 0) {
            throw new Error('No se puede eliminar un repuesto con stock disponible');
        } await RepuestoRepository.delete(repuesto_id);

        await publishEvent('parts_events', 'part.deleted', {
            repuesto_id,
            timestamp: new Date().toISOString()
        });
    }

    async ajustarStock(repuesto_id, tipo, cantidad, motivo, orden_id = null) {
        const repuesto = await RepuestoRepository.findById(repuesto_id);
        if (!repuesto) {
            throw new Error('Repuesto no encontrado');
        }

        let nuevoStock;
        if (tipo === 'ENTRADA') {
            nuevoStock = parseInt(repuesto.stock_actual) + parseInt(cantidad);
        } else if (tipo === 'SALIDA') {
            nuevoStock = parseInt(repuesto.stock_actual) - parseInt(cantidad);
            if (nuevoStock < 0) {
                throw new Error('Stock insuficiente');
            }
        } else {
            throw new Error('Tipo de movimiento inválido');
        }

        // Actualizar stock
        await RepuestoRepository.update(repuesto_id, { stock_actual: nuevoStock });

        // Registrar movimiento
        await this._registrarMovimiento(repuesto_id, tipo, cantidad, motivo, orden_id);

        // Publicar evento
        await publishEvent('parts_events', `stock.${tipo.toLowerCase()}`, {
            repuesto_id,
            codigo: repuesto.codigo,
            cantidad,
            stock_anterior: repuesto.stock_actual,
            stock_nuevo: nuevoStock,
            orden_id,
            timestamp: new Date().toISOString()
        });

        // Verificar alerta de stock bajo
        if (nuevoStock <= repuesto.stock_minimo) {
            await publishEvent('parts_events', 'stock.low_alert', {
                repuesto_id,
                codigo: repuesto.codigo,
                nombre: repuesto.nombre,
                stock_actual: nuevoStock,
                stock_minimo: repuesto.stock_minimo,
                timestamp: new Date().toISOString()
            });
        }

        return { stock_anterior: repuesto.cantidad_disponible, stock_nuevo: nuevoStock };
    } async _registrarMovimiento(repuesto_id, tipo, cantidad, motivo, orden_id = null) {
        const movimiento = {
            movimiento_id: uuidv4(),
            repuesto_id,
            tipo,
            cantidad,
            motivo,
            orden_id,
            fecha: new Date()
        };

        await MovimientoRepository.create(movimiento);
    }

    async obtenerMovimientos(repuesto_id) {
        return await MovimientoRepository.findByRepuestoId(repuesto_id);
    }

    async obtenerBajoStock() {
        return await RepuestoRepository.findBajoStock();
    }

    async buscar(termino) {
        return await RepuestoRepository.search(termino);
    }
}

module.exports = new RepuestoService();
