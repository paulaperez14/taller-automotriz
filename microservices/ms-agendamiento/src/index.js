require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const citasRoutes = require('./infrastructure/api/routes/citasRoutes');
const { initializePool } = require('./infrastructure/database/connection');
const { connectRabbitMQ } = require('./infrastructure/messaging/rabbitmq');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/citas', citasRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'ms-agendamiento' });
});

const startServer = async () => {
    try {
        await initializePool();
        console.log('✅ Database connected');

        // Intentar conectar a RabbitMQ pero no bloquear el inicio
        try {
            await connectRabbitMQ();
            console.log('✅ RabbitMQ connected');
        } catch (error) {
            console.error('⚠️ Error al conectar con RabbitMQ:', error.message);
            console.log('⚠️ El servicio continuará sin RabbitMQ');
        }

        app.listen(PORT, () => {
            console.log(`🚀 ms-agendamiento running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        setTimeout(startServer, 5000); // Reintentar después de 5 segundos
    }
};

startServer();
