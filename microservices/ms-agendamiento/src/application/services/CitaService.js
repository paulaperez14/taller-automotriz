const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const CitaRepository = require('../../domain/repositories/CitaRepository');
const { publishEvent } = require('../../infrastructure/messaging/rabbitmq');

const CLIENTES_SERVICE_URL = process.env.CLIENTES_SERVICE_URL || 'http://ms-clientes-vehiculos:3005';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://ms-autenticacion:3001';

class CitaService {
    async enriquecerCitasConDatos(citas) {
        // Obtener IDs únicos de clientes y vehículos
        const clienteIds = [...new Set(citas.map(c => c.cliente_id).filter(Boolean))];
        const vehiculoIds = [...new Set(citas.map(c => c.vehiculo_id).filter(Boolean))];

        // Hacer llamadas en paralelo para obtener datos
        const [clientesData, vehiculosData] = await Promise.all([
            this.obtenerClientes(clienteIds),
            this.obtenerVehiculos(vehiculoIds)
        ]);

        // Crear mapas para búsqueda rápida
        const clientesMap = new Map(clientesData.map(c => [c.cliente_id, c]));
        const vehiculosMap = new Map(vehiculosData.map(v => [v.vehiculo_id, v]));

        // Enriquecer citas con datos
        return citas.map(cita => {
            const cliente = clientesMap.get(cita.cliente_id);
            const vehiculo = vehiculosMap.get(cita.vehiculo_id);

            return {
                ...cita,
                cliente_nombre: cliente?.nombres,
                cliente_apellido: cliente?.apellidos,
                cliente_telefono: cliente?.telefono,
                vehiculo_placa: vehiculo?.placa,
                vehiculo_marca: vehiculo?.marca,
                vehiculo_modelo: vehiculo?.modelo,
                vehiculo_color: vehiculo?.color
            };
        });
    }

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

    async obtenerVehiculos(vehiculoIds) {
        if (vehiculoIds.length === 0) return [];
        try {
            const requests = vehiculoIds.map(id =>
                axios.get(`${CLIENTES_SERVICE_URL}/api/vehiculos/${id}`).catch(() => null)
            );
            const responses = await Promise.all(requests);
            return responses.filter(r => r && r.data).map(r => r.data.data || r.data);
        } catch (error) {
            console.error('Error obteniendo vehículos:', error.message);
            return [];
        }
    }
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
            data.mecanico_id,
            data.sede_id
        );

        if (conflicto) {
            throw new Error('Ya existe una cita en ese horario');
        }

        const cita = {
            cita_id: uuidv4(),
            cliente_id: data.cliente_id,
            vehiculo_id: data.vehiculo_id,
            mecanico_id: data.mecanico_id || null,
            sede_id: data.sede_id || null,
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
        const citas = await CitaRepository.findAll(offset, limit, filtros);
        return await this.enriquecerCitasConDatos(citas);
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

        // Si cambia estado a CANCELADA, verificar si es futura
        if (data.estado === 'CANCELADA') {
            const fechaHoraCita = new Date(`${cita.fecha}T${cita.hora}`);
            const ahora = new Date();

            if (fechaHoraCita > ahora) {
                console.log(`Liberando horario: ${cita.fecha} ${cita.hora} (cita futura cancelada)`);
            }
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
                data.sede_id || cita.sede_id,
                cita_id // Excluir la cita actual
            );

            if (conflicto) {
                throw new Error('Ya existe una cita en ese horario');
            }
        }

        await CitaRepository.update(cita_id, data);

        // Si se marca como COMPLETADA, publicar evento para crear orden de servicio
        if (data.estado === 'COMPLETADA') {
            const citaActualizada = await CitaRepository.findById(cita_id);
            await publishEvent('appointments_events', 'appointment.completed', {
                cita_id: citaActualizada.cita_id,
                cliente_id: citaActualizada.cliente_id,
                vehiculo_id: citaActualizada.vehiculo_id,
                mecanico_id: citaActualizada.mecanico_id,
                fecha: citaActualizada.fecha,
                hora: citaActualizada.hora,
                motivo: citaActualizada.motivo,
                servicio_id: citaActualizada.servicio_id,
                nombre_servicio: citaActualizada.nombre_servicio,
                precio_servicio: citaActualizada.precio_servicio,
                crear_orden_servicio: true,
                timestamp: new Date().toISOString()
            });
        }

        // Publicar evento
        await publishEvent('appointments_events', 'appointment.updated', {
            cita_id,
            cambios: Object.keys(data),
            es_futura: data.estado === 'CANCELADA' ? new Date(`${cita.fecha}T${cita.hora}`) > new Date() : null,
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

        // Si se confirma la cita, crear credenciales para el cliente
        let credencialesCreadas = null;
        if (nuevoEstado === 'CONFIRMADA') {
            try {
                credencialesCreadas = await this.crearCredencialesCliente(cita.cliente_id);
            } catch (error) {
                console.error('Error creando credenciales:', error.message);
                // No interrumpir el proceso de confirmación si falla la creación de credenciales
            }
        }

        // Si se cancela una cita, verificar si es futura para liberar horario
        if (nuevoEstado === 'CANCELADA') {
            const fechaHoraCita = new Date(`${cita.fecha}T${cita.hora}`);
            const ahora = new Date();

            if (fechaHoraCita > ahora) {
                // La cita es futura, se libera el horario
                console.log(`Liberando horario: ${cita.fecha} ${cita.hora} (cita futura cancelada)`);
            }
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
            fecha: cita.fecha,
            hora: cita.hora,
            es_futura: new Date(`${cita.fecha}T${cita.hora}`) > new Date(),
            timestamp: new Date().toISOString()
        });

        const citaActualizada = await CitaRepository.findById(cita_id);

        return {
            cita: citaActualizada,
            credenciales: credencialesCreadas
        };
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

    async crearCredencialesCliente(cliente_id) {
        try {
            // Obtener información del cliente
            const response = await axios.get(`${CLIENTES_SERVICE_URL}/api/clientes/${cliente_id}`);
            const cliente = response.data.data || response.data;

            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // Generar username y password basados en los datos del cliente
            const primerNombre = cliente.nombres.toLowerCase().split(' ')[0];
            const ultimos4 = cliente.identificacion.slice(-4);
            const username = `${primerNombre}${ultimos4}`;
            const password = `${ultimos4}${cliente.nombres.charAt(0).toLowerCase()}${cliente.apellidos.charAt(0).toLowerCase()}`;
            const email = cliente.email || `${username}@taller.com`;

            // Intentar crear el usuario en el servicio de autenticación
            try {
                await axios.post(`${AUTH_SERVICE_URL}/api/register`, {
                    username,
                    password,
                    email,
                    rol: 'CLIENTE'
                });

                console.log(`✅ Credenciales creadas para cliente ${cliente.nombres} ${cliente.apellidos}:`);
                console.log(`   Usuario: ${username}`);
                console.log(`   Contraseña: ${password}`);
                console.log(`   Email: ${email}`);

                // Publicar evento para notificar al cliente (puede usarse para enviar email/SMS)
                await publishEvent('appointments_events', 'client.credentials.created', {
                    cliente_id,
                    username,
                    email,
                    password_temporal: password,
                    cliente_nombre: `${cliente.nombres} ${cliente.apellidos}`,
                    timestamp: new Date().toISOString()
                });

                return { username, password, email };
            } catch (authError) {
                // Si el usuario ya existe, no es un error crítico
                if (authError.response?.data?.error?.includes('ya existe')) {
                    console.log(`ℹ️  El cliente ${cliente.nombres} ${cliente.apellidos} ya tiene credenciales`);
                    return null;
                }
                throw authError;
            }
        } catch (error) {
            console.error('Error en crearCredencialesCliente:', error.message);
            throw error;
        }
    }
}

module.exports = new CitaService();
