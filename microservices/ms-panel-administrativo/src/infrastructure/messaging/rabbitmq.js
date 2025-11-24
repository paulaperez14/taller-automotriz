const amqp = require('amqplib');

let channel;
let connection;

const connectRabbitMQ = async () => {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();

        // Declarar exchanges y suscribirse a eventos de otros microservicios
        await channel.assertExchange('admin_events', 'topic', { durable: true });
        await channel.assertExchange('appointments_events', 'topic', { durable: true });
        await channel.assertExchange('repair_events', 'topic', { durable: true });
        await channel.assertExchange('parts_events', 'topic', { durable: true });
        await channel.assertExchange('billing_events', 'topic', { durable: true });

        console.log('✅ Canal RabbitMQ creado (consumidor multi-exchange)');
        return channel;
    } catch (error) {
        console.error('❌ Error al conectar con RabbitMQ:', error.message);
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
        console.log(`📤 Evento publicado: ${routingKey}`);
    } catch (error) {
        console.error('⚠️ Error al publicar evento:', error.message);
        // No lanzar error para no bloquear la operación principal
    }
};

module.exports = {
    connectRabbitMQ,
    getChannel,
    publishEvent
};
