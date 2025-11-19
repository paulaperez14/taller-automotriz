require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { initializePool } = require('./infrastructure/database/connection');
const { connectRabbitMQ } = require('./infrastructure/messaging/rabbitmq');
const facturasRoutes = require('./infrastructure/api/routes/facturasRoutes');
const pagosRoutes = require('./infrastructure/api/routes/pagosRoutes');

const app = express();
const PORT = process.env.PORT || 3006;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/facturas', facturasRoutes);
app.use('/api/pagos', pagosRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'ms-facturacion-pagos' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
    try {
        await initializePool();
        console.log('✅ Conectado a MySQL (Facturacion-Pagos)');

        await connectRabbitMQ();
        console.log('✅ Conectado a RabbitMQ');

        app.listen(PORT, () => {
            console.log(`🚀 ms-facturacion-pagos running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
