const { v4: uuidv4 } = require('uuid');
const ProveedorRepository = require('../../domain/repositories/ProveedorRepository');
const RepuestoRepository = require('../../domain/repositories/RepuestoRepository');
const { publishEvent } = require('../../infrastructure/messaging/rabbitmq');

class ProveedorService {
    async crear(data) {
        // Verificar nombre duplicado
        const existente = await ProveedorRepository.findByNombre(data.nombre);
        if (existente) {
            throw new Error('Ya existe un proveedor con ese nombre');
        }

        const proveedor = {
            proveedor_id: uuidv4(),
            nombre: data.nombre,
            telefono: data.telefono || null,
            email: data.email || null,
            direccion: data.direccion || null,
            tiempo_entrega_dias: data.tiempo_entrega_dias || 3
        };

        await ProveedorRepository.create(proveedor);

        await publishEvent('parts_events', 'supplier.created', {
            proveedor_id: proveedor.proveedor_id,
            nombre: proveedor.nombre,
            timestamp: new Date().toISOString()
        });

        return proveedor;
    } async listar(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        return await ProveedorRepository.findAll(offset, limit);
    }

    async obtenerPorId(proveedor_id) {
        return await ProveedorRepository.findById(proveedor_id);
    }

    async actualizar(proveedor_id, data) {
        const proveedor = await ProveedorRepository.findById(proveedor_id);
        if (!proveedor) {
            throw new Error('Proveedor no encontrado');
        }

        await ProveedorRepository.update(proveedor_id, data);

        await publishEvent('parts_events', 'supplier.updated', {
            proveedor_id,
            cambios: Object.keys(data),
            timestamp: new Date().toISOString()
        });

        return await ProveedorRepository.findById(proveedor_id);
    }

    async eliminar(proveedor_id) {
        const proveedor = await ProveedorRepository.findById(proveedor_id);
        if (!proveedor) {
            throw new Error('Proveedor no encontrado');
        }

        // Verificar si tiene repuestos asociados
        const repuestos = await RepuestoRepository.findByProveedorId(proveedor_id);
        if (repuestos.length > 0) {
            throw new Error('No se puede eliminar un proveedor con repuestos asociados');
        }

        await ProveedorRepository.delete(proveedor_id);

        await publishEvent('parts_events', 'supplier.deleted', {
            proveedor_id,
            timestamp: new Date().toISOString()
        });
    }

    async obtenerRepuestos(proveedor_id) {
        const proveedor = await ProveedorRepository.findById(proveedor_id);
        if (!proveedor) {
            throw new Error('Proveedor no encontrado');
        }

        return await RepuestoRepository.findByProveedorId(proveedor_id);
    }
}

module.exports = new ProveedorService();
