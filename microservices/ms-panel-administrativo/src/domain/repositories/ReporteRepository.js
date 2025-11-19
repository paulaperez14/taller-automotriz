const { getConnection } = require('../../infrastructure/database/connection');

class ReporteRepository {
    /**
     * Crear un nuevo reporte
     */
    async create(datosReporte) {
        const connection = await getConnection();

        try {
            const [result] = await connection.execute(
                `INSERT INTO reportes 
                (reporte_id, titulo, tipo, descripcion, datos, generado_por, fecha_generacion)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    datosReporte.reporte_id,
                    datosReporte.titulo,
                    datosReporte.tipo,
                    datosReporte.descripcion,
                    datosReporte.datos,
                    datosReporte.generado_por,
                    datosReporte.fecha_generacion
                ]
            );

            // No hacer findById, retornar los datos directamente
            return {
                reporte_id: datosReporte.reporte_id,
                titulo: datosReporte.titulo,
                tipo: datosReporte.tipo,
                descripcion: datosReporte.descripcion,
                generado_por: datosReporte.generado_por,
                fecha_generacion: datosReporte.fecha_generacion
            };
        } finally {
            connection.release();
        }
    }    /**
     * Buscar reporte por ID
     */
    async findById(reporteId) {
        const connection = await getConnection();

        try {
            const [rows] = await connection.execute(
                `SELECT * FROM reportes WHERE reporte_id = ?`,
                [reporteId]
            );

            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    /**
     * Listar reportes con filtros
     */
    async findAll(tipo, limit, offset) {
        const connection = await getConnection();

        try {
            let query = 'SELECT * FROM reportes WHERE 1=1';
            const params = [];

            if (tipo) {
                query += ' AND tipo = ?';
                params.push(tipo);
            }

            query += ` ORDER BY fecha_generacion DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

            const [reportes] = await connection.execute(query, params);

            // Contar total
            let countQuery = 'SELECT COUNT(*) as total FROM reportes WHERE 1=1';
            const countParams = [];

            if (tipo) {
                countQuery += ' AND tipo = ?';
                countParams.push(tipo);
            }

            const [countResult] = await connection.execute(countQuery, countParams);
            const total = countResult[0].total;

            return { reportes, total };
        } finally {
            connection.release();
        }
    }

    /**
     * Eliminar reporte
     */
    async delete(reporteId) {
        const connection = await getConnection();

        try {
            await connection.execute(
                `DELETE FROM reportes WHERE reporte_id = ?`,
                [reporteId]
            );

            return true;
        } finally {
            connection.release();
        }
    }
}

module.exports = new ReporteRepository();
