const { getPool } = require('../../infrastructure/database/connection');

class VehiculoRepository {
    async create(vehiculo) {
        const pool = getPool();
        const [result] = await pool.query(
            `INSERT INTO vehiculos (vehiculo_id, cliente_id, placa, marca, modelo, anio, color, vin, kilometraje_actual)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                vehiculo.vehiculo_id,
                vehiculo.cliente_id,
                vehiculo.placa,
                vehiculo.marca,
                vehiculo.modelo,
                vehiculo.anio,
                vehiculo.color,
                vehiculo.vin,
                vehiculo.kilometraje_actual
            ]
        );
        return result;
    }

    async findById(vehiculo_id) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT v.*, c.nombres, c.apellidos, c.telefono, c.email 
       FROM vehiculos v 
       INNER JOIN clientes c ON v.cliente_id = c.cliente_id 
       WHERE v.vehiculo_id = ?`,
            [vehiculo_id]
        );
        return rows[0];
    }

    async findByPlaca(placa) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT v.*, c.nombres, c.apellidos, c.telefono 
       FROM vehiculos v 
       INNER JOIN clientes c ON v.cliente_id = c.cliente_id 
       WHERE v.placa = ?`,
            [placa]
        );
        return rows[0];
    }

    async findAll(offset, limit) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT v.*, c.nombres, c.apellidos 
       FROM vehiculos v 
       INNER JOIN clientes c ON v.cliente_id = c.cliente_id 
       ORDER BY v.created_at DESC 
       LIMIT ? OFFSET ?`,
            [parseInt(limit), parseInt(offset)]
        );
        return rows;
    }

    async update(vehiculo_id, data) {
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

        values.push(vehiculo_id);
        await pool.query(
            `UPDATE vehiculos SET ${fields.join(', ')} WHERE vehiculo_id = ?`,
            values
        );
    }

    async getHistorial(vehiculo_id) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT * FROM historial_servicios 
       WHERE vehiculo_id = ? 
       ORDER BY fecha DESC`,
            [vehiculo_id]
        );
        return rows;
    }
}

module.exports = new VehiculoRepository();
