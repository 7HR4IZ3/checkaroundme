import { createClient } from "redis";

const redisClient = createClient({
  // Configure your Redis connection URL here.
  // For local development, it's often 'redis://localhost:6379'
  // For production, use your Redis provider's URL.
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

connectRedis();

export default redisClient;
