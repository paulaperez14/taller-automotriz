const amqp = require('amqplib');

let channel;
let connection;

const connectRabbitMQ = async () => {
    try {
        const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
        connection = await amqp.connect(rabbitmqUrl);
        channel = await connection.createChannel();

        // Declarar exchange para eventos de repuestos
        await channel.assertExchange('parts_events', 'topic', { durable: true });

        console.log('✅ Conectado a RabbitMQ (Repuestos)');
    } catch (error) {
        console.error('❌ Error conectando a RabbitMQ:', error.message);
        throw error;
    }
};

const getChannel = () => {
    if (!channel) {
        console.warn('⚠️ RabbitMQ not available.');
        return null;
    }
    return channel;
};

const publishEvent = async (exchange, routingKey, message) => {
    if (!channel) {
        console.warn(`⚠️ Skipping event publication (RabbitMQ not available): ${routingKey}`);
        return;
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
        console.error('⚠️ Error publicando evento:', error.message);
        // No lanzar error para no bloquear la operación principal
    }
};

module.exports = {
    connectRabbitMQ,
    getChannel,
    publishEvent
};