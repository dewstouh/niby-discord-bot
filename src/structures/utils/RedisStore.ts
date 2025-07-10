import { QueueStoreManager, StoredQueue } from 'lavalink-client';
import { RedisClientType } from 'redis';

export default class RedisStore implements QueueStoreManager {
   private redis: RedisClientType;
   constructor(redisClient: RedisClientType) {
      this.redis = redisClient;
   }
   async get(guildId): Promise<any> {
      return await this.redis.get(this.id(guildId));
   }

   async getAllQueueKeys(): Promise<string[]> {
      const keys = await this.redis.keys('lavalinkqueue_*');
      return keys;
   }

   async set(guildId, stringifiedQueueData): Promise<any> {
      // await this.delete(guildId); // redis requires you to delete it first;
      return await this.redis.set(this.id(guildId), stringifiedQueueData);
   }
   async delete(guildId): Promise<any> {
      return await this.redis.del(this.id(guildId));
   }
   parse(stringifiedQueueData): Promise<Partial<StoredQueue>> {
      return JSON.parse(stringifiedQueueData);
   }
   // @ts-ignore
   // eslint-disable-next-line require-await
   async stringify(parsedQueueData): Promise<any> {
      return JSON.stringify(parsedQueueData);
   }
   // you can add more utils if you need to...
   private id(guildId) {
      return `lavalinkqueue_${guildId}`; // transform the id
   }
}
