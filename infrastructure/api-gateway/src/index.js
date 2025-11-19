require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { authMiddleware } = require('./middleware/auth');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security
app.use(helmet());
app.use(cors({
    origin: '*', // En producción, especificar dominios permitidos
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'api-gateway',
        timestamp: new Date().toISOString()
    });
});

// API info
app.get('/', (req, res) => {
    res.json({
        service: 'API Gateway - Sistema Taller Automotriz',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            clientes: '/api/clientes',
            vehiculos: '/api/vehiculos',
            citas: '/api/citas',
            ordenes: '/api/ordenes',
            repuestos: '/api/repuestos',
            proveedores: '/api/proveedores',
            facturas: '/api/facturas',
            pagos: '/api/pagos',
            dashboard: '/api/dashboard',
            reportes: '/api/reportes'
        },
        documentation: '/api/docs'
    });
});

// Routes
app.use('/api', routes);

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
        path: req.path,
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint no encontrado',
        path: req.path,
        method: req.method
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 API Gateway corriendo en puerto ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`✅ Enrutando a ${Object.keys(process.env).filter(k => k.includes('SERVICE_URL')).length} microservicios`);
});
