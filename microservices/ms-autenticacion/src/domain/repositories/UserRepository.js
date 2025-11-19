const { getPool } = require('../../infrastructure/database/connection');

class UserRepository {
    async create(usuario) {
        const pool = getPool();
        const [result] = await pool.query(
            'INSERT INTO usuarios (usuario_id, username, password_hash, email, rol, activo) VALUES (?, ?, ?, ?, ?, ?)',
            [usuario.usuario_id, usuario.username, usuario.password_hash, usuario.email, usuario.rol, usuario.activo]
        );
        return result;
    }

    async findByUsername(username) {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM usuarios WHERE username = ?',
            [username]
        );
        return rows[0];
    }

    async findByEmail(email) {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    async findById(usuario_id) {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM usuarios WHERE usuario_id = ?',
            [usuario_id]
        );
        return rows[0];
    }

    async updateLastLogin(usuario_id) {
        const pool = getPool();
        await pool.query(
            'UPDATE usuarios SET ultimo_login = NOW() WHERE usuario_id = ?',
            [usuario_id]
        );
    }

    async update(usuario_id, data) {
        const pool = getPool();
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);
        await pool.query(
            `UPDATE usuarios SET ${fields} WHERE usuario_id = ?`,
            [...values, usuario_id]
        );
    }
}

module.exports = new UserRepository();
