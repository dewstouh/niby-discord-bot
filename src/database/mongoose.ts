import { applySpeedGooseCacheLayer, SpeedGooseCacheAutoCleaner } from 'speedgoose';
import mongoose, { connect, plugin } from 'mongoose';
import Client from '../structures/Client';

import loadFiles from '../utils/loadFiles';
// Load cache if enabled
if (process.env.CACHE_DB == 'true') {
   applySpeedGooseCacheLayer(mongoose, {
      enabled: process.env.CACHE_DB == 'true',
      redisUri: process.env.REDIS_URL,
   });

   plugin(SpeedGooseCacheAutoCleaner);
}

import GuildSchema, { IGuild } from './schemas/GuildSchema';
import UserSchema, { IUser } from './schemas/UserSchema';
import { Locale } from 'discord.js';
class Database {
   private client: Client; // Replace 'any' with your actual client type

   constructor(client: Client) {
      this.client = client;
   }

   connect() {
      console.info('Conectando a la base de datos');
      // eslint-disable-next-line no-async-promise-executor
      new Promise((resolve, reject) => {
         this.loadPlugins()
            .then(() => {
               connect(process.env.DATABASE_URL)
                  .then(() => {
                     resolve(true);
                     console.success('Conectado a la base de datos de MongoDB'.blue);
                  })
                  .catch((err) => {
                     reject(false);
                     console.error('☁ ERROR AL CONECTAR A LA BASE DE DATOS DE MONGODB'.bgRed);
                     console.error(err);
                  });
            })
            .catch((err) => reject(err));
      });
   }

   async loadPlugins() {
      console.info('Cargando plugins de mongoose...');
      const mongoosePlugins = await loadFiles('/src/database/plugins');
      mongoosePlugins.forEach(async (p) => {
         plugin(await import(p));
      });
      console.success(`${mongoosePlugins.length} plugin${mongoosePlugins.length == 1 ? '' : 's'} cargados!`);
   }

   getGuildData(guildId: string, language = process.env.LANGUAGE):IGuild {
      if(!language || !(language in Locale)) language = process.env.LANGUAGE;
      return GuildSchema.findOrCreate({ guildId }, {guildId, language});
   }

   getUserData(userId: string):IUser {
      return UserSchema.findOrCreate({ userId });
   }

   async getGuildLocale(guildId: string) {
      const GUILD_DATA = await this.getGuildData(guildId);
      const locales = await this.client.cache.get('locales');
      if (locales.has(guildId)) return locales.get(guildId);
      const LOCALE = GUILD_DATA.language;
      locales.set(guildId, GUILD_DATA.language || process.env.LANGUAGE);
      return LOCALE;
   }

   async getLatency(guildId?: string): Promise<number> {
      const before = Date.now();
      if(guildId) await this.getGuildData(guildId);
      else await GuildSchema.find().limit(1).cacheQuery();
      return Math.abs(Date.now() - before);
   }

   async getPing(): Promise<number> {
      const BEFORE = Date.now();
      const MONGODB_PING = await new Promise((rs) => {
         mongoose.connection.db
            .admin()
            .ping()
            .then(() => rs(Date.now() - BEFORE))
            .catch(() => rs(0));
      });
      return Math.abs(Number(MONGODB_PING)) || 0;
   }
}

export default Database;
