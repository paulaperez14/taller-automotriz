const { getPool } = require('../../infrastructure/database/connection');

class MovimientoRepository {
    async create(movimiento) {
        const pool = getPool();
        const [result] = await pool.query(
            `INSERT INTO movimientos_inventario (movimiento_id, repuesto_id, tipo_movimiento, cantidad, 
       cantidad_anterior, cantidad_nueva, motivo, referencia) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                movimiento.movimiento_id,
                movimiento.repuesto_id,
                movimiento.tipo,
                movimiento.cantidad,
                movimiento.cantidad_anterior || 0,
                movimiento.cantidad_nueva || 0,
                movimiento.motivo,
                movimiento.orden_id // usar orden_id como referencia
            ]
        );
        return result;
    } async findByRepuestoId(repuesto_id) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT * FROM movimientos_inventario 
       WHERE repuesto_id = ? 
       ORDER BY fecha DESC 
       LIMIT 50`,
            [repuesto_id]
        );
        return rows;
    }

    async findByOrdenId(orden_id) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT m.*, r.nombre as repuesto_nombre, r.codigo as repuesto_codigo
       FROM movimientos_inventario m
       JOIN repuestos r ON m.repuesto_id = r.repuesto_id
       WHERE m.orden_id = ?
       ORDER BY m.fecha DESC`,
            [orden_id]
        );
        return rows;
    }

    async findAll(offset, limit, filtros = {}) {
        const pool = getPool();
        let query = `
      SELECT m.*, r.nombre as repuesto_nombre, r.codigo as repuesto_codigo
      FROM movimientos_inventario m
      JOIN repuestos r ON m.repuesto_id = r.repuesto_id
      WHERE 1=1
    `;
        const params = [];

        if (filtros.tipo) {
            query += ' AND m.tipo = ?';
            params.push(filtros.tipo);
        }

        if (filtros.fecha_inicio && filtros.fecha_fin) {
            query += ' AND m.fecha BETWEEN ? AND ?';
            params.push(filtros.fecha_inicio, filtros.fecha_fin);
        }

        query += ' ORDER BY m.fecha DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await pool.query(query, params);
        return rows;
    }
}

module.exports = new MovimientoRepository();
