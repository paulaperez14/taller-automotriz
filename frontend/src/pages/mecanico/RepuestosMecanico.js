import React, { useState, useEffect } from 'react';
import { repuestoService } from '../../services';

const Repuestos = () => {
    const [repuestos, setRepuestos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 10;

    useEffect(() => {
        loadRepuestos();
    }, []);

    const loadRepuestos = async () => {
        try {
            const response = await repuestoService.getAll();
            setRepuestos(response.data.data || []);
        } catch (error) {
            console.error('Error cargando repuestos:', error);
            setRepuestos([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        }).format(amount);
    };

    if (loading) return <div className="loading">Cargando repuestos...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Repuestos e Inventario</h1>
                <div style={{ padding: '8px 16px', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '14px', color: '#1976d2' }}>
                    📖 Vista de solo lectura
                </div>
            </div>
            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {repuestos.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center' }}>No hay repuestos en inventario</td>
                            </tr>
                        ) : (
                            repuestos
                                .slice((paginaActual - 1) * itemsPorPagina, paginaActual * itemsPorPagina)
                                .map((repuesto) => (
                                    <tr key={repuesto.repuesto_id}>
                                        <td>{repuesto.codigo}</td>
                                        <td>{repuesto.nombre}</td>
                                        <td>{repuesto.descripcion}</td>
                                        <td>{formatCurrency(repuesto.precio_venta)}</td>
                                        <td>
                                            <span className={repuesto.stock_actual < repuesto.stock_minimo ? 'text-danger' : ''}>
                                                {repuesto.stock_actual}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-primary btn-sm">👁️ Ver</button>
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
                    Página {paginaActual} de {Math.ceil(repuestos.length / itemsPorPagina) || 1} | Total: {repuestos.length} registros
                </span>
                <button
                    onClick={() => setPaginaActual(prev => prev + 1)}
                    disabled={repuestos.length === 0 || paginaActual >= Math.ceil(repuestos.length / itemsPorPagina)}
                    className="btn btn-secondary btn-sm"
                >
                    Siguiente →
                </button>
            </div>
        </div>
    );
};

export default Repuestos;
