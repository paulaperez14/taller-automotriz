const { getPool } = require('../../infrastructure/database/connection');

class ServicioRepository {
    async create(servicio) {
        const pool = getPool();
        const [result] = await pool.query(
            `INSERT INTO servicios (servicio_id, orden_id, tipo, nombre, descripcion, costo, estado, horas_estimadas) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                servicio.servicio_id,
                servicio.orden_id,
                servicio.tipo || 'REPARACION',
                servicio.nombre || servicio.descripcion?.substring(0, 200) || 'Servicio',
                servicio.descripcion || '',
                servicio.costo || 0,
                servicio.estado || 'PENDIENTE',
                servicio.horas_estimadas || 1.0
            ]
        );
        return result;
    } async findById(servicio_id) {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM servicios WHERE servicio_id = ?',
            [servicio_id]
        );
        return rows[0];
    }

    async findByOrdenId(orden_id) {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM servicios WHERE orden_id = ? ORDER BY created_at ASC',
            [orden_id]
        );
        return rows;
    }

    async agregarRepuesto(servicio_id, repuestoData) {
        const pool = getPool();
        const [result] = await pool.query(
            `INSERT INTO servicios_repuestos (servicio_id, repuesto_id, cantidad, precio_unitario) 
       VALUES (?, ?, ?, ?)`,
            [
                servicio_id,
                repuestoData.repuesto_id,
                repuestoData.cantidad,
                repuestoData.precio_unitario
            ]
        );
        return result;
    }

    async getRepuestosByServicioId(servicio_id) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT sr.*, sr.cantidad, sr.precio_unitario,
       (sr.cantidad * sr.precio_unitario) as subtotal
       FROM servicios_repuestos sr
       WHERE sr.servicio_id = ?`,
            [servicio_id]
        );
        return rows;
    }

    async update(servicio_id, data) {
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

        values.push(servicio_id);
        await pool.query(
            `UPDATE servicios SET ${fields.join(', ')} WHERE servicio_id = ?`,
            values
        );
    }

    async delete(servicio_id) {
        const pool = getPool();
        // Primero eliminar los repuestos asociados
        await pool.query('DELETE FROM servicios_repuestos WHERE servicio_id = ?', [servicio_id]);
        // Luego eliminar el servicio
        await pool.query('DELETE FROM servicios WHERE servicio_id = ?', [servicio_id]);
    }

    async deleteRepuesto(servicio_id, repuesto_id) {
        const pool = getPool();
        await pool.query(
            'DELETE FROM servicios_repuestos WHERE servicio_id = ? AND repuesto_id = ?',
            [servicio_id, repuesto_id]
        );
    }
}

module.exports = new ServicioRepository();
