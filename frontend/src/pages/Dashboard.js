import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services';
import './Dashboard.css';

const Dashboard = () => {
    const [resumen, setResumen] = useState(null);
    const [estadisticasIngresos, setEstadisticasIngresos] = useState(null);
    const [citasProximas, setCitasProximas] = useState([]);
    const [estadisticasMensuales, setEstadisticasMensuales] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });

    useEffect(() => {
        loadDashboard();
    }, []);

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => {
            setAlert({ show: false, type: '', message: '' });
        }, 4000);
    };

    const loadDashboard = async () => {
        try {
            const [resumenRes, ingresosRes, citasRes] = await Promise.allSettled([
                dashboardService.getResumen(),
                dashboardService.getEstadisticasIngresos(),
                dashboardService.getCitasPendientes()
            ]);

            // Cargar resumen
            if (resumenRes.status === 'fulfilled') {
                setResumen(resumenRes.value.data);

                // Calcular estadísticas mensuales desde el resumen
                const data = resumenRes.value.data;
                setEstadisticasMensuales({
                    citas_mes: data.citas?.total_mes || 0,
                    ordenes_mes: data.ordenes?.total_mes || 0,
                    citas_completadas_mes: data.citas?.completadas_mes || 0,
                    ordenes_completadas_mes: data.ordenes?.completadas_mes || 0
                });
            }

            // Solo establecer estadísticas de ingresos si existen datos
            if (ingresosRes.status === 'fulfilled' && ingresosRes.value.data && ingresosRes.value.data.total_facturado > 0) {
                setEstadisticasIngresos(ingresosRes.value.data);
            } else {
                setEstadisticasIngresos(null);
            }

            // Cargar citas próximas
            if (citasRes.status === 'fulfilled' && citasRes.value.data) {
                const citas = citasRes.value.data.citas || citasRes.value.data.data || [];
                setCitasProximas(citas);
            }
        } catch (error) {
            console.error('Error cargando dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Cargando dashboard...</div>;
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        }).format(amount);
    };

    return (
        <div className="dashboard">
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

            <h1>Dashboard</h1>

            {/* Estadísticas principales - siempre mostrar */}
            {resumen && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📅</div>
                        <div className="stat-info">
                            <h3>Citas Próximas</h3>
                            <p className="stat-number">{resumen.citas?.total || 0}</p>
                            <p className="stat-label">{resumen.citas?.pendientes || 0} pendientes</p>
                        </div>
                    </div>

                    {/* Citas del Mes */}
                    <div className="stat-card">
                        <div className="stat-icon">📅</div>
                        <div className="stat-info">
                            <h3>Citas del Mes</h3>
                            <p className="stat-number">{resumen.citas?.total_mes || 0}</p>
                            <p className="stat-label">{resumen.citas?.completadas_mes || 0} completadas</p>
                        </div>
                    </div>

                    {/* Citas Canceladas del Mes */}
                    <div className="stat-card">
                        <div className="stat-icon">❌</div>
                        <div className="stat-info">
                            <h3>Citas Canceladas</h3>
                            <p className="stat-number">{resumen.citas?.canceladas_mes || 0}</p>
                            <p className="stat-label">este mes</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🔧</div>
                        <div className="stat-info">
                            <h3>Órdenes Activas</h3>
                            <p className="stat-number">{resumen.ordenes?.total || 0}</p>
                            <p className="stat-label">{resumen.ordenes?.en_proceso || 0} en proceso</p>
                        </div>
                    </div>

                    {/* Órdenes del Mes */}
                    <div className="stat-card">
                        <div className="stat-icon">🔧</div>
                        <div className="stat-info">
                            <h3>Órdenes del Mes</h3>
                            <p className="stat-number">{resumen.ordenes?.total_mes || 0}</p>
                            <p className="stat-label">{resumen.ordenes?.completadas_mes || 0} completadas</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <h3>Clientes</h3>
                            <p className="stat-number">{resumen.clientes?.total || 0}</p>
                            <p className="stat-label">registrados</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🚗</div>
                        <div className="stat-info">
                            <h3>Vehículos</h3>
                            <p className="stat-number">{resumen.vehiculos?.total || 0}</p>
                            <p className="stat-label">en sistema</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <h3>Órdenes Este Mes</h3>
                            <p className="stat-number">{resumen.ordenes?.completadas_mes || 0}</p>
                            <p className="stat-label">completadas</p>
                        </div>
                    </div>

                    {resumen.facturas && resumen.facturas.total > 0 && (
                        <div className="stat-card">
                            <div className="stat-icon">💰</div>
                            <div className="stat-info">
                                <h3>Facturas</h3>
                                <p className="stat-number">{resumen.facturas.total}</p>
                                <p className="stat-label">
                                    {formatCurrency(resumen.facturas.monto_pendiente || 0)} pendiente
                                </p>
                            </div>
                        </div>
                    )}

                    {resumen.inventario && resumen.inventario.alertas > 0 && (
                        <div className="stat-card">
                            <div className="stat-icon">⚠️</div>
                            <div className="stat-info">
                                <h3>Alertas Inventario</h3>
                                <p className="stat-number">{resumen.inventario.alertas}</p>
                                <p className="stat-label">productos bajo stock</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Solo mostrar estadísticas de ingresos si hay datos */}
            {estadisticasIngresos && estadisticasIngresos.total_facturado > 0 && (
                <div className="card">
                    <h2>Estadísticas de Ingresos</h2>
                    <div className="ingresos-grid">
                        <div className="ingreso-item">
                            <label>Total Facturado</label>
                            <p className="amount">{formatCurrency(estadisticasIngresos.total_facturado)}</p>
                        </div>
                        <div className="ingreso-item">
                            <label>Total Cobrado</label>
                            <p className="amount success">{formatCurrency(estadisticasIngresos.total_cobrado)}</p>
                        </div>
                        <div className="ingreso-item">
                            <label>Pendiente de Cobro</label>
                            <p className="amount warning">{formatCurrency(estadisticasIngresos.pendiente_cobro)}</p>
                        </div>
                        <div className="ingreso-item">
                            <label>Ticket Promedio</label>
                            <p className="amount">{formatCurrency(estadisticasIngresos.ticket_promedio)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabla de Citas Próximas */}
            <div className="card" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <span style={{ fontSize: '24px', marginRight: '10px' }}>📅</span>
                    <h2 style={{ margin: 0 }}>Citas Próximas</h2>
                </div>
                {citasProximas && citasProximas.length > 0 ? (
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
                            {citasProximas.map((cita) => (
                                <tr key={cita.cita_id}>
                                    <td>{new Date(cita.fecha).toLocaleDateString('es-CO')}</td>
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
                                    <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {cita.motivo || '-'}
                                    </td>
                                    <td>
                                        <span className={`badge badge-${cita.estado?.toLowerCase()}`}>
                                            {cita.estado}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                            {cita.estado === 'PROGRAMADA' && (
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => window.location.href = '/citas'}
                                                    title="Ver citas"
                                                >
                                                    ✓ Asistió
                                                </button>
                                            )}
                                            {(cita.estado === 'PROGRAMADA' || cita.estado === 'CONFIRMADA') && (
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => window.location.href = '/citas'}
                                                    title="Ver citas"
                                                >
                                                    ✗ Cancelar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        <p style={{ fontSize: '18px', marginBottom: '10px' }}>📭 No hay citas próximas</p>
                        <p style={{ fontSize: '14px' }}>Las citas programadas aparecerán aquí</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
