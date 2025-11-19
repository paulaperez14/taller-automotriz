const { getPool } = require('../../infrastructure/database/connection');

class SesionRepository {
    async create(sesion) {
        const pool = getPool();
        const [result] = await pool.query(
            'INSERT INTO sesiones (sesion_id, usuario_id, token, refresh_token, ip_address, user_agent, expira_en) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [sesion.sesion_id, sesion.usuario_id, sesion.token, sesion.refresh_token, sesion.ip_address, sesion.user_agent, sesion.expira_en]
        );
        return result;
    }

    async findByToken(token) {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM sesiones WHERE token = ?',
            [token]
        );
        return rows[0];
    }

    async findByRefreshToken(refreshToken) {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM sesiones WHERE refresh_token = ?',
            [refreshToken]
        );
        return rows[0];
    }

    async updateToken(sesion_id, newToken) {
        const pool = getPool();
        const expiresIn = new Date();
        expiresIn.setHours(expiresIn.getHours() + 24);

        await pool.query(
            'UPDATE sesiones SET token = ?, expira_en = ? WHERE sesion_id = ?',
            [newToken, expiresIn, sesion_id]
        );
    }

    async delete(sesion_id) {
        const pool = getPool();
        await pool.query('DELETE FROM sesiones WHERE sesion_id = ?', [sesion_id]);
    }

    async deleteExpired() {
        const pool = getPool();
        await pool.query('DELETE FROM sesiones WHERE expira_en < NOW()');
    }
}

module.exports = new SesionRepository();
