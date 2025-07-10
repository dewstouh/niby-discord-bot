import colors from 'colors';
import { WebhookClient, ColorResolvable } from 'discord.js';
import { Embed } from '../extenders/discord/Embed';
import fs from 'fs';
import { NibyBinAPI } from '@dewstouh/nibybin-api';

type LogLevel = 'success' | 'error' | 'warn' | 'info' | 'log' | 'debug' | 'table';

type LogWebhookEmbed = {
   enabledByDefault: boolean;
   image: string;
   color: string;
   title: string;
};

type LogWebhookEmbeds = Record<LogLevel, LogWebhookEmbed>;

interface LogOptions {
   compact?: boolean;
   prefix?: string;
}

export default class Logger {
   private originalConsole: Console = {
      ...console,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      success: function (message?: any, ...optionalParams: any[]): void {
         global.console.log(message, optionalParams);
      },
      square: function (message?: any, ...optionalParams: any[]): void {
         global.console.log(message, optionalParams);
      },
   };
   private compact: boolean;
   private space = ' [::] '.white;
   private tilde = ' ~ '.magenta.bgBlack;
   private iconSeparator = '└❯';
   private separator = `\n${this.iconSeparator} `;
   private logColors: {
      title: Record<LogLevel, (text: string) => string>;
      content: Record<LogLevel, (text: string) => string>;
   } = {
      title: {
         success: colors.green.bgBlack,
         error: colors.red.bgBlack,
         warn: colors.yellow.bgBlack,
         info: colors.yellow.bgBlack,
         log: colors.white.bgBlack,
         debug: colors.gray.bgBlack,
         table: colors.blue.bgBlack,
      },
      content: {
         success: colors.green.italic,
         error: colors.red.italic,
         warn: colors.yellow.italic,
         info: colors.yellow.italic,
         log: colors.white.italic,
         debug: colors.gray.italic,
         table: colors.blue.italic,
      },
   };
   private emoji = {
      bot: '🤖',
      success: '✅',
      error: '❌',
      warn: '⚠️',
      info: '📰',
      log: '📰',
      debug: '🐞',
      table: '📘',
   };
   private logSaving: Record<LogLevel, boolean> = {
      success: true,
      error: true,
      warn: true,
      info: true,
      log: true,
      debug: true,
      table: true,
   };
   private logWebhookEmbed: LogWebhookEmbeds = {
      success: {
         enabledByDefault: false,
         image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Commons-emblem-success.svg/2048px-Commons-emblem-success.svg.png',
         color: '#14fc03',
         title: `${this.emoji.success} ¡Éxito!`,
      },
      error: {
         enabledByDefault: true,
         image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Error.svg/1200px-Error.svg.png',
         color: '#FF0000',
         title: `${this.emoji.error} ¡Error!`,
      },
      warn: {
         enabledByDefault: false,
         image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Warning.svg/1200px-Warning.svg.png',
         color: '#dea702',
         title: `${this.emoji.warn} ¡Advertencia!`,
      },
      info: {
         enabledByDefault: false,
         image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Info_icon_002.svg/1200px-Info_icon_002.svg.png',
         color: '#facc00',
         title: `${this.emoji.info} ¡Información!`,
      },
      log: {
         enabledByDefault: false,
         image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Info_icon_002.svg/1200px-Info_icon_002.svg.png',
         color: '#69b5d6',
         title: `${this.emoji.log} ¡Registro!`,
      },
      debug: {
         enabledByDefault: false,
         image: 'https://icons.veryicon.com/png/o/miscellaneous/uhuibao_yb/debug.png',
         color: '#575757',
         title: `${this.emoji.debug} ¡Depuración!`,
      },
      table: {
         enabledByDefault: false,
         image: 'https://www.svgrepo.com/download/8335/list.svg',
         color: '#000000',
         title: `${this.emoji.table} ¡Tabla!`,
      },
   };
   private levels: Record<LogLevel, string>;
   private prefix: string;
   private webhookClient: false | WebhookClient;
   private nibybin: NibyBinAPI;

   constructor(options: LogOptions = {}) {
      this.compact = options.compact ?? false;
      this.levels = {
         info: this.logColors.title.info(`${this.emoji.info} [ INFO ]`),
         log: this.logColors.title.log(`${this.emoji.info} [ LOG ]`),
         debug: this.logColors.title.debug(`${this.emoji.debug} [ DEBUG ]`),
         success: this.logColors.title.success(`${this.emoji.success} [ SUCCESS ]`),
         warn: this.logColors.title.warn(`${this.emoji.warn} [ WARN ]`),
         table: this.logColors.title.table(`${this.emoji.table} [ TABLE ]`),
         error: this.logColors.title.error(`${this.emoji.error} [ ERROR ]`),
      };
      this.prefix = options?.prefix ? `${options?.prefix} `.blue + this.space : '';
      this.webhookClient = process.env.WEBHOOK_LOGGER_URL ? new WebhookClient({ url: process.env.WEBHOOK_LOGGER_URL }) : false;
      this.nibybin = new NibyBinAPI(process.env.NIBYBIN_TOKEN as string);

      if (process.env.PRETTY_LOGGER === 'true' || process.env.SAVE_LOGS === 'true' || this.webhookClient) {
         // SI SE HA ACTIVADO LA CUSTOM CONSOLE MOSTRAR SUCCESS
         if (process.env.PRETTY_LOGGER === 'true') this.success(':: [ CUSTOM CONSOLE ENABLED ] ::');
         if (process.env.SAVE_LOGS === 'true') this.success(':: [ LOG SAVING ENABLED ] ::');
         if (this.webhookClient) this.success(':: [ WEBHOOK LOGGING ENABLED ] ::');
      }
   }

   saveLog(content: string) {
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      const formattedDate = `${year}-${month}-${day}`;

      const logFilePath = `${process.cwd()}/logs/${formattedDate}.log`;

      const logMessage = `${process.env.PRETTY_LOGGER == 'true' ? '' : `${this.getTime()}\n`}${content}\n\n`.replace(/\x1B\[\d+m/g, '');

      fs.appendFileSync(logFilePath, logMessage);
   }

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   uploadLog(logType: LogLevel, ...text: any[]) {
      const textContent = text.map((t) => t).join('\n');
      if (textContent.length >= 2000) {
         return this.nibybin
            .create({
               title: `LOG | ${logType.toUpperCase()}`,
               description: `Fecha: ${this.getTime()}`,
               language: 'javascript',
               code: textContent,
            })
            .then((x) => {
               return x.url;
            })
            .catch(() => {
               return false;
            });
      }
   }

   msUnix(...numbers: number[]) {
      if (!numbers?.length) numbers.push(Date.now());
      return Math.ceil(numbers.reduce((a, b) => a + b, 0) / 1000);
   }

   getTime() {
      const date = new Date();
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const amPm = hours >= 12 ? 'PM' : 'AM';
      return `${day}/${month}/${year} ${hours}:${minutes} ${amPm}`;
   }

   getTimeStr() {
      return `${this.getTime()}`.bgBlack;
   }

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   async sendWebhookLog(logType: LogLevel, ...text: any[]) {
      if (!this.webhookClient) return;

      const uploaded = await this.uploadLog(logType, ...text);
      const contentLogColor = this.logColors.content[logType];

      const { color, image, title } = this.logWebhookEmbed[logType];
      const mappedText = text.map((t) => (t?.stack ? t.stack : t?.detail ? t.detail : t)).join('\n');

      return this.webhookClient
         .send({
            content: `<t:${this.msUnix()}:F> | <t:${this.msUnix()}:R>`,
            username: `BOT LOGGING | ${logType.toUpperCase()}`,
            avatarURL: image,
            embeds: [
               new Embed()
                  .setTitle(title)
                  .addField('Link de salida:', `>>> **${uploaded || 'No se necesita'}**`)
                  .setDescription(`\`\`\`\n${String(mappedText).substring(0, 2000)}\n\`\`\``)
                  .setColor(color as ColorResolvable),
            ],
         })
         .catch(() => {
            this.originalConsole.log(this.getLogString(logType, ...text));
            this.originalConsole.log(contentLogColor(`${this.iconSeparator}❌ [ WEBHOOK NO ENVIADO ]`));
            if (uploaded) return this.originalConsole.log(contentLogColor(`${this.separator}✅ [ ERROR SUBIDO ]: ${uploaded}`));
         });
   }

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   handleLog(logType: LogLevel, ...text: any[]) {
      const options: { sendWebhook?: boolean } = {};

      if (this.logWebhookEmbed[logType].enabledByDefault) {
         options.sendWebhook = true;

         const lastArg = text[text.length - 1];
         if (lastArg && lastArg.sendWebhook === true) {
            options.sendWebhook = true;
            text = text.slice(0, -1);
         }
      } else {
         if (text.length > 0 && typeof text[text.length - 1] === 'object') {
            const lastArg = text[text.length - 1];
            if (lastArg && lastArg.sendWebhook === true) {
               options.sendWebhook = true;
               text = text.slice(0, -1);
            }
         }
      }

      const logString = this.getLogString(logType, ...text);
      this.originalConsole.log(logString);

      if (options.sendWebhook && this.webhookClient) {
         this.sendWebhookLog(logType, ...text);
      }

      if (this.logSaving[logType] && process.env.SAVE_LOGS === 'true') {
         this.saveLog(logString);
      }
   }

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   getLogString(logType: LogLevel, ...text: any[]) {
      if (process.env.PRETTY_LOGGER === 'true') {
         const contentLogColor = this.logColors.content[logType];
         const formattedLogContent = text.map((line) => contentLogColor(line)).join('\n');
         return [this.prefix, this.levels[logType], this.tilde, this.getTimeStr(), this.separator, formattedLogContent].join(' ');
      }

      const formattedLogContent = String(...text);
      return [formattedLogContent].join(' ');
   }

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   log(...text: any[]) {
      const logType = 'log';
      return this.handleLog(logType, ...text);
   }
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   info(...text: any[]) {
      const logType = 'info';
      return this.handleLog(logType, ...text);
   }
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   debug(...text: any[]) {
      const logType = 'debug';
      return this.handleLog(logType, ...text);
   }
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   success(...text: any[]) {
      const logType = 'success';
      return this.handleLog(logType, ...text);
   }
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   warn(...text: any[]) {
      const logType = 'warn';
      return this.handleLog(logType, ...text);
   }
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   error(...text: any[]) {
      const logType = 'error';
      return this.handleLog(logType, ...text);
   }
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   pure(...text: any[]) {
      return this.originalConsole.log(...text);
   }
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   raw(...text: any[]) {
      return this.pure(...text);
   }
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   table(data: any[]) {
      this.originalConsole.log(`┌${this.emoji.table} ${this.prefix}${this.levels.table}${this.tilde}${this.getTimeStr()}\n└❯ `);
      return this.originalConsole.table(data);
   }
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   custom(key: string, ...text: any[]) {
      return this.originalConsole.log(`${this.getTimeStr()}${this.space}${this.prefix}${key}${this.tilde}:`, ...text);
   }
//    square(...text) {
//       const stringlength = 55;
//       const centeredText = [String(...text)].join(" ")
//       const squareLog = `\n
// ╔═════════════════════════════════════════════════════╗
// ║${" ".repeat(-1 + stringlength - 1)}║
// ║${" ".repeat(-1 + stringlength - 1)}${center}║
// ║${" ".repeat(-1 + stringlength - 1)}║
// ╚═════════════════════════════════════════════════════╝
// `
//       return this.log(squareLog);
//    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global.console as any) = new Logger();
