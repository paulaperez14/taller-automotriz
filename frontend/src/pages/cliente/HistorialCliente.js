import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ordenService, citaService, clienteService } from '../../services';
import './HistorialCliente.css';

const HistorialCliente = () => {
    const { user } = useAuth();
    const [ordenes, setOrdenes] = useState([]);
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nombreCliente, setNombreCliente] = useState('');
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [clienteId, setClienteId] = useState(null);

    // Función para formatear fecha sin problemas de zona horaria
    const formatearFecha = (fechaString) => {
        if (!fechaString) return '';
        const [año, mes, dia] = fechaString.split('T')[0].split('-');
        const fecha = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
        return fecha.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    useEffect(() => {
        loadData();
    }, []);

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => {
            setAlert({ show: false, type: '', message: '' });
        }, 4000);
    };

    const loadData = async () => {
        try {
            // Primero obtener el cliente_id del usuario autenticado usando el email
            const clientesResponse = await clienteService.getAll();
            const todosClientes = clientesResponse.data.data || [];

            // Buscar cliente por email (ya que no todos tienen usuario_id vinculado)
            const miCliente = todosClientes.find(c =>
                c.email === user.email || c.usuario_id === user.usuario_id
            );

            if (!miCliente) {
                console.error('No se encontró el cliente asociado al usuario');
                console.log('Email del usuario:', user.email);
                console.log('Usuario ID:', user.usuario_id);
                setLoading(false);
                return;
            }

            setClienteId(miCliente.cliente_id);
            setNombreCliente(`${miCliente.nombres} ${miCliente.apellidos || ''}`);

            // Cargar citas del cliente
            const citasResponse = await citaService.getAll();
            const todasCitas = citasResponse.data.data || [];
            const misCitas = todasCitas.filter(c =>
                c.cliente_id === miCliente.cliente_id &&
                (c.estado === 'PROGRAMADA' || c.estado === 'CONFIRMADA')
            );
            setCitas(misCitas);

            // Cargar órdenes del cliente
            const ordenesResponse = await ordenService.getAll();
            const todasOrdenes = ordenesResponse.data.data || [];
            const misOrdenes = todasOrdenes.filter(o => o.cliente_id === miCliente.cliente_id);
            // Ordenar de más reciente a más antigua por fecha y hora de cita
            const ordenesSorted = misOrdenes.sort((a, b) => {
                const fechaHoraA = new Date(`${a.cita_fecha || a.fecha_creacion}T${a.cita_hora || '00:00:00'}`);
                const fechaHoraB = new Date(`${b.cita_fecha || b.fecha_creacion}T${b.cita_hora || '00:00:00'}`);
                return fechaHoraB - fechaHoraA;
            });
            setOrdenes(ordenesSorted);

            // Ya tenemos el nombre del cliente de arriba, no necesitamos obtenerlo de las órdenes
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const confirmarCita = (citaId) => {
        setConfirmAction({
            citaId,
            action: 'confirmar',
            title: '✓ Confirmar Cita',
            message: '¿Deseas confirmar tu asistencia a esta cita?',
            confirmText: 'Sí, Confirmar',
            confirmClass: 'btn-success'
        });
        setShowConfirmModal(true);
    };

    const cancelarCita = (citaId) => {
        setConfirmAction({
            citaId,
            action: 'cancelar',
            title: '✗ Cancelar Cita',
            message: '¿Estás seguro de que deseas cancelar esta cita?',
            confirmText: 'Sí, Cancelar',
            confirmClass: 'btn-danger'
        });
        setShowConfirmModal(true);
    };

    const ejecutarAccion = async () => {
        try {
            if (confirmAction.action === 'confirmar') {
                await citaService.confirmar(confirmAction.citaId);
                showAlert('success', 'Cita confirmada exitosamente. Te esperamos!');
            } else if (confirmAction.action === 'cancelar') {
                await citaService.cancelar(confirmAction.citaId);
                showAlert('success', 'Cita cancelada exitosamente');
            }
            await loadData();
        } catch (error) {
            console.error('Error ejecutando acción:', error);
            showAlert('error', 'Error al procesar la acción: ' + (error.response?.data?.error || error.message));
        } finally {
            setShowConfirmModal(false);
            setConfirmAction(null);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value);
    };

    const getEstadoBadgeClass = (estado) => {
        switch (estado) {
            case 'COMPLETADO':
            case 'FINALIZADO':
            case 'ENTREGADO':
            case 'PAGADA': return 'badge-success';
            case 'EN_PROCESO': return 'badge-info';
            case 'PENDIENTE': return 'badge-warning';
            case 'CANCELADO':
            case 'CANCELADA': return 'badge-danger';
            default: return 'badge-secondary';
        }
    };

    if (loading) {
        return (
            <div className="historial-container">
                <div className="empty-state">
                    <div className="empty-state-icon">⏳</div>
                    <p>Cargando tu historial...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="historial-container">
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

            <div className="historial-header">
                <h1>Mi Historial</h1>
                <p>Bienvenido, <strong>{nombreCliente || user.username}</strong></p>
            </div>

            {/* Vista de Citas Activas */}
            <div className="content-section">
                <h2>📅 Mis Citas Activas</h2>
                {citas && citas.length > 0 ? (
                    <div className="ordenes-grid">
                        {citas.map((cita) => (
                            <div key={cita.cita_id} className="orden-card" style={{ borderLeft: '4px solid #007bff' }}>
                                <div className="orden-header">
                                    <div className="orden-info">
                                        <h3>Cita - {formatearFecha(cita.fecha)}</h3>
                                        <p className="orden-fecha">
                                            🕐 {cita.hora?.substring(0, 5)}
                                        </p>
                                    </div>
                                    <span className={`badge badge-${cita.estado?.toLowerCase()}`}>
                                        {cita.estado}
                                    </span>
                                </div>

                                <div className="orden-body">
                                    {cita.vehiculo_placa && (
                                        <div className="orden-detail">
                                            <span className="orden-detail-icon">🚗</span>
                                            <div className="orden-detail-text">
                                                <strong>Vehículo:</strong>
                                                <span>{cita.vehiculo_placa} - {cita.vehiculo_marca} {cita.vehiculo_modelo}</span>
                                            </div>
                                        </div>
                                    )}
                                    {cita.motivo && (
                                        <div className="orden-detail">
                                            <span className="orden-detail-icon">📝</span>
                                            <div className="orden-detail-text">
                                                <strong>Motivo:</strong>
                                                <span>{cita.motivo}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="orden-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    {cita.estado === 'PROGRAMADA' && (
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => confirmarCita(cita.cita_id)}
                                            style={{ padding: '8px 16px' }}
                                        >
                                            ✓ Confirmar Asistencia
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => cancelarCita(cita.cita_id)}
                                        style={{ padding: '8px 16px' }}
                                    >
                                        ✗ Cancelar Cita
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">📅</div>
                        <p>No tienes citas activas en este momento</p>
                    </div>
                )}
            </div>

            {/* Vista de Servicios */}
            <div className="content-section">
                <h2>📋 Mis Órdenes de Servicio</h2>
                {ordenes.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔧</div>
                        <p>No tienes órdenes de servicio registradas</p>
                    </div>
                ) : (
                    <div className="ordenes-grid">
                        {ordenes.map((orden) => (
                            <div key={orden.orden_id} className="orden-card">
                                <div className="orden-header">
                                    <div className="orden-info">
                                        <h3>Orden #{orden.numero_orden || orden.orden_id.substring(0, 8)}</h3>
                                        <p className="orden-fecha">
                                            📅 {formatearFecha(orden.fecha_creacion)}
                                        </p>
                                    </div>
                                    <span className={`badge ${getEstadoBadgeClass(orden.estado)}`}>
                                        {orden.estado.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="orden-body">
                                    <div className="orden-detail">
                                        <span className="orden-detail-icon">🚗</span>
                                        <div className="orden-detail-text">
                                            <strong>Vehículo:</strong> <span>{orden.vehiculo_placa} - {orden.vehiculo_marca} {orden.vehiculo_modelo}</span>
                                        </div>
                                    </div>
                                    {orden.diagnostico && (
                                        <div className="orden-detail">
                                            <span className="orden-detail-icon">🔍</span>
                                            <div className="orden-detail-text">
                                                <strong>Diagnóstico:</strong> <span>{orden.diagnostico}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {orden.servicios && orden.servicios.length > 0 && (
                                    <div className="servicios-box">
                                        <strong>🔧 Servicios realizados:</strong>
                                        <ul className="servicios-list">
                                            {orden.servicios.map((servicio, idx) => (
                                                <li key={idx}>
                                                    {servicio.nombre || servicio.descripcion} - {formatCurrency(servicio.costo || 0)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="orden-footer">
                                    <span className="orden-total">
                                        Total: {formatCurrency(orden.costo_total || 0)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Confirmación */}
            {showConfirmModal && confirmAction && (
                <div className="modal">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>{confirmAction.title}</h2>
                            <button className="close-btn" onClick={() => {
                                setShowConfirmModal(false);
                                setConfirmAction(null);
                            }}>×</button>
                        </div>

                        <div style={{ padding: '20px 0' }}>
                            <p style={{ fontSize: '16px', textAlign: 'center' }}>
                                {confirmAction.message}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setConfirmAction(null);
                                }}
                                className="btn btn-secondary"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={ejecutarAccion}
                                className={`btn ${confirmAction.confirmClass}`}
                            >
                                {confirmAction.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistorialCliente;
