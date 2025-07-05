import { createClient } from 'redis';

const redisClient = createClient({
    url: process.env.REDIS_URL, 
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Connected to Redis'));
redisClient.on('ready', () => console.log('Redis Client Ready'));


async function connectRedis() {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
}

connectRedis();

export default redisClient;