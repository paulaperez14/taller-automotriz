const amqp = require('amqplib');

let channel = null;
let connection = null;

async function connectRabbitMQ() {
    try {
        const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
        connection = await amqp.connect(rabbitmqUrl);
        channel = await connection.createChannel();

        // Declarar exchange para eventos de agendamiento
        await channel.assertExchange('appointments_events', 'topic', { durable: true });

        console.log('✅ Conectado a RabbitMQ (Agendamiento)');
    } catch (error) {
        console.error('❌ Error conectando a RabbitMQ:', error.message);
        throw error;
    }
}

async function publishEvent(exchange, routingKey, message) {
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
}

async function closeConnection() {
    try {
        if (channel) await channel.close();
        if (connection) await connection.close();
        console.log('RabbitMQ desconectado');
    } catch (error) {
        console.error('Error cerrando conexión RabbitMQ:', error);
    }
}

module.exports = {
    connectRabbitMQ,
    publishEvent,
    closeConnection
};
