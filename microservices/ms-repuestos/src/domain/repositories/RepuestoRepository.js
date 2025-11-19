const { getPool } = require('../../infrastructure/database/connection');

class RepuestoRepository {
    async create(repuesto) {
        const pool = getPool();
        const [result] = await pool.query(
            `INSERT INTO repuestos (repuesto_id, nombre, codigo, proveedor_id, precio, 
       cantidad_disponible, stock_minimo, categoria, ubicacion, descripcion) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                repuesto.repuesto_id,
                repuesto.nombre,
                repuesto.codigo,
                repuesto.proveedor_id,
                repuesto.precio_venta, // usar precio_venta como precio
                repuesto.stock_actual,
                repuesto.stock_minimo,
                repuesto.categoria,
                repuesto.ubicacion,
                repuesto.descripcion || null
            ]
        );
        return result;
    } async findById(repuesto_id) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT r.*, p.nombre as proveedor_nombre 
       FROM repuestos r
       LEFT JOIN proveedores p ON r.proveedor_id = p.proveedor_id
       WHERE r.repuesto_id = ?`,
            [repuesto_id]
        );
        return rows[0];
    }

    async findByCodigo(codigo) {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM repuestos WHERE codigo = ?',
            [codigo]
        );
        return rows[0];
    }

    async findAll(offset, limit, filtros = {}) {
        const pool = getPool();
        let query = `
      SELECT r.*, p.nombre as proveedor_nombre 
      FROM repuestos r
      LEFT JOIN proveedores p ON r.proveedor_id = p.proveedor_id
      WHERE 1=1
    `;
        const params = [];

        if (filtros.categoria) {
            query += ' AND r.categoria = ?';
            params.push(filtros.categoria);
        }

        if (filtros.proveedor_id) {
            query += ' AND r.proveedor_id = ?';
            params.push(filtros.proveedor_id);
        }

        if (filtros.bajo_stock) {
            query += ' AND r.stock_actual <= r.stock_minimo';
        }

        query += ' ORDER BY r.nombre ASC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await pool.query(query, params);
        return rows;
    }

    async findByProveedorId(proveedor_id) {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM repuestos WHERE proveedor_id = ? ORDER BY nombre ASC',
            [proveedor_id]
        );
        return rows;
    }

    async findBajoStock() {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT r.*, p.nombre as proveedor_nombre 
       FROM repuestos r
       LEFT JOIN proveedores p ON r.proveedor_id = p.proveedor_id
       WHERE r.cantidad_disponible <= r.stock_minimo
       ORDER BY (r.stock_minimo - r.cantidad_disponible) DESC`
        );
        return rows;
    } async search(termino) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT r.*, p.nombre as proveedor_nombre 
       FROM repuestos r
       LEFT JOIN proveedores p ON r.proveedor_id = p.proveedor_id
       WHERE r.nombre LIKE ? OR r.codigo LIKE ?
       ORDER BY r.nombre ASC
       LIMIT 20`,
            [`%${termino}%`, `%${termino}%`]
        );
        return rows;
    }

    async update(repuesto_id, data) {
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

        values.push(repuesto_id);
        await pool.query(
            `UPDATE repuestos SET ${fields.join(', ')} WHERE repuesto_id = ?`,
            values
        );
    }

    async delete(repuesto_id) {
        const pool = getPool();
        await pool.query('DELETE FROM repuestos WHERE repuesto_id = ?', [repuesto_id]);
    }

    async getEstadisticas() {
        const pool = getPool();
        const [rows] = await pool.query(`
      SELECT 
        COUNT(*) as total_repuestos,
        SUM(stock_actual * precio_venta) as valor_inventario,
        COUNT(CASE WHEN stock_actual <= stock_minimo THEN 1 END) as repuestos_bajo_stock
      FROM repuestos
    `);
        return rows[0];
    }
}

module.exports = new RepuestoRepository();
