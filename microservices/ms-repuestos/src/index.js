require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const repuestosRoutes = require('./infrastructure/api/routes/repuestosRoutes');
const proveedoresRoutes = require('./infrastructure/api/routes/proveedoresRoutes');
const { initializePool } = require('./infrastructure/database/connection');
const { connectRabbitMQ } = require('./infrastructure/messaging/rabbitmq');

const app = express();
const PORT = process.env.PORT || 3004;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/repuestos', repuestosRoutes);
app.use('/api/proveedores', proveedoresRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'ms-repuestos' });
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
        console.log('✅ Database connected');

        await connectRabbitMQ();
        console.log('✅ RabbitMQ connected');

        app.listen(PORT, () => {
            console.log(`🚀 ms-repuestos running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
