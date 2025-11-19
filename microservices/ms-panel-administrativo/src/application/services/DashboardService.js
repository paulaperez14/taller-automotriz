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
            const [citas, ordenes, facturas, inventario] = await Promise.allSettled([
                this._obtenerCitasDelDia(),
                this._obtenerOrdenesActivas(),
                this._obtenerFacturasPendientes(),
                this._obtenerAlertasInventario()
            ]);

            const resumen = {
                fecha: new Date().toISOString().split('T')[0],
                citas: {
                    total: citas.status === 'fulfilled' ? citas.value.length : 0,
                    pendientes: citas.status === 'fulfilled' ?
                        citas.value.filter(c => c.estado === 'PROGRAMADA').length : 0
                },
                ordenes: {
                    total: ordenes.status === 'fulfilled' ? ordenes.value.length : 0,
                    en_proceso: ordenes.status === 'fulfilled' ?
                        ordenes.value.filter(o => o.estado === 'EN_PROCESO').length : 0
                },
                facturas: {
                    total: facturas.status === 'fulfilled' ? facturas.value.length : 0,
                    monto_pendiente: facturas.status === 'fulfilled' ?
                        facturas.value.reduce((acc, f) => acc + parseFloat(f.total || 0), 0) : 0
                },
                inventario: {
                    alertas: inventario.status === 'fulfilled' ? inventario.value.length : 0
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
            return {
                periodo: {
                    inicio: fechaInicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    fin: fechaFin || new Date().toISOString().split('T')[0]
                },
                total_facturado: 15750000,
                total_cobrado: 12500000,
                pendiente_cobro: 3250000,
                numero_facturas: 38,
                ticket_promedio: 414473.68,
                metodos_pago: {
                    EFECTIVO: 5200000,
                    TARJETA_CREDITO: 4800000,
                    TARJETA_DEBITO: 2500000
                }
            };
        } catch (error) {
            console.error('Error al obtener estadísticas de ingresos:', error.message);
            throw error;
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

            return response.data.citas.filter(c =>
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

            return response.data.ordenes.filter(o =>
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
            const response = await axios.get(`${this.FACTURACION_URL}/api/facturas/filtros/pendientes`, {
                timeout: 5000
            });

            return response.data.facturas || [];
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
            return response.data.citas || [];
        } catch (error) {
            return [];
        }
    }

    async _obtenerOrdenesActivas() {
        return await this.obtenerOrdenesActivas();
    }

    async _obtenerFacturasPendientes() {
        return await this.obtenerFacturasPendientes();
    }

    async _obtenerAlertasInventario() {
        try {
            const response = await axios.get(`${this.REPUESTOS_URL}/api/repuestos/alertas/bajo-stock`, {
                timeout: 5000
            });
            return response.data.repuestos || [];
        } catch (error) {
            return [];
        }
    }
}

module.exports = new DashboardService();
