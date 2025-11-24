import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { clienteService, vehiculoService } from '../services';
import { getMarcasPorTipo, getModelosPorMarca } from '../data/vehiculosData';
import './AgendarCita.css';

const AgendarCita = () => {
    const { user } = useAuth();
    const [paso, setPaso] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
    const [clienteAutenticado, setClienteAutenticado] = useState(null);
    const [vehiculosCliente, setVehiculosCliente] = useState([]);
    const [marcasDisponibles, setMarcasDisponibles] = useState([]);
    const [modelosDisponibles, setModelosDisponibles] = useState([]);
    const [vehiculoSeleccionadoId, setVehiculoSeleccionadoId] = useState(null);

    // Datos del cliente
    const [datosCliente, setDatosCliente] = useState({
        tipo_identificacion: 'CEDULA',
        identificacion: '',
        nombres: '',
        apellidos: '',
        email: '',
        telefono: ''
    });

    // Datos del vehículo
    const [datosVehiculo, setDatosVehiculo] = useState({
        placa: '',
        marca: '',
        modelo: '',
        anio: '',
        color: '',
        tipo_vehiculo: 'AUTOMOVIL',
        numero_motor: '',
        numero_chasis: ''
    });

    // Sedes disponibles
    const sedes = [
        { id: 1, nombre: 'Sede Norte', direccion: 'Calle 100 # 15-30, Bogotá', telefono: '(601) 234-5678' },
        { id: 2, nombre: 'Sede Sur', direccion: 'Carrera 30 # 45-20, Bogotá', telefono: '(601) 234-5679' },
        { id: 3, nombre: 'Sede Occidente', direccion: 'Avenida 68 # 25-10, Bogotá', telefono: '(601) 234-5680' },
        { id: 4, nombre: 'Sede Oriente', direccion: 'Calle 45 # 70-15, Bogotá', telefono: '(601) 234-5681' }
    ];

    // Datos de la cita
    const [datosCita, setDatosCita] = useState({
        sede_id: '',
        fecha: '',
        hora: '',
        servicio_id: '',
        tipo_servicio: '',
        descripcion_problema: ''
    });

    const [horariosDisponibles, setHorariosDisponibles] = useState([]);
    const [horariosOcupados, setHorariosOcupados] = useState([]);

    // Cargar datos del cliente autenticado
    useEffect(() => {
        if (user && user.rol === 'CLIENTE' && user.usuario_id) {
            cargarDatosCliente();
        }
    }, [user]);

    // Cargar servicios disponibles del catálogo
    useEffect(() => {
        cargarServiciosDisponibles();
        // Inicializar marcas disponibles según tipo de vehículo por defecto (AUTOMOVIL)
        setMarcasDisponibles(getMarcasPorTipo('AUTOMOVIL'));
    }, []);

    const cargarDatosCliente = async () => {
        try {
            console.log('Cargando datos del cliente autenticado:', user.email);

            // Buscar cliente por email ya que no todos tienen usuario_id vinculado
            const clientesResponse = await clienteService.getAll();
            const todosClientes = clientesResponse.data.data || [];
            const cliente = todosClientes.find(c => c.email === user.email);

            if (!cliente) {
                console.log('Cliente no encontrado con email:', user.email);
                return;
            }

            console.log('Datos del cliente:', cliente);

            setClienteAutenticado(cliente);

            // Pre-llenar el formulario con los datos del cliente
            setDatosCliente({
                tipo_identificacion: cliente.tipo_identificacion || 'CEDULA',
                identificacion: cliente.identificacion || '',
                nombres: cliente.nombres || '',
                apellidos: cliente.apellidos || '',
                email: cliente.email || '',
                telefono: cliente.telefono || ''
            });

            // Cargar vehículos del cliente
            try {
                const vehiculosResponse = await vehiculoService.getAll();
                const todosVehiculos = vehiculosResponse.data.data || [];
                const vehiculos = todosVehiculos.filter(v => v.cliente_id === cliente.cliente_id);
                console.log('Vehículos del cliente:', vehiculos);
                setVehiculosCliente(vehiculos);
                // Inicializar campos vacíos y marcas por defecto
                setVehiculoSeleccionadoId(null);
                setDatosVehiculo({
                    placa: '',
                    marca: '',
                    modelo: '',
                    anio: '',
                    color: '',
                    tipo_vehiculo: 'AUTOMOVIL',
                    numero_motor: '',
                    numero_chasis: ''
                });
                setMarcasDisponibles(getMarcasPorTipo('AUTOMOVIL'));
                setModelosDisponibles([]);
            } catch (vehiculosError) {
                console.error('Error cargando vehículos:', vehiculosError);
                setVehiculosCliente([]);
            }
        } catch (error) {
            console.error('Error cargando datos del cliente:', error);
        }
    };

    const cargarServiciosDisponibles = async () => {
        try {
            console.log('Cargando servicios del catálogo...');
            const response = await axios.get('http://localhost:3000/api/servicios-publico?activo=true');
            console.log('Respuesta de servicios:', response.data);
            const servicios = response.data.data || [];
            console.log('Servicios cargados:', servicios);
            setServiciosDisponibles(servicios);

            // Si hay servicios, establecer el primero como seleccionado por defecto
            if (servicios.length > 0) {
                setDatosCita(prev => ({
                    ...prev,
                    servicio_id: servicios[0].servicio_id,
                    tipo_servicio: servicios[0].categoria
                }));
            }
        } catch (error) {
            console.error('Error cargando servicios:', error);
            console.error('Error details:', error.response);
            setServiciosDisponibles([]);
        }
    };

    // Horarios disponibles (Lunes a Viernes: 8am-5pm, Sábado y Domingo: 8am-4pm)
    const generarHorariosDisponibles = (fecha) => {
        if (!fecha) return [];

        // Parsear la fecha correctamente en zona horaria local
        const [año, mes, dia] = fecha.split('-');
        const fechaObj = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
        const diaSemana = fechaObj.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

        const horarios = [];
        const horaInicio = 8;
        let horaFin;

        if (diaSemana === 0 || diaSemana === 6) {
            // Sábado (6) y Domingo (0): 8am-4pm (hasta 16:00)
            horaFin = 16;
        } else {
            // Lunes (1) a Viernes (5): 8am-5pm (hasta 17:00)
            horaFin = 17;
        }

        for (let hora = horaInicio; hora < horaFin; hora++) {
            horarios.push(`${hora.toString().padStart(2, '0')}:00`);
            horarios.push(`${hora.toString().padStart(2, '0')}:30`);
        }
        // Agregar la hora final solo en punto
        horarios.push(`${horaFin.toString().padStart(2, '0')}:00`);

        return horarios;
    };

    // Cargar horarios ocupados cuando cambia la fecha o sede
    useEffect(() => {
        if (datosCita.fecha && datosCita.sede_id) {
            cargarHorariosOcupados(datosCita.fecha, datosCita.sede_id);
        } else {
            setHorariosDisponibles([]);
            setHorariosOcupados([]);
        }
    }, [datosCita.fecha, datosCita.sede_id]);

    const cargarHorariosOcupados = async (fecha, sede_id) => {
        try {
            console.log('Cargando horarios ocupados para fecha:', fecha, 'sede:', sede_id);
            // Filtrar por fecha Y sede para obtener solo los horarios ocupados en esa sede específica
            const response = await axios.get(`http://localhost:3000/api/citas-publico?fecha=${fecha}&sede_id=${sede_id}&limit=100`);
            const citas = response.data.data || [];
            console.log('Citas encontradas para esta sede:', citas);

            // Normalizar horas a formato HH:mm (sin segundos)
            const ocupados = citas.map(cita => {
                // Si la hora viene como "14:30:00", convertir a "14:30"
                if (cita.hora && cita.hora.length > 5) {
                    return cita.hora.substring(0, 5);
                }
                return cita.hora;
            });

            console.log('Horarios ocupados (normalizados):', ocupados);
            setHorariosOcupados(ocupados);            // Generar horarios disponibles después de cargar los ocupados
            const todosLosHorarios = generarHorariosDisponibles(fecha);
            const horariosLibres = todosLosHorarios.filter(hora => !ocupados.includes(hora));
            console.log('Todos los horarios:', todosLosHorarios);
            console.log('Horarios libres:', horariosLibres);
            setHorariosDisponibles(horariosLibres);
        } catch (error) {
            console.error('Error cargando horarios ocupados:', error);
            setHorariosOcupados([]);
            // Si hay error, mostrar todos los horarios
            setHorariosDisponibles(generarHorariosDisponibles(fecha));
        }
    };

    // Agrupar servicios por categoría
    const agruparServiciosPorCategoria = () => {
        const categorias = {
            MANTENIMIENTO: { nombre: 'Mantenimientos', icono: '🔧', servicios: [] },
            DIAGNOSTICO: { nombre: 'Diagnóstico', icono: '🔍', servicios: [] },
            REPARACION: { nombre: 'Reparaciones', icono: '⚙️', servicios: [] },
            ELECTRICO: { nombre: 'Sistema Eléctrico', icono: '⚡', servicios: [] },
            PINTURA: { nombre: 'Pintura y Carrocería', icono: '🎨', servicios: [] },
            OTROS: { nombre: 'Otros Servicios', icono: '🔨', servicios: [] }
        };

        serviciosDisponibles.forEach(servicio => {
            if (categorias[servicio.categoria]) {
                categorias[servicio.categoria].servicios.push(servicio);
            }
        });

        return Object.entries(categorias)
            .filter(([_, data]) => data.servicios.length > 0)
            .map(([key, data]) => ({ categoria: key, ...data }));
    };

    const handleClienteChange = (e) => {
        setDatosCliente({ ...datosCliente, [e.target.name]: e.target.value });
    };

    const handleVehiculoChange = (e) => {
        const { name, value } = e.target;

        if (name === 'tipo_vehiculo') {
            // Cuando cambia el tipo de vehículo, actualizar marcas disponibles y resetear marca/modelo
            setMarcasDisponibles(getMarcasPorTipo(value));
            setModelosDisponibles([]);
            setDatosVehiculo({
                ...datosVehiculo,
                tipo_vehiculo: value,
                marca: '',
                modelo: ''
            });
        } else if (name === 'marca') {
            // Cuando cambia la marca, actualizar modelos disponibles y resetear modelo
            setModelosDisponibles(getModelosPorMarca(value));
            setDatosVehiculo({
                ...datosVehiculo,
                marca: value,
                modelo: ''
            });
        } else {
            setDatosVehiculo({ ...datosVehiculo, [name]: value });
        }
    };

    const handleCitaChange = (e) => {
        const { name, value } = e.target;

        if (name === 'servicio_id') {
            const servicioSeleccionado = serviciosDisponibles.find(s => s.servicio_id === value);
            setDatosCita({
                ...datosCita,
                servicio_id: value,
                tipo_servicio: servicioSeleccionado ? servicioSeleccionado.categoria : ''
            });
        } else if (name === 'fecha') {
            // Solo actualizar la fecha, el useEffect cargará los horarios
            setDatosCita({ ...datosCita, fecha: value, hora: '' });
        } else {
            setDatosCita({ ...datosCita, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Variables para rastrear si creamos nuevos registros
        let nuevoClienteId = null;
        let nuevoVehiculoId = null;

        try {
            // Usar axios directamente sin interceptores para evitar redirección
            const apiUrl = 'http://localhost:3000/api';

            // PASO 0: Validaciones previas antes de crear cualquier registro

            // Validar que el servicio existe y está activo
            const servicioSeleccionado = serviciosDisponibles.find(s => s.servicio_id === datosCita.servicio_id);
            if (!servicioSeleccionado) {
                throw new Error('El servicio seleccionado no está disponible');
            }

            // Validar que la sede existe
            const sedeSeleccionada = sedes.find(s => s.id === parseInt(datosCita.sede_id));
            if (!sedeSeleccionada) {
                throw new Error('La sede seleccionada no es válida');
            }

            // Validar que la fecha y hora son válidas
            if (!datosCita.fecha || !datosCita.hora) {
                throw new Error('Debe seleccionar una fecha y hora para la cita');
            }

            let clienteId;
            let vehiculoId;

            // PASO 1: Verificar si el cliente ya existe por identificación
            try {
                const buscarResponse = await axios.get(`${apiUrl}/clientes-publico/identificacion/${datosCliente.identificacion}`);
                const clienteExistente = buscarResponse.data.data;

                if (clienteExistente) {
                    // Cliente ya existe, usar su ID
                    clienteId = clienteExistente.cliente_id;
                    console.log('Cliente existente encontrado:', clienteId);
                }
            } catch (error) {
                if (error.response?.status !== 404) {
                    throw error;
                }
                // Cliente no existe (404), continuamos sin asignar clienteId
            }

            // PASO 2: Verificar si el vehículo ya existe por placa
            try {
                const buscarVehiculoResponse = await axios.get(`${apiUrl}/vehiculos-publico/placa/${datosVehiculo.placa}`);
                const vehiculoExistente = buscarVehiculoResponse.data.data;

                if (vehiculoExistente) {
                    // Vehículo ya existe, usar su ID
                    vehiculoId = vehiculoExistente.vehiculo_id;
                    console.log('Vehículo existente encontrado:', vehiculoId);
                }
            } catch (error) {
                if (error.response?.status !== 404) {
                    throw error;
                }
                // Vehículo no existe (404), continuamos sin asignar vehiculoId
            }

            // PASO 3: Crear cita primero para validar disponibilidad
            // Preparar los datos de la cita
            const nombreServicio = servicioSeleccionado.nombre;
            const citaData = {
                fecha: datosCita.fecha,
                hora: datosCita.hora,
                sede_id: parseInt(datosCita.sede_id),
                servicio_id: servicioSeleccionado.servicio_id,
                nombre_servicio: nombreServicio,
                precio_servicio: servicioSeleccionado.precio_base,
                motivo: `${nombreServicio}: ${datosCita.descripcion_problema}`,
                duracion_estimada: servicioSeleccionado.duracion_estimada
            };

            // Si no existe el cliente, crearlo SOLO si la validación de la cita pasa
            if (!clienteId) {
                const clienteResponse = await axios.post(`${apiUrl}/clientes-publico`, datosCliente);
                clienteId = clienteResponse.data.data.cliente_id;
                nuevoClienteId = clienteId; // Marcar que creamos este cliente
                console.log('Nuevo cliente creado:', clienteId);
            }

            // Asignar cliente_id a los datos de la cita
            citaData.cliente_id = clienteId;

            // Si no existe el vehículo, crearlo
            if (!vehiculoId) {
                const vehiculoResponse = await axios.post(`${apiUrl}/vehiculos-publico`, {
                    ...datosVehiculo,
                    cliente_id: clienteId
                });
                vehiculoId = vehiculoResponse.data.data.vehiculo_id;
                nuevoVehiculoId = vehiculoId; // Marcar que creamos este vehículo
                console.log('Nuevo vehículo creado:', vehiculoId);
            }

            // Asignar vehiculo_id a los datos de la cita
            citaData.vehiculo_id = vehiculoId;

            // PASO 4: Crear la cita - si esto falla, el catch limpiará los registros creados
            await axios.post(`${apiUrl}/citas-publico`, citaData);

            // Crear fecha en zona horaria local para evitar desfases
            const [año, mes, dia] = datosCita.fecha.split('-');
            const fechaLocal = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));

            // Mostrar información de la reserva confirmada
            setSuccess({
                mensaje: '¡Reserva agendada exitosamente!',
                esClienteNuevo: !!nuevoClienteId,
                detalles: {
                    cliente: `${datosCliente.nombres} ${datosCliente.apellidos}`,
                    identificacion: datosCliente.identificacion,
                    vehiculo: `${datosVehiculo.marca} ${datosVehiculo.modelo} - ${datosVehiculo.placa}`,
                    sede: sedeSeleccionada,
                    fecha: fechaLocal.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                    hora: datosCita.hora,
                    servicio: nombreServicio,
                    servicioNombre: servicioSeleccionado.descripcion,
                    precioMin: servicioSeleccionado.precio_base,
                    precioMax: servicioSeleccionado.precio_base,
                    telefono: datosCliente.telefono,
                    email: datosCliente.email
                }
            });

            // Limpiar las variables de rastreo ya que todo salió bien
            nuevoClienteId = null;
            nuevoVehiculoId = null;

        } catch (err) {
            console.error('Error completo:', err);
            console.error('Response:', err.response);
            console.error('Response data:', err.response?.data);

            // Si creamos registros y algo falló, intentar eliminarlos (rollback manual)
            const apiUrl = 'http://localhost:3000/api';
            try {
                if (nuevoVehiculoId) {
                    console.log('Eliminando vehículo creado:', nuevoVehiculoId);
                    await axios.delete(`${apiUrl}/vehiculos-publico/${nuevoVehiculoId}`);
                }
                if (nuevoClienteId) {
                    console.log('Eliminando cliente creado:', nuevoClienteId);
                    await axios.delete(`${apiUrl}/clientes-publico/${nuevoClienteId}`);
                }
            } catch (rollbackError) {
                console.error('Error en rollback:', rollbackError);
            }

            setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Error al agendar la cita. Por favor intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const siguientePaso = () => {
        if (paso < 3) setPaso(paso + 1);
    };

    const pasoAnterior = () => {
        if (paso > 1) setPaso(paso - 1);
    };

    const nuevaCita = () => {
        setPaso(1);
        setDatosCliente({
            tipo_identificacion: 'CEDULA',
            identificacion: '',
            nombres: '',
            apellidos: '',
            email: '',
            telefono: ''
        });
        setDatosVehiculo({
            placa: '',
            marca: '',
            modelo: '',
            anio: '',
            color: '',
            tipo_vehiculo: 'AUTOMOVIL',
            numero_motor: '',
            numero_chasis: ''
        });
        setDatosCita({
            sede_id: '',
            fecha: '',
            hora: '',
            servicio_id: serviciosDisponibles.length > 0 ? serviciosDisponibles[0].servicio_id : '',
            tipo_servicio: serviciosDisponibles.length > 0 ? serviciosDisponibles[0].categoria : '',
            descripcion_problema: ''
        });
        setSuccess('');
        setHorariosDisponibles([]);
    };

    if (success) {
        return (
            <div className="agendar-cita-container">
                <div className="confirmacion-card">
                    <div className="confirmacion-header">
                        <a href="http://localhost:3009" className="logo-link">
                            <div className="logo-container">
                                <span className="logo-icon">🚗</span>
                                <span className="logo-text">Taller Automotriz</span>
                            </div>
                        </a>
                    </div>

                    <div className="success-icon">✓</div>
                    <h1>¡Reserva Confirmada!</h1>
                    <p className="success-subtitle">{success.mensaje}</p>

                    <div className="confirmacion-detalles">
                        <h3>📋 Detalles de su Reservación</h3>

                        <div className="detalle-seccion">
                            <h4>👤 Información del Cliente</h4>
                            <div className="detalle-item">
                                <span className="label">Nombre:</span>
                                <span className="value">{success.detalles.cliente}</span>
                            </div>
                            <div className="detalle-item">
                                <span className="label">Identificación:</span>
                                <span className="value">{success.detalles.identificacion}</span>
                            </div>
                            <div className="detalle-item">
                                <span className="label">Teléfono:</span>
                                <span className="value">{success.detalles.telefono}</span>
                            </div>
                            <div className="detalle-item">
                                <span className="label">Email:</span>
                                <span className="value">{success.detalles.email}</span>
                            </div>
                        </div>

                        <div className="detalle-seccion">
                            <h4>🚗 Vehículo</h4>
                            <div className="detalle-item">
                                <span className="value">{success.detalles.vehiculo}</span>
                            </div>
                        </div>

                        <div className="detalle-seccion destacado">
                            <h4>📍 Sede del Taller</h4>
                            <div className="sede-info">
                                <div className="sede-nombre">{success.detalles.sede.nombre}</div>
                                <div className="sede-direccion">{success.detalles.sede.direccion}</div>
                                <div className="sede-telefono">📞 {success.detalles.sede.telefono}</div>
                            </div>
                        </div>

                        <div className="detalle-seccion destacado">
                            <h4>📅 Fecha y Hora de la Cita</h4>
                            <div className="fecha-hora-info">
                                <div className="fecha-grande">{success.detalles.fecha}</div>
                                <div className="hora-grande">{success.detalles.hora}</div>
                            </div>
                        </div>

                        <div className="detalle-seccion destacado">
                            <h4>🔧 Servicio Solicitado</h4>
                            <div className="servicio-info">
                                <div className="servicio-nombre">{success.detalles.servicioNombre}</div>
                            </div>
                        </div>

                        <div className="detalle-seccion destacado">
                            <h4>💰 Precio Estimado</h4>
                            <div className="precio-estimado">
                                <p className="precio-rango">
                                    ${success.detalles.precioMin.toLocaleString('es-CO')} COP
                                </p>
                                <p className="precio-nota">*El precio final puede variar según el diagnóstico del vehículo</p>
                            </div>
                        </div>
                    </div>

                    {success.esClienteNuevo && (
                        <div className="credenciales-acceso">
                            <h3>🔐 Acceso al Portal de Clientes</h3>
                            <div className="credenciales-info">
                                <p><strong>¡Bienvenido! Se ha creado su cuenta en nuestro sistema.</strong></p>
                                <p>Sus credenciales de acceso son:</p>
                                <div className="credenciales-datos">
                                    <div className="credencial-item">
                                        <span className="credencial-label">👤 Usuario:</span>
                                        <span className="credencial-valor">{success.detalles.email}</span>
                                    </div>
                                    <div className="credencial-item">
                                        <span className="credencial-label">🔑 Contraseña:</span>
                                        <span className="credencial-valor">{success.detalles.identificacion}</span>
                                    </div>
                                </div>
                                <p className="credenciales-importante">
                                    ⚠️ <strong>IMPORTANTE:</strong> Ingrese al portal con estas credenciales para confirmar su reserva lo más pronto posible.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="instrucciones">
                        <h3>📌 Instrucciones Importantes</h3>
                        <ul>
                            {!success.esClienteNuevo && (
                                <li><strong>Por favor ingrese a su portal de clientes para confirmar su reserva lo más pronto posible</strong></li>
                            )}
                            <li>Por favor llegue 10 minutos antes de su cita</li>
                            <li>Presente su documento de identificación al llegar</li>
                            <li>El administrador confirmará su llegada en el sistema</li>
                            <li>Le enviaremos un recordatorio por email y WhatsApp</li>
                        </ul>
                    </div>

                    <div className="portal-acceso-seccion">
                        <div className="portal-acceso-card">
                            <h3>🔐 Acceso al Portal de Clientes</h3>
                            <p>Ingrese al portal para confirmar su reserva y gestionar sus citas</p>
                            <a href="http://localhost:3009/login" className="btn btn-portal">
                                Iniciar Sesión en el Portal
                            </a>
                        </div>
                    </div>

                    <div className="confirmacion-acciones">
                        <button onClick={nuevaCita} className="btn btn-primary">
                            Agendar Nueva Reserva
                        </button>
                        <button onClick={() => window.print()} className="btn btn-secondary">
                            🖨️ Imprimir Confirmación
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="agendar-cita-container">
            <div className="agendar-cita-card">
                <div className="header">
                    <h1>🚗 Agendar Reserva - Taller Automotriz</h1>
                    <p>Complete los siguientes datos para reservar su servicio</p>
                </div>

                {/* Indicador de pasos */}
                <div className="pasos-indicador">
                    <div className={`paso ${paso >= 1 ? 'activo' : ''}`}>
                        <div className="paso-numero">1</div>
                        <div className="paso-texto">Datos Personales</div>
                    </div>
                    <div className={`paso ${paso >= 2 ? 'activo' : ''}`}>
                        <div className="paso-numero">2</div>
                        <div className="paso-texto">Datos del Vehículo</div>
                    </div>
                    <div className={`paso ${paso >= 3 ? 'activo' : ''}`}>
                        <div className="paso-numero">3</div>
                        <div className="paso-texto">Agendar Reserva</div>
                    </div>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* PASO 1: Datos del Cliente */}
                    {paso === 1 && (
                        <div className="paso-content">
                            <h2>Datos Personales</h2>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tipo de Identificación</label>
                                    <select
                                        name="tipo_identificacion"
                                        value={datosCliente.tipo_identificacion}
                                        onChange={handleClienteChange}
                                        disabled={!!clienteAutenticado}
                                        required
                                        style={clienteAutenticado ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                                    >
                                        <option value="CEDULA">Cédula</option>
                                        <option value="PASAPORTE">Pasaporte</option>
                                        <option value="NIT">NIT</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Número de Identificación</label>
                                    <input
                                        type="text"
                                        name="identificacion"
                                        value={datosCliente.identificacion}
                                        onChange={handleClienteChange}
                                        placeholder="Ej: 1234567890"
                                        readOnly={!!clienteAutenticado}
                                        required
                                        style={clienteAutenticado ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nombres</label>
                                    <input
                                        type="text"
                                        name="nombres"
                                        value={datosCliente.nombres}
                                        onChange={handleClienteChange}
                                        placeholder="Nombres completos"
                                        readOnly={!!clienteAutenticado}
                                        required
                                        style={clienteAutenticado ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Apellidos</label>
                                    <input
                                        type="text"
                                        name="apellidos"
                                        value={datosCliente.apellidos}
                                        onChange={handleClienteChange}
                                        placeholder="Apellidos completos"
                                        readOnly={!!clienteAutenticado}
                                        required
                                        style={clienteAutenticado ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="text"
                                        name="email"
                                        value={datosCliente.email}
                                        onChange={handleClienteChange}
                                        placeholder="correo@ejemplo.com (o solo correo)"
                                        readOnly={!!clienteAutenticado}
                                        required
                                        style={clienteAutenticado ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={datosCliente.telefono}
                                        onChange={handleClienteChange}
                                        placeholder="3001234567"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PASO 2: Datos del Vehículo */}
                    {paso === 2 && (
                        <div className="paso-content">
                            <h2>Datos del Vehículo</h2>

                            {/* Selector de vehículos para clientes autenticados */}
                            {clienteAutenticado && vehiculosCliente.length > 0 && (
                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label>Seleccionar Vehículo Registrado</label>
                                    <select
                                        value={vehiculoSeleccionadoId || ''}
                                        onChange={(e) => {
                                            if (!e.target.value) {
                                                // Si no hay vehículo seleccionado, resetear todo
                                                setVehiculoSeleccionadoId(null);
                                                setDatosVehiculo({
                                                    placa: '',
                                                    marca: '',
                                                    modelo: '',
                                                    anio: '',
                                                    color: '',
                                                    tipo_vehiculo: 'AUTOMOVIL',
                                                    numero_motor: '',
                                                    numero_chasis: ''
                                                });
                                                setMarcasDisponibles(getMarcasPorTipo('AUTOMOVIL'));
                                                setModelosDisponibles([]);
                                                return;
                                            }

                                            const vehiculo = vehiculosCliente.find(v => v.vehiculo_id === e.target.value);
                                            if (vehiculo) {
                                                setVehiculoSeleccionadoId(e.target.value);

                                                // Actualizar listas de marcas y modelos según el tipo de vehículo
                                                const tipoVehiculo = vehiculo.tipo_vehiculo || 'AUTOMOVIL';
                                                const marca = vehiculo.marca || '';

                                                const marcas = getMarcasPorTipo(tipoVehiculo);
                                                const modelos = marca ? getModelosPorMarca(marca) : [];

                                                setMarcasDisponibles(marcas);
                                                setModelosDisponibles(modelos);

                                                setDatosVehiculo({
                                                    placa: vehiculo.placa || '',
                                                    marca: marca,
                                                    modelo: vehiculo.modelo || '',
                                                    anio: vehiculo.anio || '',
                                                    color: vehiculo.color || '',
                                                    tipo_vehiculo: tipoVehiculo,
                                                    numero_motor: vehiculo.numero_motor || '',
                                                    numero_chasis: vehiculo.numero_chasis || ''
                                                });
                                            }
                                        }}
                                        style={{
                                            padding: '12px',
                                            fontSize: '14px',
                                            border: '2px solid #667eea',
                                            borderRadius: '8px',
                                            backgroundColor: '#f0f4ff'
                                        }}
                                    >
                                        <option value="">Seleccione un vehículo registrado</option>
                                        {vehiculosCliente.map(vehiculo => (
                                            <option key={vehiculo.vehiculo_id} value={vehiculo.vehiculo_id}>
                                                {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo} ({vehiculo.anio})
                                            </option>
                                        ))}
                                    </select>
                                    <small style={{ display: 'block', marginTop: '8px', color: '#666' }}>
                                        ℹ️ Seleccione uno de sus vehículos o complete los datos manualmente abajo
                                    </small>
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Placa</label>
                                    <input
                                        type="text"
                                        name="placa"
                                        value={datosVehiculo.placa}
                                        onChange={handleVehiculoChange}
                                        placeholder="ABC123"
                                        disabled={vehiculoSeleccionadoId !== null}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tipo de Vehículo</label>
                                    <select
                                        name="tipo_vehiculo"
                                        value={datosVehiculo.tipo_vehiculo}
                                        onChange={handleVehiculoChange}
                                        disabled={vehiculoSeleccionadoId !== null}
                                        required
                                    >
                                        <option value="AUTOMOVIL">Automóvil</option>
                                        <option value="CAMIONETA">Camioneta</option>
                                        <option value="MOTOCICLETA">Motocicleta</option>
                                        <option value="CAMION">Camión</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Marca</label>
                                    <select
                                        name="marca"
                                        value={datosVehiculo.marca}
                                        onChange={handleVehiculoChange}
                                        disabled={vehiculoSeleccionadoId !== null}
                                        required
                                    >
                                        <option value="">Seleccione una marca</option>
                                        {marcasDisponibles.map(marca => (
                                            <option key={marca} value={marca}>{marca}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Modelo</label>
                                    <select
                                        name="modelo"
                                        value={datosVehiculo.modelo}
                                        onChange={handleVehiculoChange}
                                        disabled={vehiculoSeleccionadoId !== null || !datosVehiculo.marca || modelosDisponibles.length === 0}
                                        required
                                    >
                                        <option value="">Seleccione un modelo</option>
                                        {modelosDisponibles.map(modelo => (
                                            <option key={modelo} value={modelo}>{modelo}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Año</label>
                                    <input
                                        type="number"
                                        name="anio"
                                        value={datosVehiculo.anio}
                                        onChange={handleVehiculoChange}
                                        placeholder="2020"
                                        min="1900"
                                        max="2025"
                                        disabled={vehiculoSeleccionadoId !== null}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Color</label>
                                    <input
                                        type="text"
                                        name="color"
                                        value={datosVehiculo.color}
                                        disabled={vehiculoSeleccionadoId !== null}
                                        onChange={handleVehiculoChange}
                                        placeholder="Ej: Blanco"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Número de Motor (Opcional)</label>
                                    <input
                                        type="text"
                                        name="numero_motor"
                                        value={datosVehiculo.numero_motor}
                                        onChange={handleVehiculoChange}
                                        placeholder="Número de motor"
                                        disabled={vehiculoSeleccionadoId !== null}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Número de Chasis (Opcional)</label>
                                    <input
                                        type="text"
                                        name="numero_chasis"
                                        value={datosVehiculo.numero_chasis}
                                        onChange={handleVehiculoChange}
                                        placeholder="Número de chasis"
                                        disabled={vehiculoSeleccionadoId !== null}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PASO 3: Agendar Cita */}
                    {paso === 3 && (
                        <div className="paso-content">
                            <h2>Detalles de la Cita</h2>

                            <div className="form-group">
                                <label>Seleccione la Sede del Taller</label>
                                <select
                                    name="sede_id"
                                    value={datosCita.sede_id}
                                    onChange={handleCitaChange}
                                    required
                                >
                                    <option value="">-- Seleccione una sede --</option>
                                    {sedes.map(sede => (
                                        <option key={sede.id} value={sede.id}>
                                            {sede.nombre} - {sede.direccion}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fecha de la Cita</label>
                                    <input
                                        type="date"
                                        name="fecha"
                                        value={datosCita.fecha}
                                        onChange={handleCitaChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                    <small style={{ color: '#718096', fontSize: '0.85em' }}>
                                        Lunes a Sábado: 8:00 AM - 5:00 PM | Domingos: 8:00 AM - 4:00 PM
                                    </small>
                                </div>
                                <div className="form-group">
                                    <label>Hora de la Cita {datosCita.hora && <span style={{ color: '#48bb78', fontWeight: 'bold' }}>✓ {datosCita.hora}</span>}</label>
                                    {!datosCita.fecha ? (
                                        <small style={{ color: '#718096', fontSize: '0.9em', display: 'block', marginTop: '8px' }}>
                                            Primero seleccione una fecha
                                        </small>
                                    ) : (
                                        <div className="horarios-grid">
                                            {generarHorariosDisponibles(datosCita.fecha).map(hora => {
                                                const estaOcupado = horariosOcupados.includes(hora);
                                                const estaSeleccionado = datosCita.hora === hora;
                                                return (
                                                    <button
                                                        key={hora}
                                                        type="button"
                                                        className={`horario-btn ${estaSeleccionado ? 'seleccionado' : ''} ${estaOcupado ? 'ocupado' : ''}`}
                                                        onClick={() => !estaOcupado && setDatosCita({ ...datosCita, hora })}
                                                        disabled={estaOcupado}
                                                    >
                                                        {hora}
                                                        {estaOcupado && <span className="ocupado-badge">Ocupado</span>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {datosCita.fecha && generarHorariosDisponibles(datosCita.fecha).length === 0 && (
                                        <small style={{ color: '#e53e3e', fontSize: '0.85em' }}>
                                            No trabajamos este día
                                        </small>
                                    )}
                                    {datosCita.fecha && horariosOcupados.length > 0 && (
                                        <small style={{ color: '#718096', fontSize: '0.85em', display: 'block', marginTop: '8px' }}>
                                            {horariosOcupados.length} horario(s) ocupado(s)
                                        </small>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>¿Qué servicio necesita tu vehículo?</label>
                                {serviciosDisponibles.length === 0 ? (
                                    <p style={{ color: '#718096', textAlign: 'center', padding: '20px' }}>
                                        Cargando servicios disponibles...
                                    </p>
                                ) : (
                                    <div className="servicios-categorias">
                                        {agruparServiciosPorCategoria().map(({ categoria, nombre, icono, servicios }) => (
                                            <div key={categoria} className="categoria-seccion">
                                                <h3 className="categoria-titulo">
                                                    <span className="categoria-icono">{icono}</span>
                                                    {nombre}
                                                </h3>
                                                <div className="servicios-grid">
                                                    {servicios.map(servicio => (
                                                        <div
                                                            key={servicio.servicio_id}
                                                            className={`servicio-card ${datosCita.servicio_id === servicio.servicio_id ? 'seleccionado' : ''}`}
                                                            onClick={() => setDatosCita({ ...datosCita, servicio_id: servicio.servicio_id, tipo_servicio: servicio.categoria })}
                                                        >
                                                            <h4 className="servicio-nombre">{servicio.nombre}</h4>
                                                            <p className="servicio-descripcion">{servicio.descripcion}</p>
                                                            <div className="servicio-info">
                                                                <div className="servicio-duracion">
                                                                    ⏱️ {servicio.duracion_estimada} min
                                                                </div>
                                                                <div className="servicio-precio">
                                                                    <span className="precio-desde">Desde</span>
                                                                    <span className="precio-valor">${servicio.precio_base.toLocaleString('es-CO')}</span>
                                                                </div>
                                                            </div>
                                                            {datosCita.servicio_id === servicio.servicio_id && (
                                                                <div className="servicio-check">✓</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Descripción del Problema o Servicio</label>
                                <textarea
                                    name="descripcion_problema"
                                    value={datosCita.descripcion_problema}
                                    onChange={handleCitaChange}
                                    placeholder="Describa detalladamente el problema o servicio que necesita..."
                                    rows="4"
                                    required
                                />
                            </div>

                            {/* Resumen */}
                            {datosCita.sede_id && datosCita.fecha && datosCita.hora && (
                                <div className="resumen-cita">
                                    <h3>Resumen de la Cita</h3>
                                    <div className="resumen-item">
                                        <strong>Cliente:</strong> {datosCliente.nombres} {datosCliente.apellidos}
                                    </div>
                                    <div className="resumen-item">
                                        <strong>Vehículo:</strong> {datosVehiculo.marca} {datosVehiculo.modelo} - {datosVehiculo.placa}
                                    </div>
                                    <div className="resumen-item">
                                        <strong>Sede:</strong> {sedes.find(s => s.id === parseInt(datosCita.sede_id))?.nombre}
                                    </div>
                                    <div className="resumen-item">
                                        <strong>Fecha:</strong> {new Date(datosCita.fecha).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                    <div className="resumen-item">
                                        <strong>Hora:</strong> {datosCita.hora}
                                    </div>
                                    <div className="resumen-item">
                                        <strong>Servicio:</strong> {serviciosDisponibles.find(s => s.servicio_id === datosCita.servicio_id)?.nombre || 'No seleccionado'}
                                    </div>
                                    {datosCita.servicio_id && (
                                        <div className="resumen-item">
                                            <strong>Precio estimado:</strong> ${serviciosDisponibles.find(s => s.servicio_id === datosCita.servicio_id)?.precio_base.toLocaleString('es-CO')}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Botones de navegación */}
                    <div className="form-actions">
                        {paso > 1 && (
                            <button type="button" onClick={pasoAnterior} className="btn btn-secondary">
                                ← Anterior
                            </button>
                        )}
                        <div style={{ flex: 1 }}></div>
                        {paso < 3 ? (
                            <button type="button" onClick={siguientePaso} className="btn btn-primary">
                                Siguiente →
                            </button>
                        ) : (
                            <button type="submit" className="btn btn-success" disabled={loading}>
                                {loading ? 'Agendando...' : '✓ Confirmar Reserva'}
                            </button>
                        )}
                    </div>
                </form>

                <div className="footer-info">
                    <p>📞 Para más información: (601) 234-5678</p>
                    <p>📧 contacto@tallerautomotriz.com</p>
                </div>
            </div>
        </div>
    );
};

export default AgendarCita;
