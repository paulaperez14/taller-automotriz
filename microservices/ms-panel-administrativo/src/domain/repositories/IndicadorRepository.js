const { getConnection } = require('../../infrastructure/database/connection');

class IndicadorRepository {
    /**
     * Crear un nuevo indicador
     */
    async create(datosIndicador) {
        const connection = await getConnection();

        try {
            const [result] = await connection.execute(
                `INSERT INTO indicadores 
                (indicador_id, nombre, tipo, valor, unidad, fecha_inicio, fecha_fin, periodo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    datosIndicador.indicador_id,
                    datosIndicador.nombre,
                    datosIndicador.tipo,
                    datosIndicador.valor,
                    datosIndicador.unidad,
                    datosIndicador.fecha_inicio,
                    datosIndicador.fecha_fin,
                    datosIndicador.periodo
                ]
            );

            return await this.findById(datosIndicador.indicador_id);
        } finally {
            connection.release();
        }
    }

    /**
     * Buscar indicador por ID
     */
    async findById(indicadorId) {
        const connection = await getConnection();

        try {
            const [rows] = await connection.execute(
                `SELECT * FROM indicadores WHERE indicador_id = ?`,
                [indicadorId]
            );

            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    /**
     * Listar indicadores con filtros
     */
    async findAll(filtros = {}) {
        const connection = await getConnection();

        try {
            let query = 'SELECT * FROM indicadores WHERE 1=1';
            const params = [];

            if (filtros.tipo) {
                query += ' AND tipo = ?';
                params.push(filtros.tipo);
            }

            if (filtros.periodo) {
                query += ' AND periodo = ?';
                params.push(filtros.periodo);
            }

            query += ' ORDER BY created_at DESC';

            const [rows] = await connection.execute(query, params);
            return rows;
        } finally {
            connection.release();
        }
    }

    /**
     * Actualizar valor de indicador
     */
    async update(indicadorId, nuevoValor) {
        const connection = await getConnection();

        try {
            await connection.execute(
                `UPDATE indicadores SET valor = ? WHERE indicador_id = ?`,
                [nuevoValor, indicadorId]
            );

            return await this.findById(indicadorId);
        } finally {
            connection.release();
        }
    }

    /**
     * Eliminar indicador
     */
    async delete(indicadorId) {
        const connection = await getConnection();

        try {
            await connection.execute(
                `DELETE FROM indicadores WHERE indicador_id = ?`,
                [indicadorId]
            );

            return true;
        } finally {
            connection.release();
        }
    }
}

module.exports = new IndicadorRepository();
