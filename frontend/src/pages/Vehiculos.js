import React, { useState, useEffect } from 'react';
import { vehiculoService, clienteService, citaService } from '../services';

const Vehiculos = () => {
    const [vehiculos, setVehiculos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [vehiculoToDelete, setVehiculoToDelete] = useState(null);
    const [editingVehiculo, setEditingVehiculo] = useState(null);
    const [selectedVehiculo, setSelectedVehiculo] = useState(null);
    const [vehiculoDueno, setVehiculoDueno] = useState(null);
    const [vehiculoCitas, setVehiculoCitas] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [busquedaCliente, setBusquedaCliente] = useState('');
    const [clienteEncontrado, setClienteEncontrado] = useState(null);
    const [buscandoCliente, setBuscandoCliente] = useState(false);
    const [todosClientes, setTodosClientes] = useState([]);
    const [clientesFiltrados, setClientesFiltrados] = useState([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const [formData, setFormData] = useState({
        placa: '',
        marca: '',
        modelo: '',
        anio: '',
        color: '',
        tipo_vehiculo: 'AUTOMOVIL',
        numero_motor: '',
        numero_chasis: '',
        cliente_id: ''
    });
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 10;

    useEffect(() => {
        loadVehiculos();
        loadClientes();
    }, []);

    const loadClientes = async () => {
        try {
            const response = await clienteService.getAll();
            setTodosClientes(response.data.data || []);
        } catch (error) {
            console.error('Error cargando clientes:', error);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => {
            setAlert({ show: false, type: '', message: '' });
        }, 4000);
    };

    const loadVehiculos = async () => {
        try {
            const [vehiculosResponse, clientesResponse] = await Promise.all([
                vehiculoService.getAll(),
                clienteService.getAll()
            ]);

            const vehiculosData = vehiculosResponse.data.data || [];
            const clientesData = clientesResponse.data.data || [];
            setClientes(clientesData);

            // Enriquecer vehículos con nombre del cliente
            const vehiculosEnriquecidos = vehiculosData.map(vehiculo => {
                const cliente = clientesData.find(c => c.cliente_id === vehiculo.cliente_id);
                return {
                    ...vehiculo,
                    cliente_nombre: cliente ? `${cliente.nombres} ${cliente.apellidos}` : 'Sin cliente'
                };
            });

            console.log('🚗 Vehículos cargados:', vehiculosEnriquecidos.length, 'itemsPorPagina:', itemsPorPagina);
            setVehiculos(vehiculosEnriquecidos);
        } catch (error) {
            console.error('Error cargando vehículos:', error);
            setVehiculos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar que se haya seleccionado un cliente al crear
        if (!editingVehiculo && !formData.cliente_id) {
            showAlert('error', 'Debe buscar y seleccionar un propietario para el vehículo');
            return;
        }

        try {
            if (editingVehiculo) {
                await vehiculoService.update(editingVehiculo.vehiculo_id, formData);
                showAlert('success', 'Vehículo actualizado exitosamente');
            } else {
                await vehiculoService.create(formData);
                showAlert('success', 'Vehículo creado exitosamente');
            }
            setShowModal(false);
            loadVehiculos();
            resetForm();
        } catch (error) {
            showAlert('error', 'Error al guardar vehículo: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleEdit = (vehiculo) => {
        setEditingVehiculo(vehiculo);
        setFormData({
            placa: vehiculo.placa,
            marca: vehiculo.marca,
            modelo: vehiculo.modelo,
            anio: vehiculo.anio,
            color: vehiculo.color,
            tipo_vehiculo: vehiculo.tipo_vehiculo,
            numero_motor: vehiculo.numero_motor || '',
            numero_chasis: vehiculo.numero_chasis || '',
            cliente_id: vehiculo.cliente_id
        });
        setShowModal(true);
    };

    const handleView = async (vehiculo) => {
        setSelectedVehiculo(vehiculo);
        setShowViewModal(true);
        setLoadingDetails(true);

        try {
            // Cargar información del dueño
            const clienteResponse = await clienteService.getById(vehiculo.cliente_id);
            setVehiculoDueno(clienteResponse.data.data);

            // Cargar historial de citas del vehículo
            const citasResponse = await citaService.getAll();
            const todasCitas = citasResponse.data.data || [];
            const citasVehiculo = todasCitas.filter(cita => cita.vehiculo_id === vehiculo.vehiculo_id);
            setVehiculoCitas(citasVehiculo);
        } catch (error) {
            console.error('Error cargando detalles del vehículo:', error);
            setVehiculoDueno(null);
            setVehiculoCitas([]);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleDelete = (vehiculo) => {
        setVehiculoToDelete(vehiculo);
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        try {
            await vehiculoService.delete(vehiculoToDelete.vehiculo_id);
            showAlert('success', 'Vehículo eliminado exitosamente');
            setShowConfirmModal(false);
            setVehiculoToDelete(null);
            loadVehiculos();
        } catch (error) {
            console.error('Error eliminando vehículo:', error);
            showAlert('error', 'Error al eliminar vehículo: ' + (error.response?.data?.error || error.message));
            setShowConfirmModal(false);
            setVehiculoToDelete(null);
        }
    };

    const resetForm = () => {
        setEditingVehiculo(null);
        setBusquedaCliente('');
        setClienteEncontrado(null);
        setClientesFiltrados([]);
        setMostrarSugerencias(false);
        setFormData({
            placa: '',
            marca: '',
            modelo: '',
            anio: '',
            color: '',
            tipo_vehiculo: 'AUTOMOVIL',
            numero_motor: '',
            numero_chasis: '',
            cliente_id: ''
        });
    };

    const handleBusquedaClienteChange = (e) => {
        const valor = e.target.value;
        setBusquedaCliente(valor);

        if (valor.trim().length > 0) {
            const filtrados = todosClientes
                .filter(cliente =>
                    cliente.identificacion.startsWith(valor) ||
                    cliente.nombres.toLowerCase().includes(valor.toLowerCase()) ||
                    cliente.apellidos.toLowerCase().includes(valor.toLowerCase())
                )
                .sort((a, b) => {
                    // Priorizar los que empiezan con el valor buscado
                    const aEmpieza = a.identificacion.startsWith(valor);
                    const bEmpieza = b.identificacion.startsWith(valor);

                    if (aEmpieza && !bEmpieza) return -1;
                    if (!aEmpieza && bEmpieza) return 1;

                    // Si ambos empiezan con el valor, ordenar numéricamente
                    const idA = parseInt(a.identificacion.replace(/\D/g, '')) || 0;
                    const idB = parseInt(b.identificacion.replace(/\D/g, '')) || 0;
                    return idA - idB;
                });
            setClientesFiltrados(filtrados);
            setMostrarSugerencias(true);
        } else {
            setClientesFiltrados([]);
            setMostrarSugerencias(false);
        }
    };

    const seleccionarCliente = (cliente) => {
        setClienteEncontrado(cliente);
        setBusquedaCliente(cliente.identificacion);
        setFormData({ ...formData, cliente_id: cliente.cliente_id });
        setMostrarSugerencias(false);
        setClientesFiltrados([]);
        showAlert('success', 'Cliente seleccionado');
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    if (loading) return <div className="loading">Cargando vehículos...</div>;

    return (
        <div>
            {/* Alerta */}
            {alert.show && (
                <div className={`alert alert-${alert.type}`} style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 9999,
                    minWidth: '300px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    {alert.message}
                    <button
                        onClick={() => setAlert({ show: false, type: '', message: '' })}
                        style={{
                            marginLeft: '15px',
                            background: 'none',
                            border: 'none',
                            fontSize: '18px',
                            cursor: 'pointer',
                            float: 'right',
                            lineHeight: '1'
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Vehículos</h1>
                <div style={{ padding: '8px 16px', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '14px', color: '#1976d2' }}>
                    📖 Vista de solo lectura
                </div>
            </div>

            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Propietario</th>
                            <th>Placa</th>
                            <th>Marca</th>
                            <th>Modelo</th>
                            <th>Año</th>
                            <th>Color</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehiculos.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center' }}>No hay vehículos registrados</td>
                            </tr>
                        ) : (
                            vehiculos
                                .slice((paginaActual - 1) * itemsPorPagina, paginaActual * itemsPorPagina)
                                .map((vehiculo) => (
                                    <tr key={vehiculo.vehiculo_id}>
                                        <td>{vehiculo.cliente_nombre}</td>
                                        <td><strong>{vehiculo.placa}</strong></td>
                                        <td>{vehiculo.marca}</td>
                                        <td>{vehiculo.modelo}</td>
                                        <td>{vehiculo.anio}</td>
                                        <td>{vehiculo.color}</td>
                                        <td>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleView(vehiculo)}
                                            >
                                                👁️ Ver
                                            </button>
                                        </td>
                                    </tr>
                                ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación - DEBUG: Mostrando siempre */}
            <div className="pagination-controls">
                <button
                    onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                    disabled={paginaActual === 1}
                    className="btn btn-secondary btn-sm"
                >
                    ← Anterior
                </button>
                <span className="pagination-info">
                    Página {paginaActual} de {Math.ceil(vehiculos.length / itemsPorPagina) || 1} | Total: {vehiculos.length} registros
                </span>
                <button
                    onClick={() => setPaginaActual(prev => prev + 1)}
                    disabled={vehiculos.length === 0 || paginaActual >= Math.ceil(vehiculos.length / itemsPorPagina)}
                    className="btn btn-secondary btn-sm"
                >
                    Siguiente →
                </button>
            </div>

            {/* Modal Crear/Editar Vehículo */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingVehiculo ? 'Editar Vehículo' : 'Nuevo Vehículo'}</h2>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {/* Búsqueda de Cliente (solo al crear) */}
                            {!editingVehiculo && (
                                <div className="form-group">
                                    <label>Propietario del Vehículo</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            value={busquedaCliente}
                                            onChange={handleBusquedaClienteChange}
                                            placeholder="Buscar por identificación, nombre o apellido..."
                                            autoComplete="off"
                                        />

                                        {/* Sugerencias */}
                                        {mostrarSugerencias && clientesFiltrados.length > 0 && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                right: 0,
                                                backgroundColor: 'white',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                maxHeight: '200px',
                                                overflowY: 'auto',
                                                zIndex: 1000,
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                marginTop: '2px'
                                            }}>
                                                {clientesFiltrados.map((cliente) => (
                                                    <div
                                                        key={cliente.cliente_id}
                                                        onClick={() => seleccionarCliente(cliente)}
                                                        style={{
                                                            padding: '10px',
                                                            cursor: 'pointer',
                                                            borderBottom: '1px solid #f0f0f0',
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                                    >
                                                        <strong>{cliente.nombres} {cliente.apellidos}</strong>
                                                        <br />
                                                        <small style={{ color: '#6c757d' }}>
                                                            {cliente.tipo_identificacion}: {cliente.identificacion}
                                                        </small>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {mostrarSugerencias && clientesFiltrados.length === 0 && busquedaCliente.trim() && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                right: 0,
                                                backgroundColor: 'white',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                padding: '10px',
                                                zIndex: 1000,
                                                marginTop: '2px',
                                                color: '#6c757d',
                                                textAlign: 'center'
                                            }}>
                                                No se encontraron clientes
                                            </div>
                                        )}
                                    </div>

                                    {clienteEncontrado && (
                                        <div style={{
                                            marginTop: '10px',
                                            padding: '10px',
                                            backgroundColor: '#d1e7dd',
                                            borderRadius: '4px',
                                            border: '1px solid #badbcc'
                                        }}>
                                            <strong>✓ Cliente seleccionado:</strong><br />
                                            {clienteEncontrado.nombres} {clienteEncontrado.apellidos}<br />
                                            <small style={{ color: '#0f5132' }}>
                                                {clienteEncontrado.tipo_identificacion}: {clienteEncontrado.identificacion}
                                            </small>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="form-group">
                                <label>Placa</label>
                                <input
                                    type="text"
                                    value={formData.placa}
                                    onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                                    required
                                    disabled={editingVehiculo}
                                />
                            </div>
                            <div className="form-group">
                                <label>Tipo de Vehículo</label>
                                <select
                                    value={formData.tipo_vehiculo}
                                    onChange={(e) => setFormData({ ...formData, tipo_vehiculo: e.target.value })}
                                    required
                                >
                                    <option value="AUTOMOVIL">Automóvil</option>
                                    <option value="CAMIONETA">Camioneta</option>
                                    <option value="MOTOCICLETA">Motocicleta</option>
                                    <option value="CAMION">Camión</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Marca</label>
                                <input
                                    type="text"
                                    value={formData.marca}
                                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Modelo</label>
                                <input
                                    type="text"
                                    value={formData.modelo}
                                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Año</label>
                                <input
                                    type="number"
                                    value={formData.anio}
                                    onChange={(e) => setFormData({ ...formData, anio: e.target.value })}
                                    min="1900"
                                    max="2030"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Color</label>
                                <input
                                    type="text"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Número de Motor (Opcional)</label>
                                <input
                                    type="text"
                                    value={formData.numero_motor}
                                    onChange={(e) => setFormData({ ...formData, numero_motor: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Número de Chasis (Opcional)</label>
                                <input
                                    type="text"
                                    value={formData.numero_chasis}
                                    onChange={(e) => setFormData({ ...formData, numero_chasis: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={closeModal} className="btn btn-secondary">
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingVehiculo ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Ver Vehículo y Historial */}
            {showViewModal && selectedVehiculo && (
                <div className="modal">
                    <div className="modal-content" style={{ maxWidth: '900px' }}>
                        <div className="modal-header">
                            <h2>🚗 Información del Vehículo</h2>
                            <button className="close-btn" onClick={() => setShowViewModal(false)}>×</button>
                        </div>

                        {/* Datos del Vehículo */}
                        <div className="card" style={{ backgroundColor: '#f8f9fa', marginBottom: '20px' }}>
                            <h3 style={{ marginTop: 0 }}>Datos del Vehículo</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                <div>
                                    <strong>Placa:</strong>
                                    <p>{selectedVehiculo.placa}</p>
                                </div>
                                <div>
                                    <strong>Tipo:</strong>
                                    <p>{selectedVehiculo.tipo_vehiculo}</p>
                                </div>
                                <div>
                                    <strong>Marca:</strong>
                                    <p>{selectedVehiculo.marca}</p>
                                </div>
                                <div>
                                    <strong>Modelo:</strong>
                                    <p>{selectedVehiculo.modelo}</p>
                                </div>
                                <div>
                                    <strong>Año:</strong>
                                    <p>{selectedVehiculo.anio}</p>
                                </div>
                                <div>
                                    <strong>Color:</strong>
                                    <p>{selectedVehiculo.color}</p>
                                </div>
                                {selectedVehiculo.numero_motor && (
                                    <div>
                                        <strong>Número de Motor:</strong>
                                        <p>{selectedVehiculo.numero_motor}</p>
                                    </div>
                                )}
                                {selectedVehiculo.numero_chasis && (
                                    <div>
                                        <strong>Número de Chasis:</strong>
                                        <p>{selectedVehiculo.numero_chasis}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Información del Dueño */}
                        <div className="card" style={{ backgroundColor: '#e8f4f8', marginBottom: '20px' }}>
                            <h3 style={{ marginTop: 0 }}>👤 Propietario</h3>
                            {loadingDetails ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    Cargando información del dueño...
                                </div>
                            ) : vehiculoDueno ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                    <div>
                                        <strong>Nombre:</strong>
                                        <p>{vehiculoDueno.nombres} {vehiculoDueno.apellidos}</p>
                                    </div>
                                    <div>
                                        <strong>Identificación:</strong>
                                        <p>{vehiculoDueno.tipo_identificacion}: {vehiculoDueno.identificacion}</p>
                                    </div>
                                    <div>
                                        <strong>Email:</strong>
                                        <p>{vehiculoDueno.email}</p>
                                    </div>
                                    <div>
                                        <strong>Teléfono:</strong>
                                        <p>{vehiculoDueno.telefono}</p>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ textAlign: 'center', color: '#718096' }}>
                                    No se pudo cargar la información del propietario
                                </p>
                            )}
                        </div>

                        {/* Historial de Citas */}
                        <div>
                            <h3>📅 Historial de Mantenimiento</h3>
                            {loadingDetails ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    Cargando historial...
                                </div>
                            ) : vehiculoCitas.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#718096', padding: '20px' }}>
                                    No hay mantenimientos registrados para este vehículo
                                </p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Hora</th>
                                                <th>Motivo</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vehiculoCitas.map((cita) => (
                                                <tr key={cita.cita_id}>
                                                    <td>{new Date(cita.fecha).toLocaleDateString('es-CO')}</td>
                                                    <td>{cita.hora?.substring(0, 5)}</td>
                                                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {cita.motivo || '-'}
                                                    </td>
                                                    <td>
                                                        <span className={`badge badge-${cita.estado?.toLowerCase()}`}>
                                                            {cita.estado}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                                        <strong>Total de citas:</strong> {vehiculoCitas.length}
                                        <span style={{ marginLeft: '20px' }}>
                                            <strong>Completadas:</strong> {vehiculoCitas.filter(c => c.estado === 'COMPLETADA').length}
                                        </span>
                                        <span style={{ marginLeft: '20px' }}>
                                            <strong>Canceladas:</strong> {vehiculoCitas.filter(c => c.estado === 'CANCELADA').length}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '20px', textAlign: 'right' }}>
                            <button onClick={() => setShowViewModal(false)} className="btn btn-secondary">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Eliminación */}
            {showConfirmModal && vehiculoToDelete && (
                <div className="modal">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>⚠️ Confirmar Eliminación</h2>
                            <button className="close-btn" onClick={() => {
                                setShowConfirmModal(false);
                                setVehiculoToDelete(null);
                            }}>×</button>
                        </div>

                        <div style={{ padding: '20px 0' }}>
                            <p style={{ fontSize: '16px', marginBottom: '15px' }}>
                                ¿Está seguro de eliminar el vehículo?
                            </p>
                            <div style={{
                                backgroundColor: '#f8f9fa',
                                padding: '15px',
                                borderRadius: '8px',
                                marginBottom: '15px'
                            }}>
                                <strong>{vehiculoToDelete.marca} {vehiculoToDelete.modelo}</strong>
                                <br />
                                <span style={{ color: '#6c757d' }}>
                                    Placa: {vehiculoToDelete.placa}
                                </span>
                            </div>
                            <p style={{ color: '#dc3545', fontSize: '14px' }}>
                                ⚠️ Esta acción no se puede deshacer.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setVehiculoToDelete(null);
                                }}
                                className="btn btn-secondary"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="btn btn-danger"
                            >
                                Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vehiculos;
