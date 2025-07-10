import { ColorResolvable } from 'discord.js';
import { Locale } from '../src/typings/locales';
import { PaypalMode } from '../src/structures/PaypalManager';
declare global {
   // eslint-disable-next-line @typescript-eslint/no-namespace
   namespace NodeJS {
      interface ProcessEnv {
         BOT_TOKEN: string;
         DATABASE_URL: string;
         LANGUAGE: Locale;
         RELEASE_DATE: string;

         TOTAL_SHARDS: number;
         SHARDS_PER_CLUSTER: number;
         SHARDING_MODE: string;

         CACHE_DB: string;
         REDIS_URL: string;
         REDIS_PASSWORD: string;

         PREFIX: string;
         STATUS: string;
         STATUS_TYPE: string;
         DEFAULT_COLOR: ColorResolvable;
         COOLDOWN_COLOR: ColorResolvable;
         ERROR_COLOR: ColorResolvable;
         OWNER_IDS: string;
         DISCORD: string;
         VERSION: string;

         CLIENT_ID:string;

         DASHBOARD: string;
         WEB_DOMAIN: string;
         GLOBAL_TOKEN:string
         RATE_LIMIT_COOLDOWN:string
         MAX_REQUESTS_PER_COOLDOWN:string
         CLIENT_SECRET:string


         PORT: string;
         PRETTY_LOGGER: string;
         SAVE_LOGS: string;
         WEBHOOK_LOGGER_URL: string;
         NIBYBIN_TOKEN: string;
         RELE: string;

         PAYPAL_MODE:PaypalMode
         PAYPAL_CLIENT:string,
         PAYPAL_SECRET:string,
      }
   }
}
