const { v4: uuidv4 } = require('uuid');
const VehiculoRepository = require('../../domain/repositories/VehiculoRepository');
const ClienteRepository = require('../../domain/repositories/ClienteRepository');
const { publishEvent } = require('../../infrastructure/messaging/rabbitmq');

class VehiculoService {
    async crear(data) {
        // Verificar que el cliente existe
        const cliente = await ClienteRepository.findById(data.cliente_id);
        if (!cliente) {
            throw new Error('Cliente no encontrado');
        }

        // Verificar si la placa ya existe
        const existe = await VehiculoRepository.findByPlaca(data.placa);
        if (existe) {
            throw new Error('Ya existe un vehículo con esta placa');
        }

        const vehiculo = {
            vehiculo_id: uuidv4(),
            cliente_id: data.cliente_id,
            placa: data.placa.toUpperCase(),
            marca: data.marca,
            modelo: data.modelo,
            anio: data.anio,
            color: data.color || null,
            vin: data.vin || null,
            kilometraje_actual: data.kilometraje_actual || 0
        };

        await VehiculoRepository.create(vehiculo);

        // Publicar evento
        await publishEvent('clients_events', 'vehicle.created', {
            vehiculo_id: vehiculo.vehiculo_id,
            cliente_id: vehiculo.cliente_id,
            placa: vehiculo.placa,
            timestamp: new Date().toISOString()
        });

        return vehiculo;
    }

    async listar(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        return await VehiculoRepository.findAll(offset, limit);
    }

    async obtenerPorId(vehiculo_id) {
        return await VehiculoRepository.findById(vehiculo_id);
    }

    async obtenerPorPlaca(placa) {
        return await VehiculoRepository.findByPlaca(placa.toUpperCase());
    }

    async actualizar(vehiculo_id, data) {
        const vehiculo = await VehiculoRepository.findById(vehiculo_id);
        if (!vehiculo) {
            throw new Error('Vehículo no encontrado');
        }

        await VehiculoRepository.update(vehiculo_id, data);

        // Publicar evento
        await publishEvent('clients_events', 'vehicle.updated', {
            vehiculo_id,
            timestamp: new Date().toISOString()
        });

        return await VehiculoRepository.findById(vehiculo_id);
    }

    async obtenerHistorial(vehiculo_id) {
        const vehiculo = await VehiculoRepository.findById(vehiculo_id);
        if (!vehiculo) {
            throw new Error('Vehículo no encontrado');
        }

        return await VehiculoRepository.getHistorial(vehiculo_id);
    }
}

module.exports = new VehiculoService();
