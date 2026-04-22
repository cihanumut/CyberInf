const amqp = require('amqplib');

let channel = null;

const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        channel = await connection.createChannel();
        await channel.assertQueue('activity_logs', { durable: true });
        console.log('✅ RabbitMQ bağlantısı başarılı');

        // Consumer (Worker)
        channel.consume('activity_logs', (msg) => {
            if (msg !== null) {
                const log = JSON.parse(msg.content.toString());
                console.log(`[RabbitMQ Worker] Yeni İşlem: ${log.type} - Kullanıcı: ${log.user} - Zaman: ${log.time}`);
                channel.ack(msg);
            }
        });
    } catch (err) {
        console.error('❌ RabbitMQ bağlantı hatası:', err);
    }
};

const sendActivityLog = (type, user = 'System') => {
    if (!channel) return;
    const msg = { type, user, time: new Date().toISOString() };
    channel.sendToQueue('activity_logs', Buffer.from(JSON.stringify(msg)));
};

module.exports = { connectRabbitMQ, sendActivityLog };
