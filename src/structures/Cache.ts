import * as cron from 'cron';
import { RedisClientType } from 'redis';

export class Cache {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   private cache: Map<string, { value: any; expirationTime?: number }> = new Map();

   constructor() {
      // Configura un cron para verificar y eliminar elementos expirados cada 60 segundos
      const job = new cron.CronJob('*/60 * * * * *', this.cleanExpiredItems.bind(this));
      job.start();
   }

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   set(key: string, value: any, lifetimeInSeconds = 0) {
      if (lifetimeInSeconds) {
         const expirationTime = Date.now() + lifetimeInSeconds;
         this.cache.set(key, { value, expirationTime });
      } else {
         this.cache.set(key, { value });
      }

      return value;
   }

   get(key: string) {
      const item = this.cache.get(key);
      if (item && (!item.expirationTime || item.expirationTime > Date.now())) {
         return item.value;
      }
      this.remove(key);
      return null;
   }

   delete(key: string) {
      this.cache.delete(key);
   }

   remove(key: string) {
      this.cache.delete(key);
   }

   random() {
      const keys = Array.from(this.cache.keys());
      const randomKey = keys.random();
      return randomKey ? this.get(randomKey) : null;
   }

   first() {
      this.cache.entries().next().value;
   }

   keys(pattern: string): string[] {
      const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*'));
      const keys = Array.from(this.cache.keys());
      const matchingKeys = keys.filter((key) => regexPattern.test(key));
      return matchingKeys;
    }

   cleanExpiredItems() {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
         if (item.expirationTime && now >= item.expirationTime) {
            this.cache.delete(key);
         }
      }
   }
}

export class RedisCache {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   redis: RedisClientType;

   constructor(redisClient: RedisClientType) {
      this.redis = redisClient;
   }

   async keys(pattern):Promise<string[]>{
      return await this.redis.keys(pattern);
   }

   async set(key: string, value: any, lifetimeInSeconds: number = 0): Promise<any> {
      const stringifiedValue = JSON.stringify(value);
      if (lifetimeInSeconds) {
         await this.redis.setEx(key, lifetimeInSeconds, stringifiedValue);
      } else {
         await this.redis.set(key, stringifiedValue);
      }

      return value;
   }

   async get(key): Promise<any> {
      const stringifiedValue = await this.redis.get(key);
      if (stringifiedValue !== null) {
         return JSON.parse(stringifiedValue);
      }
      return null;
   }

   async delete(key): Promise<any> {
      return await this.redis.del(key);
   }

   async remove(key): Promise<any> {
      return await this.redis.del(key);
   }
}
