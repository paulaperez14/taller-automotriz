const axios = require('axios');
const IndicadorRepository = require('../../domain/repositories/IndicadorRepository');

class DashboardService {
    constructor() {
        // URLs de los microservicios
        this.AGENDAMIENTO_URL = process.env.AGENDAMIENTO_URL || 'http://ms-agendamiento:3002';
        this.REPARACIONES_URL = process.env.REPARACIONES_URL || 'http://ms-reparaciones:3003';
        this.REPUESTOS_URL = process.env.REPUESTOS_URL || 'http://ms-repuestos:3004';
        this.FACTURACION_URL = process.env.FACTURACION_URL || 'http://ms-facturacion-pagos:3006';
    }

    /**
     * Obtener resumen general del dashboard
     */
    async obtenerResumen() {
        try {
            // Obtener datos de todos los microservicios en paralelo
            const [citas, citasCompletadas, ordenes, ordenesCompletadas, facturas, inventario, clientes, vehiculos] = await Promise.allSettled([
                this._obtenerCitasProximas(),
                this._obtenerCitasCompletadasMes(),
                this._obtenerOrdenesActivas(),
                this._obtenerOrdenesCompletadasMes(),
                this._obtenerFacturasPendientes(),
                this._obtenerAlertasInventario(),
                this._obtenerTotalClientes(),
                this._obtenerTotalVehiculos()
            ]);

            const resumen = {
                fecha: new Date().toISOString().split('T')[0],
                citas: {
                    total: citas.status === 'fulfilled' ? citas.value.length : 0,
                    pendientes: citas.status === 'fulfilled' ?
                        citas.value.filter(c => c.estado === 'PROGRAMADA').length : 0,
                    completadas_mes: citasCompletadas.status === 'fulfilled' ? citasCompletadas.value : 0
                },
                ordenes: {
                    total: ordenes.status === 'fulfilled' ? ordenes.value.length : 0,
                    en_proceso: ordenes.status === 'fulfilled' ?
                        ordenes.value.filter(o => o.estado === 'EN_PROCESO').length : 0,
                    completadas_mes: ordenesCompletadas.status === 'fulfilled' ? ordenesCompletadas.value : 0
                },
                facturas: {
                    total: facturas.status === 'fulfilled' ? facturas.value.length : 0,
                    monto_pendiente: facturas.status === 'fulfilled' ?
                        facturas.value.reduce((acc, f) => acc + parseFloat(f.total || 0), 0) : 0
                },
                inventario: {
                    alertas: inventario.status === 'fulfilled' ? inventario.value.length : 0
                },
                clientes: {
                    total: clientes.status === 'fulfilled' ? clientes.value : 0
                },
                vehiculos: {
                    total: vehiculos.status === 'fulfilled' ? vehiculos.value : 0
                }
            };

            return resumen;
        } catch (error) {
            console.error('Error al obtener resumen:', error.message);
            throw new Error('No se pudo obtener el resumen del dashboard');
        }
    }

    /**
     * Obtener indicadores almacenados
     */
    async obtenerIndicadores(tipo, periodo) {
        const filtros = {};
        if (tipo) filtros.tipo = tipo;
        if (periodo) filtros.periodo = periodo;

        return await IndicadorRepository.findAll(filtros);
    }

    /**
     * Obtener estadísticas de servicios
     */
    async obtenerEstadisticasServicios(fechaInicio, fechaFin) {
        try {
            // En un escenario real, consultaríamos ms-reparaciones
            // Por ahora retornamos datos mock
            return {
                periodo: {
                    inicio: fechaInicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    fin: fechaFin || new Date().toISOString().split('T')[0]
                },
                total_servicios: 45,
                por_tipo: {
                    REPARACION: 28,
                    MANTENIMIENTO_PREVENTIVO: 12,
                    DIAGNOSTICO: 5
                },
                tiempo_promedio_horas: 4.5,
                servicios_completados: 40,
                servicios_cancelados: 5
            };
        } catch (error) {
            console.error('Error al obtener estadísticas de servicios:', error.message);
            throw error;
        }
    }

    /**
     * Obtener estadísticas de ingresos
     */
    async obtenerEstadisticasIngresos(fechaInicio, fechaFin) {
        try {
            const response = await axios.get(`${this.FACTURACION_URL}/api/facturas`, {
                timeout: 5000
            });

            const facturas = response.data.data || response.data.facturas || [];

            if (facturas.length === 0) {
                return null; // No hay facturas, retornar null para que el frontend no muestre la sección
            }

            const totalFacturado = facturas.reduce((acc, f) => acc + parseFloat(f.total || 0), 0);
            const facturasCompletas = facturas.filter(f => f.estado === 'PAGADA' || f.estado === 'COMPLETADA');
            const totalCobrado = facturasCompletas.reduce((acc, f) => acc + parseFloat(f.total || 0), 0);
            const pendienteCobro = totalFacturado - totalCobrado;
            const ticketPromedio = facturas.length > 0 ? totalFacturado / facturas.length : 0;

            return {
                periodo: {
                    inicio: fechaInicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    fin: fechaFin || new Date().toISOString().split('T')[0]
                },
                total_facturado: totalFacturado,
                total_cobrado: totalCobrado,
                pendiente_cobro: pendienteCobro,
                numero_facturas: facturas.length,
                ticket_promedio: ticketPromedio
            };
        } catch (error) {
            console.error('Error al obtener estadísticas de ingresos:', error.message);
            return null; // Retornar null si hay error
        }
    }

    /**
     * Obtener estadísticas de inventario
     */
    async obtenerEstadisticasInventario() {
        try {
            return {
                total_repuestos: 150,
                bajo_stock: 12,
                sin_stock: 3,
                valor_inventario: 45000000,
                movimientos_mes: {
                    ENTRADA: 85,
                    SALIDA: 142
                }
            };
        } catch (error) {
            console.error('Error al obtener estadísticas de inventario:', error.message);
            throw error;
        }
    }

    /**
     * Obtener citas pendientes
     */
    async obtenerCitasPendientes() {
        try {
            const response = await axios.get(`${this.AGENDAMIENTO_URL}/api/citas`, {
                timeout: 5000
            });

            const citas = response.data.data || response.data.citas || [];
            return citas.filter(c =>
                c.estado === 'PROGRAMADA' || c.estado === 'CONFIRMADA'
            );
        } catch (error) {
            console.warn('No se pudieron obtener citas:', error.message);
            return [];
        }
    }

    /**
     * Obtener órdenes activas
     */
    async obtenerOrdenesActivas() {
        try {
            const response = await axios.get(`${this.REPARACIONES_URL}/api/ordenes`, {
                timeout: 5000
            });

            const ordenes = response.data.data || response.data.ordenes || [];
            return ordenes.filter(o =>
                o.estado === 'PENDIENTE' || o.estado === 'EN_PROCESO'
            );
        } catch (error) {
            console.warn('No se pudieron obtener órdenes:', error.message);
            return [];
        }
    }

    /**
     * Obtener facturas pendientes
     */
    async obtenerFacturasPendientes() {
        try {
            const response = await axios.get(`${this.FACTURACION_URL}/api/facturas`, {
                timeout: 5000
            });

            const facturas = response.data.data || response.data.facturas || [];
            return facturas.filter(f => f.estado === 'PENDIENTE' || f.estado === 'EMITIDA');
        } catch (error) {
            console.warn('No se pudieron obtener facturas:', error.message);
            return [];
        }
    }

    // Métodos privados auxiliares
    async _obtenerCitasDelDia() {
        try {
            const hoy = new Date().toISOString().split('T')[0];
            const response = await axios.get(`${this.AGENDAMIENTO_URL}/api/citas?fecha=${hoy}`, {
                timeout: 5000
            });
            return response.data.data || response.data.citas || [];
        } catch (error) {
            return [];
        }
    }

    async _obtenerCitasProximas() {
        try {
            const response = await axios.get(`${this.AGENDAMIENTO_URL}/api/citas?limit=100`, {
                timeout: 5000
            });
            const todasCitas = response.data.data || response.data.citas || [];
            const ahora = new Date();

            // Filtrar solo citas programadas o confirmadas y que sean futuras
            return todasCitas.filter(cita => {
                if (cita.estado !== 'PROGRAMADA' && cita.estado !== 'CONFIRMADA') return false;

                // Extraer solo la fecha (YYYY-MM-DD) de la fecha ISO
                const soloFecha = cita.fecha.split('T')[0];
                const fechaCita = new Date(soloFecha + 'T' + cita.hora);
                return fechaCita >= ahora;
            });
        } catch (error) {
            console.error('Error obteniendo citas próximas:', error.message);
            return [];
        }
    }

    async _obtenerOrdenesActivas() {
        try {
            const response = await axios.get(`${this.REPARACIONES_URL}/api/ordenes`, {
                timeout: 5000
            });
            const ordenes = response.data.data || response.data.ordenes || [];
            return ordenes.filter(o =>
                o.estado === 'PENDIENTE' || o.estado === 'EN_PROCESO'
            );
        } catch (error) {
            console.warn('No se pudieron obtener órdenes:', error.message);
            return [];
        }
    }

    async _obtenerFacturasPendientes() {
        try {
            const response = await axios.get(`${this.FACTURACION_URL}/api/facturas`, {
                timeout: 5000
            });
            const facturas = response.data.data || response.data.facturas || [];
            return facturas.filter(f => f.estado === 'PENDIENTE' || f.estado === 'EMITIDA');
        } catch (error) {
            return [];
        }
    }

    async _obtenerAlertasInventario() {
        try {
            const response = await axios.get(`${this.REPUESTOS_URL}/api/repuestos`, {
                timeout: 5000
            });
            const repuestos = response.data.data || response.data.repuestos || [];
            // Filtrar repuestos con stock bajo (ejemplo: menos de 10 unidades)
            return repuestos.filter(r => parseInt(r.stock_actual || 0) < parseInt(r.stock_minimo || 10));
        } catch (error) {
            return [];
        }
    }

    async _obtenerCitasCompletadasMes() {
        try {
            const response = await axios.get(`${this.AGENDAMIENTO_URL}/api/citas?limit=500`, {
                timeout: 5000
            });
            const todasCitas = response.data.data || response.data.citas || [];
            const inicioMes = new Date();
            inicioMes.setDate(1);
            inicioMes.setHours(0, 0, 0, 0);

            return todasCitas.filter(cita => {
                if (cita.estado !== 'COMPLETADA') return false;
                const fechaCita = new Date(cita.fecha);
                return fechaCita >= inicioMes;
            }).length;
        } catch (error) {
            return 0;
        }
    }

    async _obtenerOrdenesCompletadasMes() {
        try {
            const response = await axios.get(`${this.REPARACIONES_URL}/api/ordenes?limit=500`, {
                timeout: 5000
            });
            const todasOrdenes = response.data.data || response.data.ordenes || [];
            const inicioMes = new Date();
            inicioMes.setDate(1);
            inicioMes.setHours(0, 0, 0, 0);

            return todasOrdenes.filter(orden => {
                // Contar tanto FINALIZADO como ENTREGADO como completadas
                if (orden.estado !== 'FINALIZADO' && orden.estado !== 'ENTREGADO') return false;
                const fechaCreacion = new Date(orden.fecha_creacion);
                return fechaCreacion >= inicioMes;
            }).length;
        } catch (error) {
            return 0;
        }
    }

    async _obtenerTotalClientes() {
        try {
            const CLIENTES_URL = process.env.CLIENTES_URL || 'http://ms-clientes-vehiculos:3005';
            const response = await axios.get(`${CLIENTES_URL}/api/clientes?limit=10000`, {
                timeout: 5000
            });
            const clientes = response.data.data || [];
            return clientes.length;
        } catch (error) {
            return 0;
        }
    }

    async _obtenerTotalVehiculos() {
        try {
            const CLIENTES_URL = process.env.CLIENTES_URL || 'http://ms-clientes-vehiculos:3005';
            const response = await axios.get(`${CLIENTES_URL}/api/vehiculos?limit=10000`, {
                timeout: 5000
            });
            const vehiculos = response.data.data || [];
            return vehiculos.length;
        } catch (error) {
            return 0;
        }
    }
}

module.exports = new DashboardService();
