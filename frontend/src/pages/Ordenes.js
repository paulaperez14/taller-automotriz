import React, { useState, useEffect } from 'react';
import { ordenService, catalogoServicioService } from '../services';

const Ordenes = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [showDetalleModal, setShowDetalleModal] = useState(false);
    const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editDiagnostico, setEditDiagnostico] = useState('');
    const [showAgregarServicioModal, setShowAgregarServicioModal] = useState(false);
    const [catalogoServicios, setCatalogoServicios] = useState([]);
    const [servicioSeleccionado, setServicioSeleccionado] = useState('');
    const [nuevoServicio, setNuevoServicio] = useState({
        descripcion: '',
        costo_mano_obra: '',
        tiempo_estimado: ''
    });
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
        loadOrdenes();
        loadCatalogoServicios();
    }, []);

    const loadCatalogoServicios = async () => {
        try {
            const response = await catalogoServicioService.getAll({ activo: true });
            setCatalogoServicios(response.data.data || []);
        } catch (error) {
            console.error('Error cargando catálogo de servicios:', error);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => {
            setAlert({ show: false, type: '', message: '' });
        }, 4000);
    };

    const loadOrdenes = async () => {
        try {
            const response = await ordenService.getAll();
            const ordenesData = response.data.data || [];
            // Ordenar de más reciente a más antigua por fecha y hora de cita
            const ordenesSorted = ordenesData.sort((a, b) => {
                const fechaHoraA = new Date(`${a.cita_fecha || a.fecha_creacion}T${a.cita_hora || '00:00:00'}`);
                const fechaHoraB = new Date(`${b.cita_fecha || b.fecha_creacion}T${b.cita_hora || '00:00:00'}`);
                return fechaHoraB - fechaHoraA;
            });
            console.log('📋 Órdenes cargadas:', ordenesSorted.length, 'itemsPorPagina:', itemsPorPagina, 'Debe mostrar paginación:', ordenesSorted.length > itemsPorPagina);
            setOrdenes(ordenesSorted);
        } catch (error) {
            console.error('Error cargando órdenes:', error);
            showAlert('error', 'Error al cargar órdenes de servicio');
            setOrdenes([]);
        } finally {
            setLoading(false);
        }
    };

    const getEstadoBadgeClass = (estado) => {
        const classes = {
            'PENDIENTE': 'badge-programada',
            'EN_PROCESO': 'badge-confirmada',
            'FINALIZADO': 'badge-completada',
            'ENTREGADO': 'badge-completada'
        };
        return classes[estado] || 'badge-programada';
    };

    const verDetalle = async (ordenId) => {
        setLoadingDetalle(true);
        setShowDetalleModal(true);
        try {
            const response = await ordenService.getById(ordenId);
            setOrdenSeleccionada(response.data.data || response.data);
        } catch (error) {
            console.error('Error cargando detalle:', error);
            showAlert('error', 'Error al cargar detalles de la orden');
            setShowDetalleModal(false);
        } finally {
            setLoadingDetalle(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        }).format(amount);
    };

    const abrirModalEditar = (orden) => {
        setOrdenSeleccionada(orden);
        setEditDiagnostico(orden.diagnostico || '');
        setShowEditModal(true);
    };

    const actualizarDiagnostico = async () => {
        if (!editDiagnostico.trim()) {
            showAlert('error', 'El diagnóstico no puede estar vacío');
            return;
        }

        try {
            await ordenService.actualizarDiagnostico(ordenSeleccionada.orden_id, editDiagnostico);
            showAlert('success', 'Diagnóstico actualizado correctamente');
            setShowEditModal(false);
            loadOrdenes();
        } catch (error) {
            console.error('Error actualizando diagnóstico:', error);
            showAlert('error', 'Error al actualizar diagnóstico');
        }
    };

    const recargarOrden = async () => {
        try {
            const response = await ordenService.getById(ordenSeleccionada.orden_id);
            setOrdenSeleccionada(response.data.data || response.data);
            loadOrdenes();
        } catch (error) {
            console.error('Error recargando orden:', error);
        }
    };

    const eliminarServicio = async (servicioId) => {
        if (!window.confirm('¿Está seguro de eliminar este servicio?')) {
            return;
        }

        try {
            await ordenService.eliminarServicio(ordenSeleccionada.orden_id, servicioId);
            showAlert('success', 'Servicio eliminado correctamente');
            await recargarOrden();
        } catch (error) {
            console.error('Error eliminando servicio:', error);
            showAlert('error', error.response?.data?.error || 'Error al eliminar servicio');
        }
    };

    const abrirModalAgregarServicio = (orden) => {
        if (['FINALIZADO', 'ENTREGADO', 'CANCELADO'].includes(orden.estado)) {
            showAlert('error', `No se pueden agregar servicios a una orden en estado ${orden.estado}`);
            return;
        }
        setOrdenSeleccionada(orden);
        setServicioSeleccionado('');
        setNuevoServicio({ descripcion: '', costo_mano_obra: '', tiempo_estimado: '' });
        setShowAgregarServicioModal(true);
    };

    const handleSeleccionarServicio = (e) => {
        const servicioId = e.target.value;
        setServicioSeleccionado(servicioId);

        if (servicioId === 'personalizado') {
            setNuevoServicio({ descripcion: '', costo_mano_obra: '', tiempo_estimado: '' });
        } else if (servicioId) {
            const servicio = catalogoServicios.find(s => s.servicio_id === servicioId);
            if (servicio) {
                setNuevoServicio({
                    descripcion: `${servicio.nombre} - ${servicio.descripcion || ''}`.trim(),
                    costo_mano_obra: servicio.precio_base,
                    tiempo_estimado: Math.round(servicio.duracion_estimada / 60) || 1
                });
            }
        }
    };

    const agregarServicio = async () => {
        if (!nuevoServicio.descripcion.trim()) {
            showAlert('error', 'La descripción del servicio es requerida');
            return;
        }
        if (!nuevoServicio.costo_mano_obra || parseFloat(nuevoServicio.costo_mano_obra) <= 0) {
            showAlert('error', 'El costo debe ser mayor a 0');
            return;
        }
        if (!nuevoServicio.tiempo_estimado || parseInt(nuevoServicio.tiempo_estimado) <= 0) {
            showAlert('error', 'El tiempo estimado debe ser mayor a 0');
            return;
        }

        try {
            await ordenService.agregarServicio(ordenSeleccionada.orden_id, {
                descripcion: nuevoServicio.descripcion,
                costo_mano_obra: parseFloat(nuevoServicio.costo_mano_obra),
                tiempo_estimado: parseInt(nuevoServicio.tiempo_estimado)
            });
            showAlert('success', 'Servicio agregado correctamente');
            setShowAgregarServicioModal(false);
            setNuevoServicio({ descripcion: '', costo_mano_obra: '', tiempo_estimado: '' });

            // Recargar la orden actual si el modal de edición está abierto
            if (showEditModal) {
                await recargarOrden();
                setShowEditModal(true);
            } else {
                loadOrdenes();
            }
        } catch (error) {
            console.error('Error agregando servicio:', error);
            showAlert('error', 'Error al agregar servicio');
        }
    };

    const actualizarEstado = async (ordenId, nuevoEstado) => {
        try {
            await ordenService.actualizarEstado(ordenId, nuevoEstado);
            showAlert('success', 'Estado actualizado correctamente');
            loadOrdenes();
        } catch (error) {
            console.error('Error actualizando estado:', error);
            showAlert('error', error.response?.data?.error || 'Error al actualizar estado');
        }
    };

    if (loading) return <div className="loading">Cargando órdenes...</div>;

    return (
        <div>
            {/* Alerta */}
            {alert.show && (
                <div className={`alert alert-${alert.type} alert-fixed`}>
                    {alert.message}
                    <button
                        onClick={() => setAlert({ show: false, type: '', message: '' })}
                        className="alert-close-btn"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="page-header">
                <h1>Órdenes de Servicio</h1>
                <div className="read-only-badge">
                    📖 Vista de solo lectura
                </div>
            </div>

            <div className="card">
                <div className="info-section">
                    <p className="info-text">
                        Las órdenes se crean automáticamente cuando una cita es marcada como completada (✓ Asistió)
                    </p>
                </div>

                <table className="table">
                    <thead>
                        <tr>
                            <th>Orden #</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Vehículo</th>
                            <th>Estado</th>
                            <th>Servicio</th>
                            <th>Costo Total</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordenes.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center">
                                    No hay órdenes de servicio. Las órdenes se crean cuando confirmas la asistencia de una cita.
                                </td>
                            </tr>
                        ) : (
                            ordenes
                                .slice((paginaActual - 1) * itemsPorPagina, paginaActual * itemsPorPagina)
                                .map((orden, idx) => {
                                    const index = (paginaActual - 1) * itemsPorPagina + idx;
                                    return (
                                        <tr key={orden.orden_id}>
                                            <td><strong>#{orden.numero_orden || (index + 1).toString().padStart(4, '0')}</strong></td>
                                            <td>{formatearFecha(orden.fecha_creacion)}</td>
                                            <td>
                                                {orden.cliente_nombre && orden.cliente_apellido
                                                    ? `${orden.cliente_nombre} ${orden.cliente_apellido}`
                                                    : 'Sin cliente'}
                                            </td>
                                            <td>
                                                {orden.vehiculo_placa ? (
                                                    <>
                                                        <strong>{orden.vehiculo_placa}</strong>
                                                        {orden.vehiculo_marca && orden.vehiculo_modelo && (
                                                            <div className="vehicle-info-small">
                                                                {orden.vehiculo_marca} {orden.vehiculo_modelo}
                                                            </div>
                                                        )}
                                                    </>
                                                ) : 'Sin vehículo'}
                                            </td>
                                            <td>
                                                <span className={`badge ${getEstadoBadgeClass(orden.estado)}`}>
                                                    {orden.estado.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="cell-overflow">
                                                {orden.diagnostico || 'Sin especificar'}
                                            </td>
                                            <td>
                                                {formatCurrency(orden.costo_total || 0)}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => verDetalle(orden.orden_id)}
                                                    title="Ver detalles"
                                                >
                                                    👁️ Ver
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                }))
                        }
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
                    Página {paginaActual} de {Math.ceil(ordenes.length / itemsPorPagina) || 1} | Total: {ordenes.length} registros
                </span>
                <button
                    onClick={() => setPaginaActual(prev => Math.min(Math.ceil(ordenes.length / itemsPorPagina), prev + 1))}
                    disabled={paginaActual >= Math.ceil(ordenes.length / itemsPorPagina)}
                    className="btn btn-secondary btn-sm"
                >
                    Siguiente →
                </button>
            </div>

            {/* Modal de Detalles */}
            {showDetalleModal && (
                <div className="modal">
                    <div className="modal-content" style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h2>Detalles de la Orden de Servicio</h2>
                            <button className="close-btn" onClick={() => {
                                setShowDetalleModal(false);
                                setOrdenSeleccionada(null);
                            }}>×</button>
                        </div>

                        {loadingDetalle ? (
                            <div style={{ padding: '40px', textAlign: 'center' }}>
                                <p>Cargando detalles...</p>
                            </div>
                        ) : ordenSeleccionada ? (
                            <div style={{ padding: '20px' }}>
                                {/* Información General */}
                                <div style={{ marginBottom: '20px', padding: '15px', background: '#f7fafc', borderRadius: '8px' }}>
                                    <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Información General</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div>
                                            <strong>Estado:</strong>{' '}
                                            <span className={`badge ${getEstadoBadgeClass(ordenSeleccionada.estado)}`}>
                                                {ordenSeleccionada.estado.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div>
                                            <strong>Fecha:</strong>{' '}
                                            {formatearFecha(ordenSeleccionada.fecha_creacion)}
                                        </div>
                                        <div>
                                            <strong>Cliente:</strong>{' '}
                                            {ordenSeleccionada.cliente_nombre && ordenSeleccionada.cliente_apellido
                                                ? `${ordenSeleccionada.cliente_nombre} ${ordenSeleccionada.cliente_apellido}`
                                                : 'No especificado'}
                                        </div>
                                        <div>
                                            <strong>Teléfono:</strong>{' '}
                                            {ordenSeleccionada.cliente_telefono || 'No especificado'}
                                        </div>
                                        <div>
                                            <strong>Vehículo:</strong>{' '}
                                            {ordenSeleccionada.vehiculo_placa || 'No especificado'}
                                        </div>
                                        <div>
                                            <strong>Marca/Modelo:</strong>{' '}
                                            {ordenSeleccionada.vehiculo_marca && ordenSeleccionada.vehiculo_modelo
                                                ? `${ordenSeleccionada.vehiculo_marca} ${ordenSeleccionada.vehiculo_modelo}`
                                                : 'No especificado'}
                                        </div>
                                    </div>
                                </div>

                                {/* Diagnóstico */}
                                {ordenSeleccionada.diagnostico && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <h3 style={{ marginBottom: '10px' }}>Diagnóstico</h3>
                                        <div style={{ padding: '15px', background: '#f7fafc', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                                            {ordenSeleccionada.diagnostico}
                                        </div>
                                    </div>
                                )}

                                {/* Servicios */}
                                {ordenSeleccionada.servicios && ordenSeleccionada.servicios.length > 0 && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <h3 style={{ marginBottom: '10px' }}>Servicios Realizados</h3>
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Descripción</th>
                                                    <th>Estado</th>
                                                    <th>Costo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ordenSeleccionada.servicios.map((servicio) => (
                                                    <tr key={servicio.servicio_id}>
                                                        <td>{servicio.nombre || servicio.descripcion}</td>
                                                        <td>
                                                            <span className={`badge badge-${servicio.estado?.toLowerCase()}`}>
                                                                {servicio.estado}
                                                            </span>
                                                        </td>
                                                        <td>{formatCurrency(servicio.costo || 0)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Costo Total */}
                                <div style={{ textAlign: 'right', padding: '15px', background: '#edf2f7', borderRadius: '8px' }}>
                                    <strong style={{ fontSize: '18px' }}>
                                        Costo Total: {formatCurrency(ordenSeleccionada.costo_total || 0)}
                                    </strong>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center' }}>
                                <p>No se pudo cargar la información</p>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '15px', borderTop: '1px solid #e2e8f0' }}>
                            <button
                                onClick={() => {
                                    setShowDetalleModal(false);
                                    setOrdenSeleccionada(null);
                                }}
                                className="btn btn-secondary"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Editar Diagnóstico */}
            {showEditModal && ordenSeleccionada && (
                <div className="modal">
                    <div className="modal-content" style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h2>Editar Orden de Servicio</h2>
                            <button className="close-btn" onClick={() => {
                                setShowEditModal(false);
                                setOrdenSeleccionada(null);
                            }}>×</button>
                        </div>

                        <div style={{ padding: '20px' }}>
                            <div className="form-group">
                                <label>Diagnóstico *</label>
                                <textarea
                                    value={editDiagnostico}
                                    onChange={(e) => setEditDiagnostico(e.target.value)}
                                    rows="4"
                                    placeholder="Ingrese el diagnóstico detallado del vehículo"
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>

                            {/* Lista de servicios */}
                            <div style={{ marginTop: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <h3 style={{ margin: 0 }}>Servicios</h3>
                                    <button
                                        onClick={() => {
                                            setShowEditModal(false);
                                            abrirModalAgregarServicio(ordenSeleccionada);
                                        }}
                                        className="btn btn-success btn-sm"
                                        title="Agregar servicio"
                                    >
                                        ➕ Agregar Servicio
                                    </button>
                                </div>

                                {ordenSeleccionada.servicios && ordenSeleccionada.servicios.length > 0 ? (
                                    <table className="table" style={{ marginTop: '10px' }}>
                                        <thead>
                                            <tr>
                                                <th>Descripción</th>
                                                <th>Costo</th>
                                                <th>Horas</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ordenSeleccionada.servicios.map((servicio) => (
                                                <tr key={servicio.servicio_id}>
                                                    <td>{servicio.nombre || servicio.descripcion}</td>
                                                    <td>{formatCurrency(servicio.costo || 0)}</td>
                                                    <td>{servicio.horas_estimadas || '-'} hrs</td>
                                                    <td>
                                                        {ordenSeleccionada.servicios.length > 1 && (
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => eliminarServicio(servicio.servicio_id)}
                                                                title="Eliminar servicio"
                                                            >
                                                                🗑️
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p style={{ textAlign: 'center', color: '#666', padding: '20px', background: '#f7fafc', borderRadius: '8px' }}>
                                        No hay servicios registrados
                                    </p>
                                )}

                                {/* Costo Total */}
                                <div style={{ textAlign: 'right', marginTop: '15px', padding: '10px', background: '#edf2f7', borderRadius: '8px' }}>
                                    <strong style={{ fontSize: '16px' }}>
                                        Costo Total: {formatCurrency(ordenSeleccionada.costo_total || 0)}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '15px', borderTop: '1px solid #e2e8f0' }}>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setOrdenSeleccionada(null);
                                }}
                                className="btn btn-secondary"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={actualizarDiagnostico}
                                className="btn btn-primary"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Agregar Servicio */}
            {showAgregarServicioModal && ordenSeleccionada && (
                <div className="modal">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>Agregar Servicio</h2>
                            <button className="close-btn" onClick={() => {
                                setShowAgregarServicioModal(false);
                                setOrdenSeleccionada(null);
                                setServicioSeleccionado('');
                                setNuevoServicio({ descripcion: '', costo_mano_obra: '', tiempo_estimado: '' });
                            }}>×</button>
                        </div>

                        <div style={{ padding: '20px' }}>
                            <div className="form-group">
                                <label>Seleccionar Servicio del Catálogo</label>
                                <select
                                    value={servicioSeleccionado}
                                    onChange={handleSeleccionarServicio}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                                >
                                    <option value="">-- Seleccione un servicio --</option>
                                    {catalogoServicios.map(servicio => (
                                        <option key={servicio.servicio_id} value={servicio.servicio_id}>
                                            {servicio.codigo} - {servicio.nombre} ({new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(servicio.precio_base)})
                                        </option>
                                    ))}
                                    <option value="personalizado">➕ Servicio personalizado</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Descripción del Servicio *</label>
                                <textarea
                                    value={nuevoServicio.descripcion}
                                    onChange={(e) => setNuevoServicio({ ...nuevoServicio, descripcion: e.target.value })}
                                    rows="3"
                                    placeholder="Ej: Cambio de aceite y filtro"
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                                    disabled={servicioSeleccionado && servicioSeleccionado !== 'personalizado'}
                                />
                            </div>

                            <div className="form-group">
                                <label>Costo de Mano de Obra (COP) *</label>
                                <input
                                    type="number"
                                    value={nuevoServicio.costo_mano_obra}
                                    onChange={(e) => setNuevoServicio({ ...nuevoServicio, costo_mano_obra: e.target.value })}
                                    placeholder="50000"
                                    min="0"
                                    step="1000"
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Tiempo Estimado (horas) *</label>
                                <input
                                    type="number"
                                    value={nuevoServicio.tiempo_estimado}
                                    onChange={(e) => setNuevoServicio({ ...nuevoServicio, tiempo_estimado: e.target.value })}
                                    placeholder="2"
                                    min="1"
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '15px', borderTop: '1px solid #e2e8f0' }}>
                            <button
                                onClick={() => {
                                    setShowAgregarServicioModal(false);
                                    setOrdenSeleccionada(null);
                                    setNuevoServicio({ descripcion: '', costo_mano_obra: '', tiempo_estimado: '' });
                                }}
                                className="btn btn-secondary"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={agregarServicio}
                                className="btn btn-primary"
                            >
                                Agregar Servicio
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ordenes;
