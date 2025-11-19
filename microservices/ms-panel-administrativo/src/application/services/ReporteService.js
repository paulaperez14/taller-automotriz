const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const ReporteRepository = require('../../domain/repositories/ReporteRepository');

class ReporteService {
    constructor() {
        this.REPARACIONES_URL = process.env.REPARACIONES_URL || 'http://ms-reparaciones:3003';
    }

    /**
     * Generar un nuevo reporte
     */
    async generar(titulo, tipo, fechaInicio, fechaFin, descripcion) {
        const reporteId = uuidv4();

        // Generar datos según el tipo de reporte
        let datos = {};

        switch (tipo.toUpperCase()) {
            case 'SERVICIOS':
                datos = await this._generarReporteServicios(fechaInicio, fechaFin);
                break;
            case 'INGRESOS':
                datos = await this._generarReporteIngresos(fechaInicio, fechaFin);
                break;
            case 'INVENTARIO':
                datos = await this._generarReporteInventario();
                break;
            case 'GENERAL':
                datos = await this._generarReporteGeneral(fechaInicio, fechaFin);
                break;
            default:
                datos = { mensaje: 'Reporte personalizado' };
        }

        const datosReporte = {
            reporte_id: reporteId,
            titulo,
            tipo,
            descripcion: descripcion || `Reporte de ${tipo}`,
            datos: JSON.stringify(datos),
            generado_por: 'Sistema',
            fecha_generacion: new Date()
        };

        const reporte = await ReporteRepository.create(datosReporte);

        console.log(`📊 Reporte generado: ${titulo} (${tipo})`);
        console.log('DEBUG - Reporte:', JSON.stringify(reporte, null, 2));

        // Simplemente retornar el ID, el cliente puede hacer GET después
        return {
            reporte_id: reporte.reporte_id,
            titulo: reporte.titulo,
            mensaje: 'Reporte generado. Use GET /api/reportes/:id para obtener detalles'
        };
    }

    /**
     * Listar reportes
     */
    async listar(tipo, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const { reportes, total } = await ReporteRepository.findAll(tipo, limit, offset);

        return {
            reportes: reportes.map(r => ({
                ...r
                // MySQL2 ya convierte JSON automáticamente
            })),
            paginacion: {
                total,
                pagina_actual: page,
                total_paginas: Math.ceil(total / limit),
                registros_por_pagina: limit
            }
        };
    }

    /**
     * Obtener reporte por ID
     */
    async obtenerPorId(reporteId) {
        const reporte = await ReporteRepository.findById(reporteId);

        if (!reporte) {
            throw new Error('Reporte no encontrado');
        }

        // MySQL2 ya convierte JSON automáticamente
        return reporte;
    }

    /**
     * Obtener servicios más populares
     */
    async obtenerServiciosPopulares() {
        // Mock data - en producción consultaría ms-reparaciones
        return [
            { servicio: 'Cambio de aceite', cantidad: 145, ingresos: 6525000 },
            { servicio: 'Revisión de frenos', cantidad: 98, ingresos: 7840000 },
            { servicio: 'Alineación y balanceo', cantidad: 87, ingresos: 4350000 },
            { servicio: 'Cambio de llantas', cantidad: 65, ingresos: 19500000 },
            { servicio: 'Revisión general', cantidad: 52, ingresos: 4160000 }
        ];
    }

    /**
     * Obtener rendimiento de mecánicos
     */
    async obtenerRendimientoMecanicos() {
        // Mock data - en producción consultaría ms-reparaciones
        return [
            {
                mecanico: 'Carlos Martínez',
                servicios_completados: 78,
                tiempo_promedio_horas: 3.5,
                calificacion: 4.8,
                especialidad: 'Motor'
            },
            {
                mecanico: 'Juan Pérez',
                servicios_completados: 65,
                tiempo_promedio_horas: 4.2,
                calificacion: 4.6,
                especialidad: 'Suspensión'
            },
            {
                mecanico: 'Luis González',
                servicios_completados: 52,
                tiempo_promedio_horas: 3.8,
                calificacion: 4.7,
                especialidad: 'Frenos'
            }
        ];
    }

    // Métodos privados para generar diferentes tipos de reportes
    async _generarReporteServicios(fechaInicio, fechaFin) {
        return {
            periodo: { inicio: fechaInicio, fin: fechaFin },
            total_servicios: 195,
            por_estado: {
                COMPLETADO: 145,
                EN_PROCESO: 35,
                CANCELADO: 15
            },
            por_tipo: {
                REPARACION: 120,
                MANTENIMIENTO_PREVENTIVO: 55,
                DIAGNOSTICO: 20
            },
            tiempo_promedio: 4.2
        };
    }

    async _generarReporteIngresos(fechaInicio, fechaFin) {
        return {
            periodo: { inicio: fechaInicio, fin: fechaFin },
            total_facturado: 45250000,
            total_cobrado: 38500000,
            pendiente: 6750000,
            numero_facturas: 152,
            ticket_promedio: 297697.37
        };
    }

    async _generarReporteInventario() {
        return {
            total_repuestos: 150,
            valor_total: 45000000,
            bajo_stock: 12,
            sin_stock: 3,
            top_vendidos: [
                { nombre: 'Aceite motor 10W-40', ventas: 85 },
                { nombre: 'Filtro de aceite', ventas: 78 },
                { nombre: 'Pastillas de freno', ventas: 45 }
            ]
        };
    }

    async _generarReporteGeneral(fechaInicio, fechaFin) {
        return {
            periodo: { inicio: fechaInicio, fin: fechaFin },
            servicios: await this._generarReporteServicios(fechaInicio, fechaFin),
            ingresos: await this._generarReporteIngresos(fechaInicio, fechaFin),
            inventario: await this._generarReporteInventario()
        };
    }
}

module.exports = new ReporteService();
