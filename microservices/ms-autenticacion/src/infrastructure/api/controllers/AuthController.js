const { validationResult } = require('express-validator');
const AuthService = require('../../../application/services/AuthService');

class AuthController {
    async register(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { username, password, email, rol } = req.body;
            const result = await AuthService.register({ username, password, email, rol });

            res.status(201).json({ message: 'Usuario registrado exitosamente', data: result });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async login(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { username, password } = req.body;
            const result = await AuthService.login(username, password, req.ip, req.headers['user-agent']);

            res.json({ message: 'Login exitoso', data: result });
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    async validateToken(req, res) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({ error: 'Token no proporcionado' });
            }

            const result = await AuthService.validateToken(token);
            res.json({ valid: true, data: result });
        } catch (error) {
            res.status(401).json({ valid: false, error: error.message });
        }
    }

    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ error: 'Refresh token no proporcionado' });
            }

            const result = await AuthService.refreshToken(refreshToken);
            res.json({ data: result });
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    async logout(req, res) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({ error: 'Token no proporcionado' });
            }

            await AuthService.logout(token);
            res.json({ message: 'Logout exitoso' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new AuthController();
