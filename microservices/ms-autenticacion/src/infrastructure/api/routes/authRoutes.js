const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

// Registro
router.post('/register',
    [
        body('username').notEmpty().trim(),
        body('password').isLength({ min: 1 }),
        body('email').isEmail(),
        body('rol').isIn(['ADMINISTRADOR', 'MECANICO', 'RECEPCIONISTA', 'CLIENTE'])
    ],
    AuthController.register
);

// Login
router.post('/login',
    [
        body('password').notEmpty().withMessage('Password es requerido')
    ],
    AuthController.login
);

// Validar token
router.get('/validate', AuthController.validateToken);

// Refresh token
router.post('/refresh', AuthController.refreshToken);

// Logout
router.post('/logout', AuthController.logout);

module.exports = router;
