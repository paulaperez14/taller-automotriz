const { getPool } = require('../../infrastructure/database/connection');

class ClienteRepository {
    async create(cliente) {
        const pool = getPool();
        const [result] = await pool.query(
            `INSERT INTO clientes (cliente_id, tipo_identificacion, identificacion, nombres, apellidos, 
       telefono, email, direccion, ciudad) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                cliente.cliente_id,
                cliente.tipo_identificacion,
                cliente.identificacion,
                cliente.nombres,
                cliente.apellidos,
                cliente.telefono,
                cliente.email,
                cliente.direccion,
                cliente.ciudad
            ]
        );
        return result;
    }

    async findById(cliente_id) {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM clientes WHERE cliente_id = ?',
            [cliente_id]
        );
        return rows[0];
    }

    async findByIdentificacion(identificacion) {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM clientes WHERE identificacion = ?',
            [identificacion]
        );
        return rows[0];
    }

    async findAll(offset, limit, search = '') {
        const pool = getPool();
        let query = 'SELECT * FROM clientes';
        const params = [];

        if (search) {
            query += ` WHERE nombres LIKE ? OR apellidos LIKE ? OR identificacion LIKE ?`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await pool.query(query, params);
        return rows;
    }

    async update(cliente_id, data) {
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

        values.push(cliente_id);
        await pool.query(
            `UPDATE clientes SET ${fields.join(', ')} WHERE cliente_id = ?`,
            values
        );
    }

    async delete(cliente_id) {
        const pool = getPool();
        await pool.query('DELETE FROM clientes WHERE cliente_id = ?', [cliente_id]);
    }

    async getVehiculos(cliente_id) {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM vehiculos WHERE cliente_id = ? ORDER BY created_at DESC',
            [cliente_id]
        );
        return rows;
    }
}

module.exports = new ClienteRepository();
