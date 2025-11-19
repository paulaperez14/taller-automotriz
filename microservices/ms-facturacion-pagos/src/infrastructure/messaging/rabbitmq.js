const amqp = require('amqplib');

let channel;
let connection;

const connectRabbitMQ = async () => {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();

        // Declarar exchanges
        await channel.assertExchange('billing_events', 'topic', { durable: true });

        console.log('✅ Canal RabbitMQ creado (billing_events)');
        return channel;
    } catch (error) {
        console.error('❌ Error al conectar con RabbitMQ:', error.message);
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
        console.log(`📤 Evento publicado: ${routingKey}`);
    } catch (error) {
        console.error('❌ Error al publicar evento:', error.message);
        throw error;
    }
};

module.exports = {
    connectRabbitMQ,
    getChannel,
    publishEvent
};
