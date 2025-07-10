/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
   ActivityType,
   ApplicationCommandDataResolvable,
   ChannelType,
   Collection,
   Client as DiscordClient,
   ClientOptions as DiscordClientOptions,
   GatewayIntentBits,
   Locale as DiscordLocale,
   OAuth2Scopes,
   Options,
   Partials,
   PermissionFlagsBits,
   PresenceUpdateStatus,
   SlashCommandBuilder,
} from 'discord.js';
import { ClusterClient, getInfo } from 'discord-hybrid-sharding';
import ClientUtils from '../structures/ClientUtils';
import path from 'path';
import EmojiList from '../config/EmojiList';
import { CommandCooldown } from '../typings/command';
import { Component, Components } from '../typings/component';
import { Cache, RedisCache } from './Cache';
import Database from '../database/mongoose';
import { promises } from 'fs';
import { Locale } from '../typings/locales';
import ezLoad from '../utils/ezLoad';
import { Command } from './Command';
import CustomStatus from '../config/status';
import * as redis from 'redis';
import LavalinkManager from './LavalinkManager';
import { Category } from './Category';
import GiveawaysManager from './GiveawaysManager';
import { SubCategory } from './SubCategory';
import { Snipe } from '../typings/snipes';
import { System } from '../typings/system';
import PaypalManager from './PaypalManager';

const DefaultClientOptions = {
   shards: getInfo().SHARD_LIST, // An array of shards that will get spawned
   shardCount: getInfo().TOTAL_SHARDS, // Total number of shards
   intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildPresences,
   ],
   partials: [Partials.User, Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction],
   sweepers: {
      voiceStates: {
         interval: 3600, // Every hour...
         filter: () => (state) => state.id !== state.client.user.id && state.channel && state.channel.members && state.channel.members.filter(m => !m.user.bot).size < 1
      }, // DON'T
      bans: {
         interval: 3600, // Every hour...
			filter: () => () => true, // Remove all bans.
      },
      messages: {
			interval: 3600, // Every hour...
			lifetime: 1800, // Remove messages older than 30 minutes.
		},
      users: {
			interval: 3600, // Every hour...
			filter: () => user => user.id !== user.client.user.id, // Remove all BOTS.
		},
      reactions: {
			interval: 3600, // Every hour...
			filter: () => () => true, // Remove all reactions.
		},
      threads: {
			interval: 3600, // Every hour...
			lifetime: 1800, // Remove messages older than 30 minutes.
			filter: () => () => true, // Remove all threads.
		},
      invites: {
			interval: 3600, // Every hour...
			filter: () => () => true, // Remove all invites.
		},
      stickers: {
			interval: 3600, // Every hour...
			filter: () => () => true, // Remove all stickers.
		},
      guildMembers: {
			interval: 3600, // Every hour...
			filter: () => (member) => member.user.id !== member.client.user.id && !member.voice.channelId, // Remove all guildMembers except myself and connected vcs.
		},
      autoModerationRules: {
			interval: 3600, // Every hour...
			filter: () => () => true, // Remove all autoModerationRules.
		},
   },
   makeCache: Options.cacheWithLimits({
      ...Options.DefaultMakeCacheSettings,
      ...{
         AutoModerationRuleManager: 0,
         ApplicationCommandManager: 0,
         // BaseGuildEmojiManager: 0,
         // GuildEmojiManager: 0,
         GuildBanManager: 0,
         UserManager: 0,
         GuildMemberManager: {
            // maxSize: 200,
            keepOverLimit: member => member.id === member.client.user.id,
         },
         GuildForumThreadManager: 0,
         GuildInviteManager: 0,
         // GuildMessageManager: 0,
         GuildScheduledEventManager: 0,
         GuildStickerManager: 0,
         GuildTextThreadManager: 0,
         // MessageManager: 0,
         // PresenceManager: 0,
         StageInstanceManager: 0,
         ThreadManager: 0,
         ThreadMemberManager: 0,
         // ReactionManager: 0,
         // ReactionUserManager: 0,
         // VoiceStateManager: 0,
      },
   }),
   presence: {
      activities: [
         {
            name: 'Iniciando...',
            type: ActivityType.Custom,
         },
      ],
      status: PresenceUpdateStatus.Online,
   },
   failIfNotExists: false,
   allowedMentions: {
      parse: ['users'],
      roles: [],
      users: [],
      repliedUser: false,
   },
} as DiscordClientOptions;

interface Wrappers {
   [wrapperName: string]: any; // Puedes ajustar 'any' al tipo más específico si lo tienes
}

export default class Client extends DiscordClient {
   cluster: ClusterClient<Client> = new ClusterClient(this);
   db: Database = new Database(this);
   utils: ClientUtils = new ClientUtils(this);
   allemojis: typeof EmojiList = EmojiList;
   cooldowns: CommandCooldown = {
      user: new Collection(),
      guild: new Collection(),
      global: new Collection(),
   };
   // db: Database = new Database();
   cache: Cache;
   events: Collection<string, Event> = new Collection();
   commands: Collection<string, Command> = new Collection();
   categories: Collection<string, Category> = new Collection();
   subCategories: Collection<string, SubCategory> = new Collection();
   buttons: Collection<string, Component> = new Collection();
   menus: Collection<string, Component> = new Collection();
   contextmenus: Collection<string, Component> = new Collection();
   modals: Collection<string, Component> = new Collection();
   slashArray: ApplicationCommandDataResolvable[] = [];
   contextArray: [] = [];
   invite: string | undefined;
   wrappers: Wrappers = {};
   statusIndex: number = 0;
   redisClient: redis.RedisClientType | null = null;
   // @ts-ignore | SI SE VA A INICIAR
   redisCache: RedisCache | Cache;
   // @ts-ignore | SI SE VA A INICIAR
   lavalink: LavalinkManager;
   giveawaysManager: GiveawaysManager = new GiveawaysManager(this);
   translate: (locale: Locale, text: string, ...params: object[]) => string;
   snipes: Collection<string, Snipe> = new Collection();
   systems: Collection<string, System> = new Collection();
   released: boolean = Date.now() >= parseInt(process.env.RELEASE_DATE);
   paypal:PaypalManager = new PaypalManager({
      mode: process.env.PAYPAL_MODE,
      user: process.env.PAYPAL_CLIENT,
      secret: process.env.PAYPAL_SECRET,
  });

   constructor(options?: DiscordClientOptions) {
      super(options || DefaultClientOptions);

      this.translate = this.utils.locale.inlineLocale;

      this.cache = new Cache();
      this.cache.set('fetchedApplication', []);
      // @ts-ignore
      this.cache.set('locales', new Collection());
      this.start();
   }

   private loadRedis() {
      if (process.env.CACHE_DB == 'true') {
         this.redisClient = redis.createClient({
            url: process.env.REDIS_URL,
            password: process.env.REDIS_PASSWORD,
         });

         return this.redisClient
            .connect()
            .then(() => {
               console.success('Conectado a la caché de REDIS!');
               return (this.redisCache = new RedisCache(this.redisClient as redis.RedisClientType));
            })
            .catch((err) => {
               console.success('Fallado al conectar a la caché de REDIS, usando la caché del bot en su lugar!');
               console.error(err);
               this.redisCache = this.cache;
            });
      }
      return (this.redisCache = this.cache);
   }

   private async start() {
      if(this.released){
         await this.loadExtenders();
         await this.loadRedis(); // Carga la caché de redis o usa la default como fallback

         this.lavalink = new LavalinkManager(this);

         await this.loadEvents();
         await this.loadHandlers();

         // WRAPPERS | PRE-ESSENTIALS
         await this.loadWrappers();

         // BOT ESSENTIALS
         this.loadAllComponents();
         await this.loadCommands();
         await this.db.connect();
      } else {
         await this.loadExtenders();
         await this.loadRedis(); // Carga la caché de redis o usa la default como fallback

         this.lavalink = new LavalinkManager(this);
         const ruta = `${process.cwd()}/dist/events/bot/client/ready.js`;
         const PULL = (await import(ruta)).default;
         const PULL_NAME = path.basename(ruta).split('.')[0];
         PULL.NAME = path.basename(ruta).split('.')[0];
         PULL.PATH = ruta;
         PULL.LANG_KEY = `EVENTS.${PULL_NAME}.execute`;
         this.on(PULL_NAME, PULL.bind(null, this));

         // await this.loadEvents();
         // await this.loadHandlers();

         // WRAPPERS | PRE-ESSENTIALS
         // await this.loadWrappers();

         // BOT ESSENTIALS
         // this.loadAllComponents();
         // await this.loadCommands();
         await this.db.connect();
      }
      // ESSENTIALS


      this.login(process.env.BOT_TOKEN);
   }

   async reloadAll() {
      // Data
      await this.utils.general.loadFiles('src/data');

      // Structures
      await this.utils.general.loadFiles('src/structures');

      const newEmojiList = await ezLoad('src/config/EmojiList');
      const newBotUtils = await ezLoad('src/structures/ClientUtils');

      // Set things up
      this.allemojis = newEmojiList;
      this.utils = new newBotUtils(this);

      await this.loadExtenders();
      await this.loadEvents();
      await this.loadHandlers();

      // WRAPPERS | PRE-ESSENTIALS
      await this.loadWrappers();

      await this.loadAllComponents();
      await this.loadCommands();
      await this.publishCommands();
   }

   async loadEvents(dir: string = '/src/events/bot') {
      console.info('(+) Cargando eventos de bot');

      this.removeAllListeners();

      const RUTA_ARCHIVOS = await this.utils.general.loadFiles(dir);
      const RUTA_EVENTOS = RUTA_ARCHIVOS.filter((p) => !p.includes('systems'));
      const RUTA_SISTEMAS = RUTA_ARCHIVOS.filter((p) => p.includes('systems'));

      if (RUTA_EVENTOS.length) {
         await Promise.all(
            RUTA_EVENTOS.map(async (ruta) => {
               const PULL = (await import(ruta)).default;
               const PULL_NAME = path.basename(ruta).split('.')[0];
               PULL.NAME = path.basename(ruta).split('.')[0];
               PULL.PATH = ruta;
               PULL.LANG_KEY = `EVENTS.${PULL_NAME}.execute`;
               this.on(PULL_NAME, PULL.bind(null, this));
               this.events.set(PULL_NAME, PULL);
               const EVENT_NAME = PULL_NAME;

               const eventSystemsPath = RUTA_SISTEMAS.filter((p) => p.includes(PULL_NAME));
               if (eventSystemsPath.length) {
                  eventSystemsPath.map(async (systemPath) => {
                     const PULL = (await import(systemPath)).default;
                     PULL.NAME = path.basename(systemPath).split('.')[0];
                     PULL.PATH = systemPath;
                     PULL.EVENT = EVENT_NAME;
                     PULL.LANG_KEY = `EVENTS.${EVENT_NAME}.SYSTEMS.${PULL.NAME}.execute`;
                     const PULL_NAME = path.basename(systemPath).split('.')[0];
                     this.systems.set(PULL_NAME, PULL);
                  });
               }
            }),
         );
      }
      console.success(`(+) ${RUTA_EVENTOS.length} ${RUTA_EVENTOS.length !== 1 ? 'Eventos de Bot Cargados' : 'Evento de Bot Cargado'}`);
   }

   async loadHandlers(dir: string = '/src/handlers') {
      console.info('(-) Cargando handlers');

      const RUTA_ARCHIVOS = await this.utils.general.loadFiles(dir, undefined, [
         'CommandHandler.js',
         'ComponentHandler.js',
         'SystemHandler.js',
      ]);
      if (RUTA_ARCHIVOS.length) {
         await Promise.all(
            RUTA_ARCHIVOS.map(async (ruta) => {
               (await import(ruta)).default(this);
            }),
         );
      }
      console.success(`(-) ${RUTA_ARCHIVOS.length} ${RUTA_ARCHIVOS.length !== 1 ? 'Handlers Cargados' : 'Handler Cargado'}`);
   }

   async loadWrappers(dir: string = '/src/structures/wrappers') {
      console.info('(-) Cargando handlers');

      this.wrappers = {};

      const RUTA_ARCHIVOS = await this.utils.general.loadFiles(dir);

      if (RUTA_ARCHIVOS.length) {
         RUTA_ARCHIVOS.forEach(async (ruta) => {
            try {
               const WrapperClass = (await import(ruta)).default;
               const NOMBRE_WRAPPER = ruta!.split('\\')!.pop()!.split('/')!.pop()!.split('.')[0];
               const API_TOKEN = process.env[`${NOMBRE_WRAPPER}_TOKEN`.toUpperCase()];
               this.wrappers[NOMBRE_WRAPPER!.toLowerCase()] = new WrapperClass({ token: API_TOKEN, cache: this.cache });
            } catch (e) {
               console.error(`ERROR AL CARGAR EL EVENTO ${ruta}`);
               console.error(e);
            }
         });
      }
      console.success(`(-) ${RUTA_ARCHIVOS.length} ${RUTA_ARCHIVOS.length !== 1 ? 'Handlers Cargados' : 'Handler Cargado'}`);
   }

   async loadExtenders(dir: string = '/src/extenders') {
      console.log('(-) Cargando extensores'.yellow);

      const RUTA_ARCHIVOS = await this.utils.general.loadFiles(dir);
      if (RUTA_ARCHIVOS.length) {
         await Promise.all(
            RUTA_ARCHIVOS.map(async (ruta) => {
               (await import(ruta)).default;
            }),
         );
      }
      console.success(`(-) ${RUTA_ARCHIVOS.length} ${RUTA_ARCHIVOS.length !== 1 ? 'Extensores Cargados' : 'Extensor Cargado'}`);
   }

   loadAllComponents() {
      Object.keys(Components).forEach(async (component) => {
         await this.loadComponent(component as string);
      });
   }

   async loadComponent(component: string) {
      console.info(`([x]) Cargando ${`${component}`.capitalizeFirstChar().removeLastChar()}`);
      const baseDir = `${process.cwd().replace(/\\/g, '/')}/dist/components/${component}`;
      await this[component].clear();

      const RUTA_ARCHIVOS = await this.utils.general.loadFiles(`/src/components/${component}`);
      if (RUTA_ARCHIVOS.length) {
         await Promise.all(
            RUTA_ARCHIVOS.map(async (ruta) => {
               const PULL = (await import(ruta)).default;
               const PULL_NAME = ruta
                  .replace(baseDir, '')
                  .slice(1)
                  .split('/')
                  .map((part) => part.replace(/\.[^/.]+$/, ''))
                  .join('-')
                  .toLowerCase();

               PULL.LANG_KEY = `COMPONENTS.BUTTONS.${PULL_NAME}.execute`;
               PULL.LANG_PATH = `COMPONENTS.BUTTONS.${PULL_NAME}`;


               this[component].set(PULL_NAME, PULL);
            }),
         );
      }
      console.success(
         `([x]) ${RUTA_ARCHIVOS.length} ${
            RUTA_ARCHIVOS.length !== 1
               ? `${component[0].toUpperCase()}${component.slice(1)} Cargados`
               : `${component.capitalizeFirstChar().removeLastChar()} Cargado`
         }`,
      );
   }

   async loadCommands(originDir = '/dist/commands') {
      try {
         this.slashArray = [];
         await this.commands.clear();

         const dirs = (await promises.readdir(`${process.cwd()}${originDir}`)).filter((d) => !d.endsWith('.ts'));
         for (const dir of dirs) {
            // If its a category aka subcommand / groupcommand:
            if (!dir.endsWith('.js') && (await promises.lstat(`${process.cwd()}${originDir}/${dir}/`).catch(() => null))?.isDirectory?.()) {
               const category = new Category(this, { name: dir });
               this.categories.set(dir, category);
               // Set the SubCommand as a Slash Builder

               const subSlash = new SlashCommandBuilder().setName(String(dir).toLowerCase()).setDescription(`Mira los comandos de ${dir}`);

               const slashCommands = await promises
                  .readdir(`${process.cwd()}${originDir}/${dir}/`)
                  .then((files) => files.filter((file) => !file.endsWith('.ts')));

               for (const file of slashCommands) {
                  const curPath = `${process.cwd()}${originDir}/${dir}/${file}`;
                  // If it's /commands/slash/XYZ/GROUP/cmd.js
                  const lstat = await promises.lstat(curPath);
                  if (lstat.isDirectory?.()) {
                     const subCategory = new SubCategory(this, { name: file, parentCategory: category });
                     this.subCategories.set(`${dir} ${file}`, subCategory);
                     const groupPath = curPath;
                     /* Const groupDirSetup = thisDirSetup.groups?.find(x => x.Folder.toLowerCase() == file.toLowerCase())
                            if (!groupDirSetup) {
                                this.logger.error(`Could not find the groupDirSetup for ${dir}/${file}`);
                                continue;
                            }*/
                     const slashCommands = await promises.readdir(groupPath).then((x) => x.filter((v) => !v.endsWith('.ts')));
                     if (slashCommands?.length) {
                        const commands = {};

                        // CLEAR CMD CACHE
                        for (const sFile of slashCommands) {
                           const groupCurPath = `${groupPath}/${sFile}`;
                           delete require.cache[require.resolve(groupCurPath)];
                           commands[sFile] = (await import(groupCurPath)).default;
                        }
                        subSlash.addSubcommandGroup((Group) => {
                           Group.setName(String(file).toLowerCase()).setDescription(`Mira los comandos de ${dir}/${file}`);
                           /* If(groupDirSetup.localizations?.length) {
                                        for(const localization of groupDirSetup.localizations) {
                                            if(localization.name) Group.setNameLocalization(localization.name[0], localization.name[1]);
                                            if(localization.description) Group.setDescriptionLocalization(localization.description[0], localization.description[1]);
                                        }
                                    }*/
                           // Get all slashcommands inside of this group folder
                           for (const sFile of slashCommands) {
                              const command = commands[sFile];
                              if (!command?.execute) {
                                 console.error(`El comando ${dir}/${file}/${sFile} no está configurado!`);
                                 continue;
                              }
                              // Build the Command
                              const builtCommand = new Command(this, {
                                 command,
                                 dir: dir?.toLowerCase(),
                                 subdir: file?.toLowerCase(),
                                 name: sFile?.split('.')[0].toLowerCase(),
                                 category: subCategory,
                              });

                              if (builtCommand.NSFW) subSlash.setNSFW(builtCommand.NSFW);

                              Group.addSubcommand((Slash) => {
                                 Slash.setName(builtCommand.NAME).setDescription(builtCommand.DESCRIPTION);
                                 if (builtCommand.LOCALIZATIONS?.length) {
                                    for (const localization of builtCommand.LOCALIZATIONS) {
                                       if (localization.name)
                                          Slash.setNameLocalization(localization.name[0] as DiscordLocale, localization.name[1]);
                                       if (localization.description)
                                          Slash.setDescriptionLocalization(
                                             localization.description[0] as DiscordLocale,
                                             localization.description[1],
                                          );
                                    }
                                 }
                                 this.buildOptions(
                                    builtCommand,
                                    Slash,
                                    `COMMANDS.${dir.toUpperCase()}.${file.toUpperCase()}.${builtCommand.NAME}.OPTIONS.`,
                                 );
                                 return Slash;
                              });
                              console.success(`Cargado /SLASH -> GRUPO -> SUB ${builtCommand.KEY}`);
                              this.commands.set(dir.toLowerCase() + String(file).toLowerCase() + builtCommand.NAME, builtCommand);
                           }
                           return Group;
                        });
                     }
                  }
                  // If it's /commands/DIR/cmd.js
                  else {
                     delete require.cache[require.resolve(curPath)];
                     const command = (await import(curPath)).default;
                     if (!command?.execute) {
                        console.error(`El comando ${dir}/${file} no está configurado!`);
                        continue;
                     }

                     // Build the Command
                     const builtCommand = new Command(this, {
                        command,
                        dir: dir.toLowerCase(),
                        name: file.split('.')[0].toLowerCase(),
                        category,
                     });

                     if (builtCommand.NSFW) subSlash.setNSFW(builtCommand.NSFW);

                     subSlash.addSubcommand((Slash) => {
                        Slash.setName(builtCommand.NAME).setDescription(builtCommand.DESCRIPTION);
                        if (builtCommand.LOCALIZATIONS?.length) {
                           for (const localization of builtCommand.LOCALIZATIONS) {
                              if (localization.name) Slash.setNameLocalization(localization.name[0] as DiscordLocale, localization.name[1]);
                              if (localization.description)
                                 Slash.setDescriptionLocalization(
                                    localization.description[0] as DiscordLocale,
                                    localization.description[1],
                                 );
                           }
                        }
                        this.buildOptions(builtCommand, Slash, `COMMANDS.${dir.toUpperCase()}.${builtCommand.NAME}.OPTIONS.`);
                        return Slash;
                     });
                     console.success(`Cargado /SLASH -> SUB: ${builtCommand.KEY}`);
                     this.commands.set(dir.toLowerCase() + builtCommand.NAME, builtCommand);
                  }
               }
               this.slashArray.push(subSlash.toJSON());
            } else {
               const curPath = `${process.cwd()}${originDir}/${dir}`;
               delete require.cache[require.resolve(curPath)];
               const command = (await import(curPath)).default;
               if (!command?.execute) {
                  console.error(`El comando ${dir} no está configurado!`);
                  continue;
               }

               const builtCommand = new Command(this, {
                  command,
                  name: dir?.toLowerCase()?.split('.')?.[0],
               });

               const Slash = new SlashCommandBuilder().setName(builtCommand.NAME).setDescription(builtCommand.DESCRIPTION || 'Temp_Desc');

               // if (builtCommand.PERMISSIONS) Slash.setDefaultMemberPermissions(builtCommand.PERMISSIONS);
               if (builtCommand.NSFW) Slash.setNSFW(builtCommand.NSFW);
               if (builtCommand.LOCALIZATIONS?.length) {
                  for (const localization of builtCommand.LOCALIZATIONS) {
                     if (localization.name) Slash.setNameLocalization(localization.name[0] as DiscordLocale, localization.name[1]);
                     if (localization.description)
                        Slash.setDescriptionLocalization(localization.description[0] as DiscordLocale, localization.description[1]);
                  }
               }
               this.buildOptions(builtCommand, Slash, `COMMANDS.${builtCommand.NAME}.OPTIONS.`);
               console.success(`Cargado /SLASH: ${builtCommand.KEY}`);
               this.commands.set(builtCommand.NAME, builtCommand);
               this.slashArray.push(Slash.toJSON());
               continue;
            }
         }
      } catch (e) {
         console.error(e);
      }
      return true;
   }

   buildOptions(command, Slash, cmdKey) {
      try {
         Slash.setName(command.NAME);
         Slash.setDescription(command.DESCRIPTION);

         if (command.LOCALIZATIONS?.length) {
            for (const localization of command.LOCALIZATIONS) {
               if (localization.name) Slash.setNameLocalization(localization.name[0], localization.name[1]);
               if (localization.description) Slash.setDescriptionLocalization(localization.description[0], localization.description[1]);
            }
         }

         if (!command.OPTIONS?.length) {
            return;
         }

         let index = 0;

         for (const option of command.OPTIONS) {
            const OPTION_KEY = `${Object.keys(option)}`;
            const THIS_OPTION = option[OPTION_KEY];

            const optionNameNormalized = this.utils.locale
               .inlineLocale(process.env.LANGUAGE as Locale, `${command.LANG_PATH}.USAGE`)
               .replace(/[^a-zA-Z0-9\sáéíóúü]/g, '') // Elimina caracteres especiales
               .split(/<([^>]*)>/)
               .filter((elemento) => (elemento.trim() !== ''))
               .map((elemento) => elemento.toLowerCase())
               .join("")
               .split(" ")[index].substring(0, 20)

            THIS_OPTION.NAME = optionNameNormalized;
            THIS_OPTION.DESCRIPTION = this.translate(process.env.LANGUAGE as Locale, `${cmdKey}${index}${OPTION_KEY}.DESCRIPTION`);

            if (THIS_OPTION.CHOICES?.length >= 1) {
               THIS_OPTION.CHOICES = THIS_OPTION.CHOICES.map((choice) => {
                  const CHOICE_NAME = this.utils.locale
                     .inlineLocale(process.env.LANGUAGE, cmdKey + `${index}${OPTION_KEY}.CHOICES.${choice}`)
                     .split('.')
                     .join('')
                     .substring(0, 20);
                  const CHOICE_NAME_LOCALES = this.utils.locale.inlineChoicesLocale(cmdKey + `${index}${OPTION_KEY}.CHOICES.${choice}`);
                  const CHOICE_VALUE = choice;
                  return {
                     name: CHOICE_NAME,
                     name_localizations: CHOICE_NAME_LOCALES,
                     value: CHOICE_VALUE,
                  };
               });
            }

            const optionHandlers = {
               USER: 'addUserOption',
               ATTACHMENT: 'addAttachmentOption',
               NUMBER: 'addNumberOption',
               NUMBER_CHOICES: 'addIntegerOption',
               STRING: 'addStringOption',
               STRING_CHOICES: 'addStringOption',
               CHANNEL: 'addChannelOption',
               ROLE: 'addRoleOption',
               BOOLEAN: 'addBooleanOption',
               MENTIONABLE: 'addMentionableOption',
            };

            const optionType = Object.keys(optionHandlers).find((type) => option[type] && (option[type].NAME) && option[type].DESCRIPTION);

            if (optionType) {
               const optionHandler = optionHandlers[optionType];
               if (Slash[optionHandler])
                  Slash[optionHandler]((op) => {
                     op.setName(String(THIS_OPTION.NAME)).setDescription(THIS_OPTION.DESCRIPTION).setRequired(!!THIS_OPTION.REQUIRED);

                     if (THIS_OPTION.CHOICES) {
                        op.addChoices(...THIS_OPTION.CHOICES.slice(0, 25));
                     }

                     if (option.CHANNEL?.TYPES) {
                        op.addChannelTypes(...option.CHANNEL.TYPES.map((type) => ChannelType[type]));
                     }

                     if (option.LOCALIZATIONS?.length) {
                        for (const localization of option.LOCALIZATIONS) {
                           if (localization.name) {
                              op.setNameLocalization(localization.name[0], localization.name[1]);
                           }
                           if (localization.description) {
                              op.setDescriptionLocalization(localization.description[0], localization.description[1]);
                           }
                        }
                     }

                     return op;
                  });
            } else {
               console.error(`:: EL SLASH COMMAND ${cmdKey} NO ESTÁ CONFIGURADO!`);
            }

            index++;
         }

         return true;
      } catch (e) {
         console.error(e);
      }
   }

   setInvite() {
      if (this.cluster.id !== 0) return;
      return (this.invite = this.generateInvite({
         permissions: [PermissionFlagsBits.Administrator],
         scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
      }));
   }

   async publishCommands() {
      if (this.cluster.id !== 0) return;
      if (!this.application) return;
      await this.application.commands
         .set(this.slashArray)
         .then(() => {
            console.success(`SLASH-CMDS | Establecidos ${this.commands.size} slash commands globalmente!`);
         })
         .catch((e) => {
            console.error(e);
         });
      return true;
   }

   async prepareCommands() {
      // On Ready Execute - with 1 second delay for making 100% sure it's ready
      // Const guild = process.env.DEVGUILD ? await this.cluster.broadcastEval(`this.guilds.cache.has('${process.env.DEVGUILD}') ? true : false`).then(x => x.filter(v => v === true).length > 0) : false;
      if (!this.application) return;
      const allSlashs =
         (await this.application.commands
            .fetch(undefined, { guildId: undefined })
            // @ts-ignore
            .then((x) => [...x.values()])
            .catch((e) => console.error(e))) || [...this.application.commands.cache.values()] ||
         [];
      if (allSlashs?.length) {
         this.cache.set('fetchedApplication', allSlashs);
         for (const [key, value] of [...this.commands.entries()]) {
            if (value.KEY) {
               const Base = value.KEY.split(' ')[0].replace('/', '');
               // Console.log(key, Base)
               value.ID = allSlashs.find((c) => c.name === Base)?.permissions?.commandId || '0';
               // Console.log(key, Base, allSlashs.find(c => c.name === Base))
               value.MENTION = value.MENTION.replace('commandId', value.ID || '6969696969696');
               this.commands.set(key, value);
            }
         }
         console.success(`Menciones de comandos establecidas en: ${this.commands.size} Comandos (${allSlashs.length})`);
      } else console.error('❌ No se han encontrado menciones para slash.');
      return true;
   }

   updateStatus() {
      if (!this.user) return;
      const shardIds = [...this.cluster.ids.keys()];
      const clusterId = this.cluster.id;
      // 8 .... 0
      /*
            Const { guilds, members } = await this.cluster.broadcastEval("this.guildsAndMembers").then(x => {
                return {
                    guilds: x.map(v => v.guilds || 0).reduce((a, b) => a + b, 0),
                    members: x.map(v => v.members || 0).reduce((a, b) => a + b, 0)
                }
            }).catch((e) => {
                this.logger.error(e);
                return { guilds: 0, members: 0 }
            })
        */
      const customStatus = CustomStatus[this.statusIndex];

      if (customStatus.text.startsWith('Shard')) {
         for (let i = shardIds.length - 1; i >= 0; i--) {
            const shardId = shardIds[i];
            this.user.setActivity(customStatus.text.replace('{shard}', shardId.toString()).replace('{cluster}', clusterId.toString()), {
               shardId,
               type: customStatus.type,
            });
         }
      } else {
         this.user.setActivity(customStatus.text, {
            type: customStatus.type,
         });
      }
      if (this.statusIndex + 1 > CustomStatus.length - 1) {
         // Evitar que el index se salga de la cantidad de statuses
         this.statusIndex = 0;
      } else {
         this.statusIndex++;
      }

      return true;
   }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
