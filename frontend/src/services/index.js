import api from './api';

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.usuario));
        }
        return response.data;
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        }
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('authToken');
    }
};

export const clienteService = {
    getAll: () => api.get('/clientes', { params: { limit: 1000 } }),
    getById: (id) => api.get(`/clientes/${id}`),
    create: (data) => api.post('/clientes', data),
    update: (id, data) => api.put(`/clientes/${id}`, data),
    delete: (id) => api.delete(`/clientes/${id}`)
};

export const vehiculoService = {
    getAll: () => api.get('/vehiculos', { params: { limit: 1000 } }),
    getById: (id) => api.get(`/vehiculos/${id}`),
    getByCliente: (clienteId) => api.get(`/vehiculos/cliente/${clienteId}`),
    create: (data) => api.post('/vehiculos', data),
    update: (id, data) => api.put(`/vehiculos/${id}`, data),
    delete: (id) => api.delete(`/vehiculos/${id}`)
};

export const citaService = {
    getAll: () => api.get('/citas', { params: { limit: 1000 } }),
    getById: (id) => api.get(`/citas/${id}`),
    create: (data) => api.post('/citas', data),
    update: (id, data) => api.put(`/citas/${id}`, data),
    cancel: (id) => api.delete(`/citas/${id}`),
    confirmar: (id) => api.post(`/citas/${id}/confirmar`),
    completar: (id) => api.post(`/citas/${id}/completar`),
    cancelar: (id) => api.post(`/citas/${id}/cancelar`)
};

export const ordenService = {
    getAll: () => api.get('/ordenes', { params: { limit: 1000 } }),
    getById: (id) => api.get(`/ordenes/${id}`),
    create: (data) => api.post('/ordenes', data),
    update: (id, data) => api.put(`/ordenes/${id}`, data),
    actualizarEstado: (id, estado) => api.patch(`/ordenes/${id}/estado`, { estado }),
    actualizarDiagnostico: (id, diagnostico) => api.patch(`/ordenes/${id}/diagnostico`, { diagnostico }),
    agregarServicio: (id, servicio) => api.post(`/ordenes/${id}/servicios`, servicio),
    eliminarServicio: (id, servicioId) => api.delete(`/ordenes/${id}/servicios/${servicioId}`),
    actualizarEstadoServicio: (id, servicioId, estado) => api.patch(`/ordenes/${id}/servicios/${servicioId}/estado`, { estado }),
    calcularCosto: (id) => api.get(`/ordenes/${id}/costo`)
};

export const repuestoService = {
    getAll: () => api.get('/repuestos', { params: { limit: 1000 } }),
    getById: (id) => api.get(`/repuestos/${id}`),
    create: (data) => api.post('/repuestos', data),
    update: (id, data) => api.put(`/repuestos/${id}`, data),
    delete: (id) => api.delete(`/repuestos/${id}`)
};

export const dashboardService = {
    getResumen: () => api.get('/dashboard/resumen'),
    getEstadisticasIngresos: () => api.get('/dashboard/estadisticas/ingresos'),
    getEstadisticasServicios: () => api.get('/dashboard/estadisticas/servicios'),
    getCitasPendientes: () => api.get('/dashboard/citas/pendientes')
};

export const catalogoServicioService = {
    getAll: (params) => api.get('/servicios', { params }),
    getById: (id) => api.get(`/servicios/${id}`),
    getByCategoria: (categoria) => api.get(`/servicios/categoria/${categoria}`),
    getCategorias: () => api.get('/servicios/categorias'),
    create: (data) => api.post('/servicios', data),
    update: (id, data) => api.put(`/servicios/${id}`, data),
    delete: (id) => api.delete(`/servicios/${id}`),
    toggleActivo: (id) => api.patch(`/servicios/${id}/toggle-activo`)
};

