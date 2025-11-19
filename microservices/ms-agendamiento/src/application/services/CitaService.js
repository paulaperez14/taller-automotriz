const { v4: uuidv4 } = require('uuid');
const CitaRepository = require('../../domain/repositories/CitaRepository');
const { publishEvent } = require('../../infrastructure/messaging/rabbitmq');

class CitaService {
    async crear(data) {
        // Validar que la fecha sea futura
        const fechaCita = new Date(`${data.fecha}T${data.hora}`);
        if (fechaCita < new Date()) {
            throw new Error('No se pueden crear citas en fechas pasadas');
        }

        // Verificar disponibilidad
        const conflicto = await CitaRepository.verificarConflicto(
            data.fecha,
            data.hora,
            data.duracion_estimada || 60,
            data.mecanico_id
        );

        if (conflicto) {
            throw new Error('Ya existe una cita en ese horario');
        }

        const cita = {
            cita_id: uuidv4(),
            cliente_id: data.cliente_id,
            vehiculo_id: data.vehiculo_id,
            mecanico_id: data.mecanico_id || null,
            fecha: data.fecha,
            hora: data.hora,
            duracion_estimada: data.duracion_estimada || 60,
            motivo: data.motivo || null,
            estado: 'PROGRAMADA'
        };

        await CitaRepository.create(cita);

        // Publicar evento
        await publishEvent('appointments_events', 'appointment.created', {
            cita_id: cita.cita_id,
            cliente_id: cita.cliente_id,
            vehiculo_id: cita.vehiculo_id,
            fecha: cita.fecha,
            hora: cita.hora,
            estado: cita.estado,
            timestamp: new Date().toISOString()
        });

        return cita;
    }

    async listar(page = 1, limit = 10, filtros = {}) {
        const offset = (page - 1) * limit;
        return await CitaRepository.findAll(offset, limit, filtros);
    }

    async obtenerPorId(cita_id) {
        return await CitaRepository.findById(cita_id);
    }

    async actualizar(cita_id, data) {
        const cita = await CitaRepository.findById(cita_id);
        if (!cita) {
            throw new Error('Cita no encontrada');
        }

        // Si está cancelada o completada, no se puede modificar
        if (['CANCELADA', 'COMPLETADA'].includes(cita.estado)) {
            throw new Error(`No se puede modificar una cita en estado ${cita.estado}`);
        }

        // Si cambia fecha/hora, verificar disponibilidad
        if (data.fecha || data.hora) {
            const nuevaFecha = data.fecha || cita.fecha;
            const nuevaHora = data.hora || cita.hora;
            const duracion = data.duracion_estimada || cita.duracion_estimada;

            const conflicto = await CitaRepository.verificarConflicto(
                nuevaFecha,
                nuevaHora,
                duracion,
                data.mecanico_id || cita.mecanico_id,
                cita_id // Excluir la cita actual
            );

            if (conflicto) {
                throw new Error('Ya existe una cita en ese horario');
            }
        }

        await CitaRepository.update(cita_id, data);

        // Publicar evento
        await publishEvent('appointments_events', 'appointment.updated', {
            cita_id,
            cambios: Object.keys(data),
            timestamp: new Date().toISOString()
        });

        return await CitaRepository.findById(cita_id);
    }

    async cambiarEstado(cita_id, nuevoEstado) {
        const cita = await CitaRepository.findById(cita_id);
        if (!cita) {
            throw new Error('Cita no encontrada');
        }

        // Validar transiciones de estado
        const transicionesValidas = {
            'PROGRAMADA': ['CONFIRMADA', 'CANCELADA'],
            'CONFIRMADA': ['COMPLETADA', 'CANCELADA'],
            'CANCELADA': [],
            'COMPLETADA': []
        };

        if (!transicionesValidas[cita.estado].includes(nuevoEstado)) {
            throw new Error(`No se puede cambiar de ${cita.estado} a ${nuevoEstado}`);
        }

        await CitaRepository.update(cita_id, { estado: nuevoEstado });

        // Publicar evento específico
        const eventoMap = {
            'CONFIRMADA': 'appointment.confirmed',
            'CANCELADA': 'appointment.cancelled',
            'COMPLETADA': 'appointment.completed'
        };

        await publishEvent('appointments_events', eventoMap[nuevoEstado], {
            cita_id,
            cliente_id: cita.cliente_id,
            vehiculo_id: cita.vehiculo_id,
            estado_anterior: cita.estado,
            estado_nuevo: nuevoEstado,
            timestamp: new Date().toISOString()
        });

        return await CitaRepository.findById(cita_id);
    }

    async obtenerDisponibilidad(fecha) {
        // Horario de atención: 8:00 AM - 6:00 PM
        const horaInicio = 8;
        const horaFin = 18;
        const intervaloMinutos = 30;

        const horariosDisponibles = [];
        const citasDelDia = await CitaRepository.findByFecha(fecha);

        for (let hora = horaInicio; hora < horaFin; hora++) {
            for (let minuto = 0; minuto < 60; minuto += intervaloMinutos) {
                const horaStr = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;

                // Verificar si hay conflicto
                const tieneConflicto = citasDelDia.some(cita => {
                    const [citaHora, citaMinuto] = cita.hora.split(':').map(Number);
                    const citaInicio = citaHora * 60 + citaMinuto;
                    const citaFin = citaInicio + cita.duracion_estimada;
                    const horarioActual = hora * 60 + minuto;

                    return horarioActual >= citaInicio && horarioActual < citaFin;
                });

                horariosDisponibles.push({
                    hora: horaStr,
                    disponible: !tieneConflicto,
                    citasActuales: tieneConflicto ? citasDelDia.filter(c => {
                        const [citaHora, citaMinuto] = c.hora.split(':').map(Number);
                        const citaInicio = citaHora * 60 + citaMinuto;
                        const horarioActual = hora * 60 + minuto;
                        return horarioActual >= citaInicio && horarioActual < (citaInicio + c.duracion_estimada);
                    }).length : 0
                });
            }
        }

        return {
            fecha,
            horarios: horariosDisponibles,
            totalDisponibles: horariosDisponibles.filter(h => h.disponible).length,
            totalOcupados: horariosDisponibles.filter(h => !h.disponible).length
        };
    }

    async obtenerPorRango(fecha_inicio, fecha_fin) {
        return await CitaRepository.findByRango(fecha_inicio, fecha_fin);
    }
}

module.exports = new CitaService();
