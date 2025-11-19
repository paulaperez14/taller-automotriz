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
        await connectRabbitMQ();
        app.listen(PORT, () => {
            console.log(`🚀 ms-agendamiento running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
