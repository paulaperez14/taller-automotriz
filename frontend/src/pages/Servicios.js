import React, { useState, useEffect } from 'react';
import { catalogoServicioService } from '../services';

const Servicios = () => {
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedServicio, setSelectedServicio] = useState(null);
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroBusqueda, setFiltroBusqueda] = useState('');
    const [formData, setFormData] = useState({
        codigo: '',
        nombre: '',
        descripcion: '',
        categoria: 'MANTENIMIENTO',
        precio_base: '',
        duracion_estimada: '',
        activo: true
    });

    const categorias = [
        { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
        { value: 'REPARACION', label: 'Reparación' },
        { value: 'DIAGNOSTICO', label: 'Diagnóstico' },
        { value: 'PINTURA', label: 'Pintura' },
        { value: 'ELECTRICO', label: 'Eléctrico' },
        { value: 'OTROS', label: 'Otros' }
    ];

    useEffect(() => {
        loadServicios();
    }, [filtroCategoria]);

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => {
            setAlert({ show: false, type: '', message: '' });
        }, 4000);
    };

    const loadServicios = async () => {
        try {
            const params = {};
            if (filtroCategoria) params.categoria = filtroCategoria;
            if (filtroBusqueda) params.busqueda = filtroBusqueda;

            const response = await catalogoServicioService.getAll(params);
            setServicios(response.data.data || []);
        } catch (error) {
            console.error('Error cargando servicios:', error);
            showAlert('error', 'Error al cargar servicios');
            setServicios([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBuscar = () => {
        loadServicios();
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const abrirModalCrear = () => {
        setEditMode(false);
        setFormData({
            codigo: '',
            nombre: '',
            descripcion: '',
            categoria: 'MANTENIMIENTO',
            precio_base: '',
            duracion_estimada: '60',
            activo: true
        });
        setShowModal(true);
    };

    const abrirModalEditar = (servicio) => {
        setEditMode(true);
        setSelectedServicio(servicio);
        setFormData({
            codigo: servicio.codigo,
            nombre: servicio.nombre,
            descripcion: servicio.descripcion || '',
            categoria: servicio.categoria,
            precio_base: servicio.precio_base,
            duracion_estimada: servicio.duracion_estimada,
            activo: servicio.activo
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.codigo.trim() || !formData.nombre.trim()) {
            showAlert('error', 'Código y nombre son requeridos');
            return;
        }

        if (!formData.precio_base || parseFloat(formData.precio_base) < 0) {
            showAlert('error', 'El precio debe ser mayor o igual a 0');
            return;
        }

        if (!formData.duracion_estimada || parseInt(formData.duracion_estimada) < 1) {
            showAlert('error', 'La duración debe ser mayor a 0');
            return;
        }

        try {
            const data = {
                codigo: formData.codigo,
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                categoria: formData.categoria,
                precio_base: parseFloat(formData.precio_base),
                duracion_estimada: parseInt(formData.duracion_estimada),
                activo: formData.activo
            };

            if (editMode) {
                await catalogoServicioService.update(selectedServicio.servicio_id, data);
                showAlert('success', 'Servicio actualizado correctamente');
            } else {
                await catalogoServicioService.create(data);
                showAlert('success', 'Servicio creado correctamente');
            }

            setShowModal(false);
            loadServicios();
        } catch (error) {
            console.error('Error guardando servicio:', error);
            showAlert('error', error.response?.data?.error || 'Error al guardar servicio');
        }
    };

    const handleToggleActivo = async (servicio) => {
        try {
            await catalogoServicioService.toggleActivo(servicio.servicio_id);
            showAlert('success', `Servicio ${servicio.activo ? 'desactivado' : 'activado'} correctamente`);
            loadServicios();
        } catch (error) {
            console.error('Error cambiando estado:', error);
            showAlert('error', 'Error al cambiar estado del servicio');
        }
    };

    const handleEliminar = async (servicio) => {
        if (!window.confirm(`¿Está seguro de eliminar el servicio "${servicio.nombre}"?`)) {
            return;
        }

        try {
            await catalogoServicioService.delete(servicio.servicio_id);
            showAlert('success', 'Servicio eliminado correctamente');
            loadServicios();
        } catch (error) {
            console.error('Error eliminando servicio:', error);
            showAlert('error', 'Error al eliminar servicio');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getCategoriaLabel = (categoria) => {
        const cat = categorias.find(c => c.value === categoria);
        return cat ? cat.label : categoria;
    };

    const getCategoriaColor = (categoria) => {
        const colors = {
            'MANTENIMIENTO': '#3b82f6',
            'REPARACION': '#ef4444',
            'DIAGNOSTICO': '#8b5cf6',
            'PINTURA': '#f59e0b',
            'ELECTRICO': '#10b981',
            'OTROS': '#6b7280'
        };
        return colors[categoria] || '#6b7280';
    };

    if (loading) return <div className="loading">Cargando servicios...</div>;

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
                <h1>Catálogo de Servicios</h1>
                <button onClick={abrirModalCrear} className="btn btn-primary">
                    + Nuevo Servicio
                </button>
            </div>

            <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '15px', alignItems: 'end' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Categoría</label>
                        <select
                            value={filtroCategoria}
                            onChange={(e) => setFiltroCategoria(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                            <option value="">Todas</option>
                            {categorias.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Buscar</label>
                        <input
                            type="text"
                            value={filtroBusqueda}
                            onChange={(e) => setFiltroBusqueda(e.target.value)}
                            placeholder="Código, nombre o descripción..."
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
                        />
                    </div>
                    <button onClick={handleBuscar} className="btn btn-secondary">
                        🔍 Buscar
                    </button>
                </div>
            </div>

            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Precio Base</th>
                            <th>Duración</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {servicios.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center' }}>
                                    No hay servicios registrados
                                </td>
                            </tr>
                        ) : (
                            servicios.map((servicio) => (
                                <tr key={servicio.servicio_id}>
                                    <td><strong>{servicio.codigo}</strong></td>
                                    <td>
                                        {servicio.nombre}
                                        {servicio.descripcion && (
                                            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                                {servicio.descripcion}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            backgroundColor: `${getCategoriaColor(servicio.categoria)}20`,
                                            color: getCategoriaColor(servicio.categoria)
                                        }}>
                                            {getCategoriaLabel(servicio.categoria)}
                                        </span>
                                    </td>
                                    <td>{formatCurrency(servicio.precio_base)}</td>
                                    <td>{servicio.duracion_estimada} min</td>
                                    <td>
                                        <span className={`badge ${servicio.activo ? 'badge-confirmada' : 'badge-cancelada'}`}>
                                            {servicio.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-warning btn-sm"
                                            onClick={() => abrirModalEditar(servicio)}
                                            title="Editar"
                                            style={{ marginRight: '5px' }}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className={`btn ${servicio.activo ? 'btn-secondary' : 'btn-success'} btn-sm`}
                                            onClick={() => handleToggleActivo(servicio)}
                                            title={servicio.activo ? 'Desactivar' : 'Activar'}
                                            style={{ marginRight: '5px' }}
                                        >
                                            {servicio.activo ? '🚫' : '✅'}
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleEliminar(servicio)}
                                            title="Eliminar"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Crear/Editar */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>{editMode ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ padding: '20px' }}>
                                <div className="form-group">
                                    <label>Código *</label>
                                    <input
                                        type="text"
                                        name="codigo"
                                        value={formData.codigo}
                                        onChange={handleInputChange}
                                        placeholder="MANT-001"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Nombre *</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        placeholder="Cambio de aceite y filtro"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Descripción</label>
                                    <textarea
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="Descripción detallada del servicio"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Categoría *</label>
                                    <select
                                        name="categoria"
                                        value={formData.categoria}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {categorias.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div className="form-group">
                                        <label>Precio Base (COP) *</label>
                                        <input
                                            type="number"
                                            name="precio_base"
                                            value={formData.precio_base}
                                            onChange={handleInputChange}
                                            placeholder="50000"
                                            min="0"
                                            step="1000"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Duración (minutos) *</label>
                                        <input
                                            type="number"
                                            name="duracion_estimada"
                                            value={formData.duracion_estimada}
                                            onChange={handleInputChange}
                                            placeholder="60"
                                            min="1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '12px 16px',
                                        backgroundColor: '#f7fafc',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                        onClick={() => setFormData({ ...formData, activo: !formData.activo })}>
                                        <div style={{
                                            position: 'relative',
                                            width: '20px',
                                            height: '20px',
                                            marginRight: '12px',
                                            flexShrink: 0
                                        }}>
                                            <input
                                                type="checkbox"
                                                name="activo"
                                                checked={formData.activo}
                                                onChange={handleInputChange}
                                                style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    cursor: 'pointer',
                                                    accentColor: '#2563eb'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '500', color: '#1f2937', marginBottom: '2px' }}>
                                                Servicio activo
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                {formData.activo ? 'Este servicio estará disponible para selección' : 'Este servicio no aparecerá en las opciones'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '15px', borderTop: '1px solid #e2e8f0' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editMode ? 'Actualizar' : 'Crear'} Servicio
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Servicios;
