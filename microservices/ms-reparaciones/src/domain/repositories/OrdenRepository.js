const { getPool } = require('../../infrastructure/database/connection');

class OrdenRepository {
    async create(orden) {
        const pool = getPool();
        const [result] = await pool.query(
            `INSERT INTO ordenes_servicio (orden_id, cita_id, cliente_id, vehiculo_id, 
       mecanico_id, diagnostico, estado, fecha_creacion, fecha_estimada_finalizacion) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                orden.orden_id,
                orden.cita_id || null,
                orden.cliente_id,
                orden.vehiculo_id,
                orden.mecanico_id,
                orden.diagnostico,
                orden.estado,
                orden.fecha_creacion,
                orden.fecha_estimada_finalizacion
            ]
        );
        return result;
    } async findById(orden_id) {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM ordenes_servicio WHERE orden_id = ?',
            [orden_id]
        );
        return rows[0];
    }

    async findAll(offset, limit, filtros = {}) {
        const pool = getPool();
        let query = 'SELECT * FROM ordenes_servicio WHERE 1=1';
        const params = [];

        if (filtros.estado) {
            query += ' AND estado = ?';
            params.push(filtros.estado);
        }

        if (filtros.mecanico_id) {
            query += ' AND mecanico_id = ?';
            params.push(filtros.mecanico_id);
        }

        if (filtros.cliente_id) {
            query += ' AND cliente_id = ?';
            params.push(filtros.cliente_id);
        }

        if (filtros.fecha_inicio && filtros.fecha_fin) {
            query += ' AND fecha_creacion BETWEEN ? AND ?';
            params.push(filtros.fecha_inicio, filtros.fecha_fin);
        }

        query += ' ORDER BY fecha_creacion DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset)); const [rows] = await pool.query(query, params);
        return rows;
    }

    async findByMecanico(mecanico_id) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT * FROM ordenes_servicio 
       WHERE mecanico_id = ? AND estado IN ('PENDIENTE', 'EN_PROCESO')
       ORDER BY fecha_creacion DESC`,
            [mecanico_id]
        );
        return rows;
    }

    async findByVehiculo(vehiculo_id) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT * FROM ordenes_servicio 
       WHERE vehiculo_id = ?
       ORDER BY fecha_creacion DESC`,
            [vehiculo_id]
        );
        return rows;
    } async update(orden_id, data) {
        const pool = getPool();
        const fields = [];
        const values = [];

        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(data[key]);
            }
        });

        if (fields.length === 0) return;

        values.push(orden_id);
        await pool.query(
            `UPDATE ordenes_servicio SET ${fields.join(', ')} WHERE orden_id = ?`,
            values
        );
    }

    async delete(orden_id) {
        const pool = getPool();
        await pool.query('DELETE FROM ordenes_servicio WHERE orden_id = ?', [orden_id]);
    }

    async countByEstado() {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT estado, COUNT(*) as total 
       FROM ordenes_servicio 
       GROUP BY estado`
        );
        return rows;
    }

    async getOrdenesPendientes() {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT * FROM ordenes_servicio 
       WHERE estado = 'PENDIENTE'
       ORDER BY fecha_creacion ASC`
        );
        return rows;
    }

    async getOrdenesEnProceso() {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT o.*, m.nombre as nombre_mecanico
       FROM ordenes_servicio o
       LEFT JOIN mecanicos m ON o.mecanico_id = m.mecanico_id
       WHERE o.estado = 'EN_PROCESO'
       ORDER BY o.created_at ASC`
        );
        return rows;
    }
} module.exports = new OrdenRepository();
