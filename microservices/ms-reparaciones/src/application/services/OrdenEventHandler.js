const { v4: uuidv4 } = require('uuid');
const OrdenRepository = require('../../domain/repositories/OrdenRepository');
const ServicioRepository = require('../../domain/repositories/ServicioRepository');
const { publishEvent } = require('../../infrastructure/messaging/rabbitmq');

class OrdenEventHandler {
    /**
     * Manejar evento de cita completada para crear orden de servicio
     */
    async handleCitaCompletada(event) {
        try {
            const {
                cita_id,
                cliente_id,
                vehiculo_id,
                mecanico_id,
                motivo,
                fecha,
                servicio_id,
                nombre_servicio,
                precio_servicio
            } = event;

            // Verificar si ya existe una orden para esta cita
            const ordenesExistentes = await OrdenRepository.findAll(0, 100, { cliente_id });
            const ordenExiste = ordenesExistentes.find(o => o.cita_id === cita_id);

            if (ordenExiste) {
                console.log(`⚠️ Ya existe una orden para la cita ${cita_id}`);
                return ordenExiste;
            }

            // Crear la orden de servicio
            const orden = {
                orden_id: uuidv4(),
                cita_id,
                cliente_id,
                vehiculo_id,
                mecanico_id: mecanico_id || null,
                fecha_creacion: fecha ? fecha.split('T')[0] : new Date().toISOString().split('T')[0],
                fecha_estimada_finalizacion: null,
                estado: 'PENDIENTE',
                diagnostico: motivo || 'Servicio general',
                gravedad_diagnostico: null,
                recomendaciones: null,
                fecha_diagnostico: null
            };

            await OrdenRepository.create(orden);

            // Crear servicio inicial basado en el servicio del catálogo
            const servicioInicial = {
                servicio_id: uuidv4(),
                orden_id: orden.orden_id,
                tipo: 'MANTENIMIENTO_PREVENTIVO', // Tipo por defecto
                nombre: nombre_servicio || 'Servicio general',
                descripcion: motivo || nombre_servicio || 'Servicio solicitado desde cita',
                costo: precio_servicio || 50000, // Precio por defecto si no viene
                estado: 'PENDIENTE',
                horas_estimadas: 1.0 // 1 hora por defecto
            };

            await ServicioRepository.create(servicioInicial);

            console.log(`✅ Orden de servicio creada: ${orden.orden_id} para cita ${cita_id}`);
            console.log(`   Servicio inicial: ${servicioInicial.nombre} - $${servicioInicial.costo}`);

            // Publicar evento de orden creada
            await publishEvent('repair_events', 'order.created', {
                orden_id: orden.orden_id,
                cliente_id: orden.cliente_id,
                vehiculo_id: orden.vehiculo_id,
                cita_id,
                estado: orden.estado,
                timestamp: new Date().toISOString()
            });

            return orden;
        } catch (error) {
            console.error('❌ Error creando orden desde cita:', error);
            throw error;
        }
    }
}

module.exports = new OrdenEventHandler();
