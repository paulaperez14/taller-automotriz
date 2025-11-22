require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const ordenesRoutes = require('./infrastructure/api/routes/ordenesRoutes');
const { initializePool } = require('./infrastructure/database/connection');
const { connectRabbitMQ, subscribeToAppointmentEvents } = require('./infrastructure/messaging/rabbitmq');
const OrdenEventHandler = require('./application/services/OrdenEventHandler');

const app = express();
const PORT = process.env.PORT || 3003;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/ordenes', ordenesRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'ms-reparaciones' });
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

        // Suscribirse a eventos de citas completadas
        await subscribeToAppointmentEvents((event) => {
            return OrdenEventHandler.handleCitaCompletada(event);
        });

        app.listen(PORT, () => {
            console.log(`🚀 ms-reparaciones running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
