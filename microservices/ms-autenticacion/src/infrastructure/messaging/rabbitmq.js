const amqp = require('amqplib');

let channel;
let connection;

const connectRabbitMQ = async () => {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();

        // Declarar exchanges
        await channel.assertExchange('auth_events', 'topic', { durable: true });

        return channel;
    } catch (error) {
        console.error('RabbitMQ connection error:', error);
        throw error;
    }
};

const getChannel = () => {
    if (!channel) {
        console.warn('⚠️ RabbitMQ not available. Events will not be published.');
        return null;
    }
    return channel;
};

const publishEvent = async (exchange, routingKey, message) => {
    try {
        const ch = getChannel();
        if (!ch) {
            console.warn(`⚠️ Skipping event publication (RabbitMQ not available): ${routingKey}`);
            return;
        }
        ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
        console.log(`📤 Event published: ${routingKey}`);
    } catch (error) {
        console.error('⚠️ Error publishing event:', error.message);
        // No lanzar error para no bloquear la operación principal
    }
};

module.exports = {
    connectRabbitMQ,
    getChannel,
    publishEvent
};
