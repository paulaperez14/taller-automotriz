const { v4: uuidv4 } = require('uuid');
const ClienteRepository = require('../../domain/repositories/ClienteRepository');
const { publishEvent } = require('../../infrastructure/messaging/rabbitmq');

class ClienteService {
    async crear(data) {
        // Verificar si ya existe
        const existe = await ClienteRepository.findByIdentificacion(data.identificacion);
        if (existe) {
            throw new Error('Ya existe un cliente con esta identificación');
        }

        const cliente = {
            cliente_id: uuidv4(),
            tipo_identificacion: data.tipo_identificacion,
            identificacion: data.identificacion,
            nombres: data.nombres,
            apellidos: data.apellidos,
            telefono: data.telefono,
            email: data.email || null,
            direccion: data.direccion || null,
            ciudad: data.ciudad || null
        };

        await ClienteRepository.create(cliente);

        // Publicar evento
        await publishEvent('clients_events', 'client.created', {
            cliente_id: cliente.cliente_id,
            nombres: cliente.nombres,
            apellidos: cliente.apellidos,
            timestamp: new Date().toISOString()
        });

        return cliente;
    }

    async listar(page = 1, limit = 10, search = '') {
        const offset = (page - 1) * limit;
        return await ClienteRepository.findAll(offset, limit, search);
    }

    async obtenerPorId(cliente_id) {
        return await ClienteRepository.findById(cliente_id);
    }

    async actualizar(cliente_id, data) {
        const cliente = await ClienteRepository.findById(cliente_id);
        if (!cliente) {
            throw new Error('Cliente no encontrado');
        }

        await ClienteRepository.update(cliente_id, data);

        // Publicar evento
        await publishEvent('clients_events', 'client.updated', {
            cliente_id,
            timestamp: new Date().toISOString()
        });

        return await ClienteRepository.findById(cliente_id);
    }

    async eliminar(cliente_id) {
        const cliente = await ClienteRepository.findById(cliente_id);
        if (!cliente) {
            throw new Error('Cliente no encontrado');
        }

        await ClienteRepository.delete(cliente_id);

        // Publicar evento
        await publishEvent('clients_events', 'client.deleted', {
            cliente_id,
            timestamp: new Date().toISOString()
        });
    }

    async obtenerVehiculos(cliente_id) {
        return await ClienteRepository.getVehiculos(cliente_id);
    }
}

module.exports = new ClienteService();
