const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const UserRepository = require('../../domain/repositories/UserRepository');
const SesionRepository = require('../../domain/repositories/SesionRepository');
const { publishEvent } = require('../../infrastructure/messaging/rabbitmq');

class AuthService {
    async register({ username, password, email, rol }) {
        // Verificar si el usuario ya existe
        const existingUser = await UserRepository.findByUsername(username);
        if (existingUser) {
            throw new Error('El usuario ya existe');
        }

        const existingEmail = await UserRepository.findByEmail(email);
        if (existingEmail) {
            throw new Error('El email ya está registrado');
        }

        // Hash de la contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Crear usuario
        const usuario = {
            usuario_id: uuidv4(),
            username,
            password_hash: passwordHash,
            email,
            rol,
            activo: true
        };

        await UserRepository.create(usuario);

        // Publicar evento
        await publishEvent('auth_events', 'user.registered', {
            usuario_id: usuario.usuario_id,
            username: usuario.username,
            email: usuario.email,
            rol: usuario.rol,
            timestamp: new Date().toISOString()
        });

        return {
            usuario_id: usuario.usuario_id,
            username: usuario.username,
            email: usuario.email,
            rol: usuario.rol
        };
    }

    async login(usernameOrEmail, password, ipAddress, userAgent) {
        // Buscar usuario por username o email
        let usuario = await UserRepository.findByUsername(usernameOrEmail);
        if (!usuario) {
            usuario = await UserRepository.findByEmail(usernameOrEmail);
        }

        if (!usuario) {
            throw new Error('Credenciales inválidas');
        }

        if (!usuario.activo) {
            throw new Error('Usuario inactivo');
        }

        // Verificar contraseña
        const isValid = await bcrypt.compare(password, usuario.password_hash);
        if (!isValid) {
            throw new Error('Credenciales inválidas');
        }

        // Generar tokens
        const token = jwt.sign(
            { usuario_id: usuario.usuario_id, username: usuario.username, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        const refreshToken = jwt.sign(
            { usuario_id: usuario.usuario_id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
        );

        // Calcular fecha de expiración
        const expiresIn = new Date();
        expiresIn.setHours(expiresIn.getHours() + 24);

        // Crear sesión
        const sesion = {
            sesion_id: uuidv4(),
            usuario_id: usuario.usuario_id,
            token,
            refresh_token: refreshToken,
            ip_address: ipAddress,
            user_agent: userAgent,
            expira_en: expiresIn
        };

        await SesionRepository.create(sesion);

        // Actualizar último login
        await UserRepository.updateLastLogin(usuario.usuario_id);

        // Publicar evento
        await publishEvent('auth_events', 'user.logged_in', {
            usuario_id: usuario.usuario_id,
            username: usuario.username,
            timestamp: new Date().toISOString()
        });

        return {
            usuario: {
                usuario_id: usuario.usuario_id,
                username: usuario.username,
                email: usuario.email,
                rol: usuario.rol
            },
            token,
            refreshToken,
            expiresIn: expiresIn.toISOString()
        };
    }

    async validateToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Verificar que la sesión exista
            const sesion = await SesionRepository.findByToken(token);
            if (!sesion) {
                throw new Error('Sesión no válida');
            }

            // Verificar si expiró
            if (new Date() > new Date(sesion.expira_en)) {
                throw new Error('Token expirado');
            }

            return decoded;
        } catch (error) {
            throw new Error('Token inválido');
        }
    }

    async refreshToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

            // Buscar sesión
            const sesion = await SesionRepository.findByRefreshToken(refreshToken);
            if (!sesion) {
                throw new Error('Refresh token inválido');
            }

            // Buscar usuario
            const usuario = await UserRepository.findById(decoded.usuario_id);
            if (!usuario || !usuario.activo) {
                throw new Error('Usuario no válido');
            }

            // Generar nuevo token
            const newToken = jwt.sign(
                { usuario_id: usuario.usuario_id, username: usuario.username, rol: usuario.rol },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
            );

            // Actualizar sesión
            await SesionRepository.updateToken(sesion.sesion_id, newToken);

            return { token: newToken };
        } catch (error) {
            throw new Error('Refresh token inválido');
        }
    }

    async logout(token) {
        const sesion = await SesionRepository.findByToken(token);
        if (sesion) {
            await SesionRepository.delete(sesion.sesion_id);

            // Publicar evento
            await publishEvent('auth_events', 'user.logged_out', {
                usuario_id: sesion.usuario_id,
                timestamp: new Date().toISOString()
            });
        }
    }
}

module.exports = new AuthService();
