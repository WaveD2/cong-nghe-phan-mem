import { createClient } from 'redis';
import { config } from "dotenv";
config();


const REDIS_URI =  `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`

export const redisCacheClient = createClient({
  url: REDIS_URI,
});

export const connectRedis = async () => {
  console.log('Connecting to redis...::' , REDIS_URI);
  await redisCacheClient.connect();
};

redisCacheClient.on('connect', () => {
  console.log('REDIS: Connected cache_server: ', REDIS_URI);
});

redisCacheClient.on('reconnecting', () => {
  console.log('REDIS: Retry reconnecting: ', REDIS_URI);
});

redisCacheClient.on('error', (err: Error) => {
  console.log('REDIS: Error', err.message);
});

function encodeValue(data: unknown): string {
  return typeof data === 'string' ? data : JSON.stringify(data);
}

function tryParseJSON<T = any>(data: string): T | string {
  if (data && (data.startsWith('{') || data.startsWith('['))) {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  return data;
}

export const cacheHelper = {
  async setKeyValueExpire(
    key: string,
    data: unknown,
    expireInSeconds: number = 7 * 24 * 60 * 60
  ): Promise<void> {
    await redisCacheClient.setEx(`c:${key}`, expireInSeconds, encodeValue(data));
  },

  async setKeyValue(key: string, data: unknown): Promise<void> {
    await redisCacheClient.set(`c:${key}`, encodeValue(data));
  },

  async getKey<T = any>(key: string): Promise<T | string | null> {
    const raw = await redisCacheClient.get(`c:${key}`);
    if (raw === null) return null;
    return tryParseJSON<T>(raw);
  },

  async delKey(key: string): Promise<void> {
    await redisCacheClient.del(`c:${key}`);
  },

  async delMultiKey(keys: string[]): Promise<void> {
    if (!Array.isArray(keys) || keys.length === 0) return;
    const cacheKeys = keys.map((key) => `c:${key}`);
    await redisCacheClient.del(cacheKeys);
  },

  async getKeyIfNotDoSet<T = any>(
    key: string,
    handlerReturnData: () => Promise<T>,
    expireInSeconds?: number
  ): Promise<T | string | null> {
    const cacheKey = `c:${key}`;
    let data = await redisCacheClient.get(cacheKey);

    if (!data) {
      const newData = await handlerReturnData();
      const valueToSet = encodeValue(newData);

      if (expireInSeconds) {
        await redisCacheClient.setEx(cacheKey, expireInSeconds, valueToSet);
      } else {
        await redisCacheClient.set(cacheKey, valueToSet);
      }

      return newData;
    }

    return tryParseJSON<T>(data);
  },

  async hasKey(key: string): Promise<boolean> {
    const exists = await redisCacheClient.exists(`c:${key}`);
    return exists === 1;
  },

  async getTTLByKey(key: string): Promise<number> {
    return redisCacheClient.ttl(`c:${key}`);
  },

  async getKeyNames(pattern: string): Promise<string[]> {
    return redisCacheClient.keys(`c:${pattern}`);
  },

  async healthCheck(): Promise<string> {
    try {
      const pong = await redisCacheClient.ping();
      if (pong === 'PONG') return 'Redis is up and running.';
      throw new Error(`Unexpected response: ${pong}`);
    } catch (err: any) {
      throw new Error(`Redis healthcheck failed: ${err.message}`);
    }
  }
};
