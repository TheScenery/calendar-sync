import { Redis } from 'ioredis';

// 初始化Redis客户端
const getRedisClient = () => {
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL);
  }
  // 默认连接到本地Redis
  return new Redis();
};

// 创建Redis客户端作为全局实例
const globalForRedis = global as unknown as {
  redis: Redis | undefined;
};

const redis = globalForRedis.redis ?? getRedisClient();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

export default redis; 