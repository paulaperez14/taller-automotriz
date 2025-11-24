import React, { useState, useEffect } from 'react';
import { citaService } from '../services';

const Citas = () => {
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedCita, setSelectedCita] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 10;

    // Función para formatear fecha sin problemas de zona horaria
    const formatearFecha = (fechaString) => {
        if (!fechaString) return '';
        const [año, mes, dia] = fechaString.split('T')[0].split('-');
        const fecha = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
        return fecha.toLocaleDateString('es-CO');
    };

    useEffect(() => {
        loadCitas();
    }, []);

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => {
            setAlert({ show: false, type: '', message: '' });
        }, 4000);
    };

    const loadCitas = async () => {
        try {
            const response = await citaService.getAll();
            const data = response.data.data || [];
            console.log('📅 Citas cargadas:', data.length, 'itemsPorPagina:', itemsPorPagina, 'Debe mostrar paginación:', data.length > itemsPorPagina);
            setCitas(data);
        } catch (error) {
            console.error('Error cargando citas:', error);
            setCitas([]);
        } finally {
            setLoading(false);
        }
    };

    const confirmarAsistencia = (citaId) => {
        setConfirmAction({
            citaId,
            action: 'confirmar',
            title: '✓ Confirmar Asistencia',
            message: '¿Confirmar que el cliente asistió a la cita?',
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
            message: '¿Está seguro de cancelar esta cita?',
            confirmText: 'Sí, Cancelar',
            confirmClass: 'btn-danger'
        });
        setShowConfirmModal(true);
    };

    const verDetalle = (cita) => {
        setSelectedCita(cita);
        setShowDetailModal(true);
    };

    const ejecutarAccion = async () => {
        try {
            if (confirmAction.action === 'confirmar') {
                const response = await citaService.completar(confirmAction.citaId);
                showAlert('success', 'Asistencia marcada exitosamente. Orden de servicio creada.');
                await loadCitas();
            } else if (confirmAction.action === 'cancelar') {
                await citaService.cancelar(confirmAction.citaId);
                showAlert('success', 'Cita cancelada exitosamente');
                await loadCitas();
            }
        } catch (error) {
            console.error('Error ejecutando acción:', error);
            showAlert('error', 'Error al procesar la acción: ' + (error.response?.data?.error || error.message));
        } finally {
            setShowConfirmModal(false);
            setConfirmAction(null);
        }
    };

    if (loading) return <div className="loading">Cargando citas...</div>;

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

            <h1>Citas</h1>
            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Cliente</th>
                            <th>Vehículo</th>
                            <th>Motivo</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {citas.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center' }}>No hay citas programadas</td>
                            </tr>
                        ) : (
                            citas
                                .slice((paginaActual - 1) * itemsPorPagina, paginaActual * itemsPorPagina)
                                .map((cita) => (
                                    <tr key={cita.cita_id}>
                                        <td>{formatearFecha(cita.fecha)}</td>
                                        <td>{cita.hora?.substring(0, 5)}</td>
                                        <td>
                                            {cita.cliente_nombre && cita.cliente_apellido
                                                ? `${cita.cliente_nombre} ${cita.cliente_apellido}`
                                                : '-'}
                                            {cita.cliente_telefono && (
                                                <div style={{ fontSize: '12px', color: '#666' }}>
                                                    {cita.cliente_telefono}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {cita.vehiculo_placa ? (
                                                <>
                                                    <strong>{cita.vehiculo_placa}</strong>
                                                    {(cita.vehiculo_marca || cita.vehiculo_modelo) && (
                                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                                            {cita.vehiculo_marca} {cita.vehiculo_modelo}
                                                        </div>
                                                    )}
                                                </>
                                            ) : '-'}
                                        </td>
                                        <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {cita.motivo || '-'}
                                        </td>
                                        <td>
                                            <span className={`badge badge-${cita.estado?.toLowerCase()}`}>
                                                {cita.estado}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                                <button
                                                    className="btn btn-info btn-sm"
                                                    onClick={() => verDetalle(cita)}
                                                    title="Ver detalle completo"
                                                >
                                                    👁️ Detalle
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
                    onClick={() => {
                        console.log('Click Anterior, página actual:', paginaActual);
                        setPaginaActual(prev => {
                            const nueva = Math.max(1, prev - 1);
                            console.log('Nueva página:', nueva);
                            return nueva;
                        });
                    }}
                    disabled={paginaActual === 1}
                    className="btn btn-secondary btn-sm"
                >
                    ← Anterior
                </button>
                <span className="pagination-info">
                    Página {paginaActual} de {Math.ceil(citas.length / itemsPorPagina) || 1} | Total: {citas.length} registros
                </span>
                <button
                    onClick={() => {
                        console.log('Click Siguiente, página actual:', paginaActual, 'Total páginas:', Math.ceil(citas.length / itemsPorPagina));
                        setPaginaActual(prev => {
                            const nueva = prev + 1;
                            console.log('Nueva página:', nueva);
                            return nueva;
                        });
                    }}
                    disabled={citas.length === 0 || paginaActual >= Math.ceil(citas.length / itemsPorPagina)}
                    className="btn btn-secondary btn-sm"
                >
                    Siguiente →
                </button>
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

            {/* Modal de Detalle */}
            {showDetailModal && selectedCita && (
                <div className="modal">
                    <div className="modal-content" style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h2>📋 Detalle Completo de la Cita</h2>
                            <button className="close-btn" onClick={() => {
                                setShowDetailModal(false);
                                setSelectedCita(null);
                            }}>×</button>
                        </div>

                        <div style={{ padding: '20px' }}>
                            {/* Estado */}
                            <div style={{
                                marginBottom: '25px',
                                padding: '15px',
                                backgroundColor: '#f7fafc',
                                borderRadius: '8px',
                                borderLeft: `4px solid ${selectedCita.estado === 'COMPLETADA' ? '#48bb78' :
                                    selectedCita.estado === 'CONFIRMADA' ? '#4299e1' :
                                        selectedCita.estado === 'CANCELADA' ? '#e53e3e' : '#ed8936'
                                    }`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Estado:</span>
                                    <span className={`badge badge-${selectedCita.estado?.toLowerCase()}`} style={{ fontSize: '14px', padding: '8px 16px' }}>
                                        {selectedCita.estado}
                                    </span>
                                </div>
                            </div>

                            {/* Información de la Cita */}
                            <div style={{ marginBottom: '25px' }}>
                                <h3 style={{ color: '#2d3748', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>
                                    📅 Información de la Cita
                                </h3>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#718096', fontWeight: '500' }}>Fecha:</span>
                                        <span style={{ fontWeight: 'bold', color: '#2d3748' }}>
                                            {(() => {
                                                const [año, mes, dia] = selectedCita.fecha.split('T')[0].split('-');
                                                const fecha = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
                                                return fecha.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                                            })()}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#718096', fontWeight: '500' }}>Hora:</span>
                                        <span style={{ fontWeight: 'bold', color: '#2d3748', fontSize: '18px' }}>{selectedCita.hora?.substring(0, 5)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#718096', fontWeight: '500' }}>Duración Estimada:</span>
                                        <span style={{ fontWeight: 'bold', color: '#2d3748' }}>{selectedCita.duracion_estimada || 60} minutos</span>
                                    </div>
                                    {selectedCita.sede_id && (() => {
                                        const sedes = [
                                            { id: 1, nombre: 'Sede Norte', direccion: 'Calle 100 # 15-30, Bogotá', telefono: '(601) 234-5678' },
                                            { id: 2, nombre: 'Sede Sur', direccion: 'Carrera 30 # 45-20, Bogotá', telefono: '(601) 234-5679' },
                                            { id: 3, nombre: 'Sede Occidente', direccion: 'Avenida 68 # 25-10, Bogotá', telefono: '(601) 234-5680' },
                                            { id: 4, nombre: 'Sede Oriente', direccion: 'Calle 45 # 70-15, Bogotá', telefono: '(601) 234-5681' }
                                        ];
                                        const sede = sedes.find(s => s.id === parseInt(selectedCita.sede_id));
                                        return sede ? (
                                            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <span style={{ color: '#718096', fontWeight: '500' }}>📍 Sede:</span>
                                                    <span style={{ fontWeight: 'bold', color: '#2d3748' }}>{sede.nombre}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <span style={{ color: '#718096', fontWeight: '500' }}>Dirección:</span>
                                                    <span style={{ fontWeight: 'bold', color: '#2d3748' }}>{sede.direccion}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#718096', fontWeight: '500' }}>Teléfono:</span>
                                                    <span style={{ fontWeight: 'bold', color: '#2d3748' }}>{sede.telefono}</span>
                                                </div>
                                            </div>
                                        ) : null;
                                    })()}
                                </div>
                            </div>

                            {/* Información del Cliente */}
                            <div style={{ marginBottom: '25px' }}>
                                <h3 style={{ color: '#2d3748', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>
                                    👤 Información del Cliente
                                </h3>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {(selectedCita.cliente_nombre || selectedCita.cliente_apellido) && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#718096', fontWeight: '500' }}>Nombre:</span>
                                            <span style={{ fontWeight: 'bold', color: '#2d3748' }}>
                                                {selectedCita.cliente_nombre} {selectedCita.cliente_apellido}
                                            </span>
                                        </div>
                                    )}
                                    {selectedCita.cliente_telefono && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#718096', fontWeight: '500' }}>Teléfono:</span>
                                            <span style={{ fontWeight: 'bold', color: '#4299e1' }}>📞 {selectedCita.cliente_telefono}</span>
                                        </div>
                                    )}
                                    {selectedCita.cliente_email && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#718096', fontWeight: '500' }}>Email:</span>
                                            <span style={{ fontWeight: 'bold', color: '#4299e1' }}>✉️ {selectedCita.cliente_email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Información del Vehículo */}
                            <div style={{ marginBottom: '25px' }}>
                                <h3 style={{ color: '#2d3748', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>
                                    🚗 Información del Vehículo
                                </h3>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {selectedCita.vehiculo_placa && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#718096', fontWeight: '500' }}>Placa:</span>
                                            <span style={{
                                                fontWeight: 'bold',
                                                color: '#2d3748',
                                                fontSize: '20px',
                                                padding: '5px 15px',
                                                backgroundColor: '#ffd700',
                                                borderRadius: '4px',
                                                border: '2px solid #2d3748'
                                            }}>
                                                {selectedCita.vehiculo_placa}
                                            </span>
                                        </div>
                                    )}
                                    {(selectedCita.vehiculo_marca || selectedCita.vehiculo_modelo) && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#718096', fontWeight: '500' }}>Marca/Modelo:</span>
                                            <span style={{ fontWeight: 'bold', color: '#2d3748' }}>
                                                {selectedCita.vehiculo_marca} {selectedCita.vehiculo_modelo}
                                            </span>
                                        </div>
                                    )}
                                    {selectedCita.vehiculo_anio && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#718096', fontWeight: '500' }}>Año:</span>
                                            <span style={{ fontWeight: 'bold', color: '#2d3748' }}>{selectedCita.vehiculo_anio}</span>
                                        </div>
                                    )}
                                    {selectedCita.vehiculo_color && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#718096', fontWeight: '500' }}>Color:</span>
                                            <span style={{ fontWeight: 'bold', color: '#2d3748' }}>{selectedCita.vehiculo_color}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Motivo */}
                            {selectedCita.motivo && (
                                <div style={{ marginBottom: '25px' }}>
                                    <h3 style={{ color: '#2d3748', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>
                                        📝 Motivo de la Cita
                                    </h3>
                                    <div style={{
                                        padding: '15px',
                                        backgroundColor: '#fff5e6',
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #f59e0b'
                                    }}>
                                        <p style={{ margin: 0, color: '#2d3748', lineHeight: '1.6' }}>
                                            {selectedCita.motivo}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div>
                                <h3 style={{ color: '#2d3748', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>
                                    🕐 Información de Registro
                                </h3>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {selectedCita.created_at && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#718096', fontWeight: '500' }}>Creada:</span>
                                            <span style={{ color: '#2d3748', fontSize: '12px' }}>
                                                {new Date(selectedCita.created_at).toLocaleString('es-CO')}
                                            </span>
                                        </div>
                                    )}
                                    {selectedCita.updated_at && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#718096', fontWeight: '500' }}>Última Actualización:</span>
                                            <span style={{ color: '#2d3748', fontSize: '12px' }}>
                                                {new Date(selectedCita.updated_at).toLocaleString('es-CO')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '15px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setShowDetailModal(false);
                                    setSelectedCita(null);
                                }}
                                className="btn btn-primary"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Citas;
