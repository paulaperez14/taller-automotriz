import React, { useState, useEffect } from 'react';
import { clienteService, citaService } from '../../services';

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [clienteToDelete, setClienteToDelete] = useState(null);
    const [editingCliente, setEditingCliente] = useState(null);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [clienteCitas, setClienteCitas] = useState([]);
    const [loadingCitas, setLoadingCitas] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [formData, setFormData] = useState({
        tipo_identificacion: 'CEDULA',
        identificacion: '',
        nombres: '',
        apellidos: '',
        email: '',
        telefono: '',
        direccion: ''
    });
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 10;

    useEffect(() => {
        loadClientes();
    }, []);

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => {
            setAlert({ show: false, type: '', message: '' });
        }, 4000);
    };

    const loadClientes = async () => {
        try {
            const response = await clienteService.getAll();
            setClientes(response.data.data || []);
        } catch (error) {
            console.error('Error cargando clientes:', error);
            setClientes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCliente) {
                await clienteService.update(editingCliente.cliente_id, formData);
                showAlert('success', 'Cliente actualizado exitosamente');
            } else {
                await clienteService.create(formData);
                showAlert('success', 'Cliente creado exitosamente');
            }
            setShowModal(false);
            loadClientes();
            resetForm();
        } catch (error) {
            showAlert('error', 'Error al guardar cliente: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleEdit = (cliente) => {
        setEditingCliente(cliente);
        setFormData({
            tipo_identificacion: cliente.tipo_identificacion,
            identificacion: cliente.identificacion,
            nombres: cliente.nombres,
            apellidos: cliente.apellidos,
            email: cliente.email,
            telefono: cliente.telefono,
            direccion: cliente.direccion || ''
        });
        setShowModal(true);
    };

    const handleView = async (cliente) => {
        setSelectedCliente(cliente);
        setShowViewModal(true);
        setLoadingCitas(true);

        try {
            // Cargar historial de citas del cliente
            const response = await citaService.getAll();
            const todasCitas = response.data.data || [];
            const citasCliente = todasCitas.filter(cita => cita.cliente_id === cliente.cliente_id);
            setClienteCitas(citasCliente);
        } catch (error) {
            console.error('Error cargando citas del cliente:', error);
            setClienteCitas([]);
        } finally {
            setLoadingCitas(false);
        }
    };

    const handleDelete = (cliente) => {
        setClienteToDelete(cliente);
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        try {
            await clienteService.delete(clienteToDelete.cliente_id);
            showAlert('success', 'Cliente eliminado exitosamente');
            setShowConfirmModal(false);
            setClienteToDelete(null);
            loadClientes();
        } catch (error) {
            console.error('Error eliminando cliente:', error);
            showAlert('error', 'Error al eliminar cliente: ' + (error.response?.data?.error || error.message));
            setShowConfirmModal(false);
            setClienteToDelete(null);
        }
    };

    const resetForm = () => {
        setEditingCliente(null);
        setFormData({
            tipo_identificacion: 'CEDULA',
            identificacion: '',
            nombres: '',
            apellidos: '',
            email: '',
            telefono: '',
            direccion: ''
        });
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    if (loading) return <div className="loading">Cargando clientes...</div>;

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
                <h1>Clientes</h1>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    + Nuevo Cliente
                </button>
            </div>

            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Identificación</th>
                            <th>Nombres</th>
                            <th>Apellidos</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientes.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center' }}>No hay clientes registrados</td>
                            </tr>
                        ) : (
                            clientes
                                .slice((paginaActual - 1) * itemsPorPagina, paginaActual * itemsPorPagina)
                                .map((cliente) => (
                                    <tr key={cliente.cliente_id}>
                                        <td>{cliente.identificacion}</td>
                                        <td>{cliente.nombres}</td>
                                        <td>{cliente.apellidos}</td>
                                        <td>{cliente.email}</td>
                                        <td>{cliente.telefono}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleView(cliente)}
                                                >
                                                    👁️ Ver
                                                </button>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleEdit(cliente)}
                                                >
                                                    ✏️ Editar
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDelete(cliente)}
                                                >
                                                    🗑️ Eliminar
                                                </button>
                                            </div>
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
                    Página {paginaActual} de {Math.ceil(clientes.length / itemsPorPagina) || 1} | Total: {clientes.length} registros
                </span>
                <button
                    onClick={() => setPaginaActual(prev => prev + 1)}
                    disabled={clientes.length === 0 || paginaActual >= Math.ceil(clientes.length / itemsPorPagina)}
                    className="btn btn-secondary btn-sm"
                >
                    Siguiente →
                </button>
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tipo de Identificación</label>
                                <select
                                    value={formData.tipo_identificacion}
                                    onChange={(e) => setFormData({ ...formData, tipo_identificacion: e.target.value })}
                                    required
                                >
                                    <option value="CEDULA">Cédula</option>
                                    <option value="PASAPORTE">Pasaporte</option>
                                    <option value="NIT">NIT</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Identificación</label>
                                <input
                                    type="text"
                                    value={formData.identificacion}
                                    onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Nombres</label>
                                <input
                                    type="text"
                                    value={formData.nombres}
                                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Apellidos</label>
                                <input
                                    type="text"
                                    value={formData.apellidos}
                                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Teléfono</label>
                                <input
                                    type="tel"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Dirección</label>
                                <textarea
                                    value={formData.direccion}
                                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={closeModal} className="btn btn-secondary">
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingCliente ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Ver Cliente y Historial */}
            {showViewModal && selectedCliente && (
                <div className="modal">
                    <div className="modal-content" style={{ maxWidth: '900px' }}>
                        <div className="modal-header">
                            <h2>📋 Información del Cliente</h2>
                            <button className="close-btn" onClick={() => setShowViewModal(false)}>×</button>
                        </div>

                        {/* Datos del Cliente */}
                        <div className="card" style={{ backgroundColor: '#f8f9fa', marginBottom: '20px' }}>
                            <h3 style={{ marginTop: 0 }}>Datos Personales</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                <div>
                                    <strong>Tipo de Identificación:</strong>
                                    <p>{selectedCliente.tipo_identificacion}</p>
                                </div>
                                <div>
                                    <strong>Identificación:</strong>
                                    <p>{selectedCliente.identificacion}</p>
                                </div>
                                <div>
                                    <strong>Nombres:</strong>
                                    <p>{selectedCliente.nombres}</p>
                                </div>
                                <div>
                                    <strong>Apellidos:</strong>
                                    <p>{selectedCliente.apellidos}</p>
                                </div>
                                <div>
                                    <strong>Email:</strong>
                                    <p>{selectedCliente.email}</p>
                                </div>
                                <div>
                                    <strong>Teléfono:</strong>
                                    <p>{selectedCliente.telefono}</p>
                                </div>
                                {selectedCliente.direccion && (
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <strong>Dirección:</strong>
                                        <p>{selectedCliente.direccion}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Historial de Citas */}
                        <div>
                            <h3>📅 Historial de Citas</h3>
                            {loadingCitas ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    Cargando historial...
                                </div>
                            ) : clienteCitas.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#718096', padding: '20px' }}>
                                    No hay citas registradas para este cliente
                                </p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Hora</th>
                                                <th>Vehículo</th>
                                                <th>Motivo</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {clienteCitas.map((cita) => (
                                                <tr key={cita.cita_id}>
                                                    <td>{new Date(cita.fecha).toLocaleDateString('es-CO')}</td>
                                                    <td>{cita.hora?.substring(0, 5)}</td>
                                                    <td>{cita.vehiculo_placa || '-'}</td>
                                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                                        <strong>Total de citas:</strong> {clienteCitas.length}
                                        <span style={{ marginLeft: '20px' }}>
                                            <strong>Completadas:</strong> {clienteCitas.filter(c => c.estado === 'COMPLETADA').length}
                                        </span>
                                        <span style={{ marginLeft: '20px' }}>
                                            <strong>Canceladas:</strong> {clienteCitas.filter(c => c.estado === 'CANCELADA').length}
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
            {showConfirmModal && clienteToDelete && (
                <div className="modal">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>⚠️ Confirmar Eliminación</h2>
                            <button className="close-btn" onClick={() => {
                                setShowConfirmModal(false);
                                setClienteToDelete(null);
                            }}>×</button>
                        </div>

                        <div style={{ padding: '20px 0' }}>
                            <p style={{ fontSize: '16px', marginBottom: '15px' }}>
                                ¿Está seguro de eliminar al cliente?
                            </p>
                            <div style={{
                                backgroundColor: '#f8f9fa',
                                padding: '15px',
                                borderRadius: '8px',
                                marginBottom: '15px'
                            }}>
                                <strong>{clienteToDelete.nombres} {clienteToDelete.apellidos}</strong>
                                <br />
                                <span style={{ color: '#6c757d' }}>
                                    {clienteToDelete.tipo_identificacion}: {clienteToDelete.identificacion}
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
                                    setClienteToDelete(null);
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

export default Clientes;
