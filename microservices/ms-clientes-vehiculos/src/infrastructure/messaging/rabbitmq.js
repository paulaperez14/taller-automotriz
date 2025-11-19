const amqp = require('amqplib');

let channel;
let connection;

const connectRabbitMQ = async () => {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();

        // Declarar exchanges
        await channel.assertExchange('clients_events', 'topic', { durable: true });

        return channel;
    } catch (error) {
        console.error('RabbitMQ connection error:', error);
        throw error;
    }
};

const getChannel = () => {
    if (!channel) {
        throw new Error('RabbitMQ not initialized. Call connectRabbitMQ first.');
    }
    return channel;
};

const publishEvent = async (exchange, routingKey, message) => {
    try {
        const ch = getChannel();
        ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
        console.log(`📤 Event published: ${routingKey}`);
    } catch (error) {
        console.error('Error publishing event:', error);
        throw error;
    }
};

module.exports = {
    connectRabbitMQ,
    getChannel,
    publishEvent
};
