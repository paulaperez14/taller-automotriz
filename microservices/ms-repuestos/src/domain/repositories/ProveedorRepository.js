const { getPool } = require('../../infrastructure/database/connection');

class ProveedorRepository {
    async create(proveedor) {
        const pool = getPool();
        const [result] = await pool.query(
            `INSERT INTO proveedores (proveedor_id, nombre, telefono, email, direccion, tiempo_entrega_dias) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [
                proveedor.proveedor_id,
                proveedor.nombre,
                proveedor.telefono,
                proveedor.email,
                proveedor.direccion,
                proveedor.tiempo_entrega_dias || 3
            ]
        );
        return result;
    } async findById(proveedor_id) {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM proveedores WHERE proveedor_id = ?',
            [proveedor_id]
        );
        return rows[0];
    }

    async findByNombre(nombre) {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM proveedores WHERE nombre = ?',
            [nombre]
        );
        return rows[0];
    } async findAll(offset, limit) {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM proveedores ORDER BY nombre ASC LIMIT ? OFFSET ?',
            [parseInt(limit), parseInt(offset)]
        );
        return rows;
    }

    async update(proveedor_id, data) {
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

        values.push(proveedor_id);
        await pool.query(
            `UPDATE proveedores SET ${fields.join(', ')} WHERE proveedor_id = ?`,
            values
        );
    }

    async delete(proveedor_id) {
        const pool = getPool();
        await pool.query('DELETE FROM proveedores WHERE proveedor_id = ?', [proveedor_id]);
    }
}

module.exports = new ProveedorRepository();
