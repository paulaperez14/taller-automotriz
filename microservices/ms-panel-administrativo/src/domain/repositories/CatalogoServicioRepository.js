const { getPool } = require('../../infrastructure/database/connection');

class CatalogoServicioRepository {
    async findAll(filters = {}) {
        const { categoria, activo, busqueda } = filters;
        let query = 'SELECT * FROM catalogo_servicios WHERE 1=1';
        const params = [];

        if (categoria) {
            query += ' AND categoria = ?';
            params.push(categoria);
        }

        if (activo !== undefined) {
            query += ' AND activo = ?';
            params.push(activo);
        }

        if (busqueda) {
            query += ' AND (nombre LIKE ? OR codigo LIKE ? OR descripcion LIKE ?)';
            const searchTerm = `%${busqueda}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY categoria, nombre';

        const pool = getPool();
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    async findById(servicio_id) {
        const pool = getPool();
        const [rows] = await pool.execute(
            'SELECT * FROM catalogo_servicios WHERE servicio_id = ?',
            [servicio_id]
        );
        return rows[0];
    }

    async findByCodigo(codigo) {
        const pool = getPool();
        const [rows] = await pool.execute(
            'SELECT * FROM catalogo_servicios WHERE codigo = ?',
            [codigo]
        );
        return rows[0];
    }

    async findByCategoria(categoria) {
        const pool = getPool();
        const [rows] = await pool.execute(
            'SELECT * FROM catalogo_servicios WHERE categoria = ? AND activo = TRUE ORDER BY nombre',
            [categoria]
        );
        return rows;
    }

    async create(servicio) {
        const {
            servicio_id,
            codigo,
            nombre,
            descripcion,
            categoria,
            precio_base,
            duracion_estimada,
            activo
        } = servicio;

        const pool = getPool();
        await pool.execute(
            `INSERT INTO catalogo_servicios 
            (servicio_id, codigo, nombre, descripcion, categoria, precio_base, duracion_estimada, activo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [servicio_id, codigo, nombre, descripcion, categoria, precio_base, duracion_estimada, activo ?? true]
        );

        return this.findById(servicio_id);
    }

    async update(servicio_id, data) {
        const fields = [];
        const values = [];

        if (data.codigo !== undefined) {
            fields.push('codigo = ?');
            values.push(data.codigo);
        }
        if (data.nombre !== undefined) {
            fields.push('nombre = ?');
            values.push(data.nombre);
        }
        if (data.descripcion !== undefined) {
            fields.push('descripcion = ?');
            values.push(data.descripcion);
        }
        if (data.categoria !== undefined) {
            fields.push('categoria = ?');
            values.push(data.categoria);
        }
        if (data.precio_base !== undefined) {
            fields.push('precio_base = ?');
            values.push(data.precio_base);
        }
        if (data.duracion_estimada !== undefined) {
            fields.push('duracion_estimada = ?');
            values.push(data.duracion_estimada);
        }
        if (data.activo !== undefined) {
            fields.push('activo = ?');
            values.push(data.activo);
        }

        if (fields.length === 0) return this.findById(servicio_id);

        values.push(servicio_id);
        const pool = getPool();
        await pool.execute(
            `UPDATE catalogo_servicios SET ${fields.join(', ')} WHERE servicio_id = ?`,
            values
        );

        return this.findById(servicio_id);
    }

    async delete(servicio_id) {
        const pool = getPool();
        await pool.execute(
            'DELETE FROM catalogo_servicios WHERE servicio_id = ?',
            [servicio_id]
        );
    }

    async toggleActivo(servicio_id) {
        const pool = getPool();
        await pool.execute(
            'UPDATE catalogo_servicios SET activo = NOT activo WHERE servicio_id = ?',
            [servicio_id]
        );
        return this.findById(servicio_id);
    }

    async getCategorias() {
        const pool = getPool();
        const [rows] = await pool.execute(
            `SELECT DISTINCT categoria, COUNT(*) as total 
             FROM catalogo_servicios 
             WHERE activo = TRUE 
             GROUP BY categoria 
             ORDER BY categoria`
        );
        return rows;
    }
}

module.exports = new CatalogoServicioRepository();
