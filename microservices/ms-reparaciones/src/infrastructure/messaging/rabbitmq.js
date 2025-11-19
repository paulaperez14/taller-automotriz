const amqp = require('amqplib');

let channel;
let connection;

const connectRabbitMQ = async () => {
    try {
        const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
        connection = await amqp.connect(rabbitmqUrl);
        channel = await connection.createChannel();

        // Declarar exchange para eventos de reparaciones
        await channel.assertExchange('repair_events', 'topic', { durable: true });

        console.log('✅ Conectado a RabbitMQ (Reparaciones)');
    } catch (error) {
        console.error('❌ Error conectando a RabbitMQ:', error.message);
        throw error;
    }
};

const getChannel = () => {
    if (!channel) {
        throw new Error('RabbitMQ no está conectado');
    }
    return channel;
};

const publishEvent = async (exchange, routingKey, message) => {
    if (!channel) {
        throw new Error('RabbitMQ no está conectado');
    }

    try {
        channel.publish(
            exchange,
            routingKey,
            Buffer.from(JSON.stringify(message)),
            { persistent: true }
        );
        console.log(`📤 Evento publicado: ${routingKey}`);
    } catch (error) {
        console.error('Error publicando evento:', error);
        throw error;
    }
};

module.exports = {
    connectRabbitMQ,
    getChannel,
    publishEvent
};
