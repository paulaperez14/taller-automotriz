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

        // Suscribirse al exchange de citas para escuchar cuando se completan
        await channel.assertExchange('appointments_events', 'topic', { durable: true });

        console.log('✅ Conectado a RabbitMQ (Reparaciones)');
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

const subscribeToAppointmentEvents = async (handler) => {
    if (!channel) {
        throw new Error('RabbitMQ no está conectado');
    }

    try {
        const queue = 'reparaciones_citas_completadas';
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, 'appointments_events', 'appointment.completed');

        console.log(`📩 Escuchando eventos de citas completadas...`);

        channel.consume(queue, async (msg) => {
            if (msg) {
                try {
                    const event = JSON.parse(msg.content.toString());
                    console.log(`📨 Evento recibido: appointment.completed`, event);
                    await handler(event);
                    channel.ack(msg);
                } catch (error) {
                    console.error('Error procesando evento de cita:', error);
                    channel.nack(msg, false, false); // No reencolar
                }
            }
        });
    } catch (error) {
        console.error('Error suscribiéndose a eventos de citas:', error);
        throw error;
    }
}; module.exports = {
    connectRabbitMQ,
    getChannel,
    publishEvent,
    subscribeToAppointmentEvents
};
