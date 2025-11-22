const { getPool } = require('../../infrastructure/database/connection');

class CitaRepository {
    async create(cita) {
        const pool = getPool();
        const [result] = await pool.query(
            `INSERT INTO citas (cita_id, cliente_id, vehiculo_id, mecanico_id, sede_id, servicio_id, 
       nombre_servicio, precio_servicio, fecha, hora, duracion_estimada, motivo, estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                cita.cita_id,
                cita.cliente_id,
                cita.vehiculo_id,
                cita.mecanico_id,
                cita.sede_id || null,
                cita.servicio_id || null,
                cita.nombre_servicio || null,
                cita.precio_servicio || null,
                cita.fecha,
                cita.hora,
                cita.duracion_estimada,
                cita.motivo,
                cita.estado
            ]
        );
        return result;
    }

    async findById(cita_id) {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM citas WHERE cita_id = ?',
            [cita_id]
        );
        return rows[0];
    }

    async findAll(offset, limit, filtros = {}) {
        const pool = getPool();
        let query = 'SELECT * FROM citas WHERE 1=1';
        const params = [];

        if (filtros.fecha) {
            query += ' AND fecha = ?';
            params.push(filtros.fecha);
        }

        if (filtros.estado) {
            query += ' AND estado = ?';
            params.push(filtros.estado);
        }

        if (filtros.cliente_id) {
            query += ' AND cliente_id = ?';
            params.push(filtros.cliente_id);
        }

        if (filtros.mecanico_id) {
            query += ' AND mecanico_id = ?';
            params.push(filtros.mecanico_id);
        }

        if (filtros.sede_id) {
            query += ' AND sede_id = ?';
            params.push(filtros.sede_id);
        }

        query += ' ORDER BY fecha DESC, hora DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await pool.query(query, params);
        return rows;
    }

    async findByFecha(fecha) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT * FROM citas 
       WHERE fecha = ? AND estado IN ('PROGRAMADA', 'CONFIRMADA')
       ORDER BY hora ASC`,
            [fecha]
        );
        return rows;
    }

    async findByRango(fecha_inicio, fecha_fin) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT * FROM citas 
       WHERE fecha BETWEEN ? AND ?
       ORDER BY fecha ASC, hora ASC`,
            [fecha_inicio, fecha_fin]
        );
        return rows;
    }

    async update(cita_id, data) {
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

        values.push(cita_id);
        await pool.query(
            `UPDATE citas SET ${fields.join(', ')} WHERE cita_id = ?`,
            values
        );
    }

    async verificarConflicto(fecha, hora, duracion, mecanico_id = null, sede_id = null, excluir_cita_id = null) {
        const pool = getPool();

        // Calcular hora fin
        const [horaNum, minutoNum] = hora.split(':').map(Number);
        const minutosInicio = horaNum * 60 + minutoNum;
        const minutosFin = minutosInicio + duracion;

        let query = `
      SELECT * FROM citas 
      WHERE fecha = ? 
      AND estado IN ('PROGRAMADA', 'CONFIRMADA')
    `;
        const params = [fecha];

        if (sede_id) {
            query += ' AND sede_id = ?';
            params.push(sede_id);
        }

        if (mecanico_id) {
            query += ' AND mecanico_id = ?';
            params.push(mecanico_id);
        }

        if (excluir_cita_id) {
            query += ' AND cita_id != ?';
            params.push(excluir_cita_id);
        }

        const [citas] = await pool.query(query, params);

        // Verificar solapamiento
        for (const cita of citas) {
            const [citaHora, citaMinuto] = cita.hora.split(':').map(Number);
            const citaInicio = citaHora * 60 + citaMinuto;
            const citaFin = citaInicio + cita.duracion_estimada;

            // Hay conflicto si se solapan los horarios
            if ((minutosInicio >= citaInicio && minutosInicio < citaFin) ||
                (minutosFin > citaInicio && minutosFin <= citaFin) ||
                (minutosInicio <= citaInicio && minutosFin >= citaFin)) {
                return true;
            }
        }

        return false;
    }

    async delete(cita_id) {
        const pool = getPool();
        await pool.query('DELETE FROM citas WHERE cita_id = ?', [cita_id]);
    }

    async countByEstado() {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT estado, COUNT(*) as total 
       FROM citas 
       GROUP BY estado`
        );
        return rows;
    }

    async findProximas(limite = 10) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT * FROM citas 
       WHERE fecha >= CURDATE() AND estado IN ('PROGRAMADA', 'CONFIRMADA')
       ORDER BY fecha ASC, hora ASC
       LIMIT ?`,
            [limite]
        );
        return rows;
    }
}

module.exports = new CitaRepository();
