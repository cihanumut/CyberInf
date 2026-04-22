const redis = require('redis');

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: false
    }
});

redisClient.on('error', (err) => console.error('❌ Redis Hatası:', err));
redisClient.on('connect', () => console.log('✅ Redis bağlantısı başarılı'));

const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Redis bağlanılamadı:', err);
    }
};

module.exports = { redisClient, connectRedis };
