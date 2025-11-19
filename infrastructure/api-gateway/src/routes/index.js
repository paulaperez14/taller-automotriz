const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Configuración de proxy para cada microservicio
const createProxy = (target, pathRewrite = {}) => {
    return createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite,
        onError: (err, req, res) => {
            console.error(`❌ Error de proxy a ${target}:`, err.message);
            res.status(503).json({
                error: 'Servicio no disponible',
                message: 'El microservicio no está respondiendo',
                service: target
            });
        },
        onProxyReq: (proxyReq, req, res) => {
            // Pasar información del usuario autenticado al microservicio
            if (req.user) {
                proxyReq.setHeader('X-User-Id', req.user.userId || req.user.usuario_id);
                proxyReq.setHeader('X-User-Email', req.user.email || '');
            }
        }
    });
};

// ===========================================
// RUTAS PÚBLICAS (sin autenticación)
// ===========================================

// Autenticación
router.use('/auth', createProxy(process.env.AUTH_SERVICE_URL, { '^/api/auth': '/api' }));

// ===========================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ===========================================

// Clientes y Vehículos
router.use('/clientes', authMiddleware, createProxy(process.env.CLIENTES_SERVICE_URL, { '^/api/clientes': '/api/clientes' }));
router.use('/vehiculos', authMiddleware, createProxy(process.env.CLIENTES_SERVICE_URL, { '^/api/vehiculos': '/api/vehiculos' }));

// Agendamiento (Citas)
router.use('/citas', authMiddleware, createProxy(process.env.AGENDAMIENTO_SERVICE_URL, { '^/api/citas': '/api/citas' }));

// Reparaciones (Órdenes de Servicio)
router.use('/ordenes', authMiddleware, createProxy(process.env.REPARACIONES_SERVICE_URL, { '^/api/ordenes': '/api/ordenes' }));

// Repuestos e Inventario
router.use('/repuestos', authMiddleware, createProxy(process.env.REPUESTOS_SERVICE_URL, { '^/api/repuestos': '/api/repuestos' }));
router.use('/proveedores', authMiddleware, createProxy(process.env.REPUESTOS_SERVICE_URL, { '^/api/proveedores': '/api/proveedores' }));

// Facturación y Pagos
router.use('/facturas', authMiddleware, createProxy(process.env.FACTURACION_SERVICE_URL, { '^/api/facturas': '/api/facturas' }));
router.use('/pagos', authMiddleware, createProxy(process.env.FACTURACION_SERVICE_URL, { '^/api/pagos': '/api/pagos' }));

// Panel Administrativo (Dashboard y Reportes)
router.use('/dashboard', authMiddleware, createProxy(process.env.PANEL_SERVICE_URL, { '^/api/dashboard': '/api/dashboard' }));
router.use('/reportes', authMiddleware, createProxy(process.env.PANEL_SERVICE_URL, { '^/api/reportes': '/api/reportes' }));

module.exports = router;
