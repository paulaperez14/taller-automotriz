const { v4: uuidv4 } = require('uuid');
const CatalogoServicioRepository = require('../../domain/repositories/CatalogoServicioRepository');

class CatalogoServicioService {
    async listar(filtros = {}) {
        return await CatalogoServicioRepository.findAll(filtros);
    }

    async obtenerPorId(servicio_id) {
        const servicio = await CatalogoServicioRepository.findById(servicio_id);
        if (!servicio) {
            throw new Error('Servicio no encontrado');
        }
        return servicio;
    }

    async obtenerPorCategoria(categoria) {
        return await CatalogoServicioRepository.findByCategoria(categoria);
    }

    async crear(servicioData) {
        // Validar que el código no exista
        const existente = await CatalogoServicioRepository.findByCodigo(servicioData.codigo);
        if (existente) {
            throw new Error(`Ya existe un servicio con el código ${servicioData.codigo}`);
        }

        const servicio = {
            servicio_id: uuidv4(),
            codigo: servicioData.codigo,
            nombre: servicioData.nombre,
            descripcion: servicioData.descripcion || null,
            categoria: servicioData.categoria,
            precio_base: servicioData.precio_base,
            duracion_estimada: servicioData.duracion_estimada || 60,
            activo: servicioData.activo !== undefined ? servicioData.activo : true
        };

        return await CatalogoServicioRepository.create(servicio);
    }

    async actualizar(servicio_id, data) {
        const servicio = await CatalogoServicioRepository.findById(servicio_id);
        if (!servicio) {
            throw new Error('Servicio no encontrado');
        }

        // Validar código si se está actualizando
        if (data.codigo && data.codigo !== servicio.codigo) {
            const existente = await CatalogoServicioRepository.findByCodigo(data.codigo);
            if (existente) {
                throw new Error(`Ya existe un servicio con el código ${data.codigo}`);
            }
        }

        return await CatalogoServicioRepository.update(servicio_id, data);
    }

    async eliminar(servicio_id) {
        const servicio = await CatalogoServicioRepository.findById(servicio_id);
        if (!servicio) {
            throw new Error('Servicio no encontrado');
        }

        await CatalogoServicioRepository.delete(servicio_id);
        return { mensaje: 'Servicio eliminado correctamente' };
    }

    async toggleActivo(servicio_id) {
        const servicio = await CatalogoServicioRepository.findById(servicio_id);
        if (!servicio) {
            throw new Error('Servicio no encontrado');
        }

        return await CatalogoServicioRepository.toggleActivo(servicio_id);
    }

    async obtenerCategorias() {
        return await CatalogoServicioRepository.getCategorias();
    }
}

module.exports = new CatalogoServicioService();
