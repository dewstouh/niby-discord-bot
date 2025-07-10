import { ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildChannel, GuildMember, Role } from 'discord.js';
import { ErrorEmbed } from '../../extenders/discord/Embed';
import Client from '../../structures/Client';
import { Locale } from '../../typings/locales';
import loadFiles from '../../utils/loadFiles';
import os from 'node-os-utils';
export default class GeneralUtils {
   client: Client;
   loadFiles: typeof loadFiles;
   constructor(client: Client) {
      this.client = client;
      this.loadFiles = loadFiles;
   }

   levenshteinDistance(a: string, b: string): number {
      if (!a.length) return b.length || Infinity;
      if (!b.length) return a.length || Infinity;

      return a[0] === b[0]
         ? this.levenshteinDistance(a.slice(1), b.slice(1))
         : Math.min(
              this.levenshteinDistance(a.slice(1), b),
              this.levenshteinDistance(a, b.slice(1)),
              this.levenshteinDistance(a.slice(1), b.slice(1)),
           ) + 1;
   }

   findClosestMatch(input: string, validInputs: string[]) {
      let closestCommand = '';
      let shortestDistance = Infinity;

      for (const validInput of validInputs) {
         const distance = this.levenshteinDistance(input, validInput);
         if (distance < shortestDistance) {
            closestCommand = validInput;
            shortestDistance = distance;
         }
      }
      return closestCommand;
   }

   getEntrantsLang(gData, language = process.env.LANGUAGE) {
      if (!gData) throw 'NO GIVEAWAY DATA';
      return `${gData.entriesAmount} ${
         gData.entriesAmount == 1
            ? this.client.utils.locale.inlineLocale(language, `COMMON.COMMAND.giveaway.entrants.singular`)
            : this.client.utils.locale.inlineLocale(language, `COMMON.COMMAND.giveaway.entrants.singular`)
      }`;
   }

   canModerate(ctx, member: GuildMember, language = process.env.LANGUAGE): boolean {
      if (!member) throw new Error('No author specified');

      if (member.id === ctx.guild.ownerId)
         return (
            ctx.reply({
               embeds: [
                  new ErrorEmbed().addField(
                     this.client.translate(language, `UTILS.GENERAL.CANMODERATE.notOwner.name`),
                     this.client.translate(language, `UTILS.GENERAL.CANMODERATE.notOwner.value`),
                  ),
               ],
            }),
            false
         );

      if (member.roles.highest.rawPosition >= ctx.guild.members.me.roles.highest.rawPosition)
         return (
            ctx.reply({
               embeds: [
                  new ErrorEmbed().addField(
                     this.client.translate(language, `UTILS.GENERAL.CANMODERATE.botRoleLow.name`),
                     this.client.translate(language, `UTILS.GENERAL.CANMODERATE.botRoleLow.value`),
                  ),
               ],
            }),
            false
         );

      if (member.roles.highest.rawPosition >= ctx.member.roles.highest.rawPosition)
         return (
            ctx.reply({
               embeds: [
                  new ErrorEmbed().addField(
                     this.client.translate(language, `UTILS.GENERAL.CANMODERATE.moderatorRoleLow.name`),
                     this.client.translate(language, `UTILS.GENERAL.CANMODERATE.moderatorRoleLow.value`),
                  ),
               ],
            }),
            false
         );

      return true;
   }

   getMemberStatus(member, language: Locale) {
      return member.presence
         ? `${this.client.allemojis[`${member.presence}`]} \`${this.client.translate(language, `PRESENCES.${member.presence}`)}\``
         : `${this.client.allemojis.offline} \`${this.client.translate(language, `PRESENCES.offline`)}\``;
   }

   toCodePoint(unicodeSurrogates, sep?) {
      let // @ts-ignore
         // eslint-disable-next-line prefer-const
         r = [],
         c = 0,
         p = 0,
         i = 0;
      while (i < unicodeSurrogates.length) {
         c = unicodeSurrogates.charCodeAt(i++);
         if (p) {
            // @ts-ignore
            // eslint-disable-next-line no-bitwise
            r.push((0x10000 + ((p - 0xd800) << 10) + (c - 0xdc00)).toString(16));
            p = 0;
         } else if (0xd800 <= c && c <= 0xdbff) {
            p = c;
         } else {
            // @ts-ignore
            r.push(c.toString(16));
         }
      }
      return r.join(sep || '-');
   }

   toUnixTimestamp(timestamp) {
      return Math.round(timestamp / 1000);
   }

   async receiveBotInfo(useCache = true) {
      try {
         const botinfoCache = this.client.cache.get('botInfo');
         if (botinfoCache && useCache) return botinfoCache;
         const cluster = this.client.cluster.id;
         const shards = this.client.cluster.ids.map((d) => `#${d.id}`).join(', ');
         const guilds = this.client.guilds.cache.size;
         const members = this.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
         const memoryUsage = process.memoryUsage();
         const ram = {
            heapTotal: this.formatBytes(memoryUsage.heapTotal),
            heapUsed: this.formatBytes(memoryUsage.heapUsed),
            rss: this.formatBytes(memoryUsage.rss),
            external: this.formatBytes(memoryUsage.external),
            arrayBuffers: this.formatBytes(memoryUsage.arrayBuffers),
         };
         const memory = `${this.formatByteStrings(ram.heapUsed)}/${this.formatByteStrings(ram.rss)}`;
         const ping = Math.abs(this.client.ws.ping);
         const dbPing = (await this.client.db.getPing()) || '0';
         const dbLatency = (await this.client.db.getLatency()) || '0';
         const CPUUsage = await this.receiveCPUUsage();
         const uptime = this.client.uptime || 0;
         const players = this.client.lavalink.players.size || 0;
         const playerNodes = this.client.lavalink.nodeManager.nodes.size || 0;
         const formattedShortUptime = this.duration(uptime, process.env.LANGUAGE, false, true);
         const formattedLongUptime = this.duration(uptime, process.env.LANGUAGE);
         const cache = {
            cluster,
            shards,
            guilds,
            members,
            ram,
            CPUUsage,
            /* Players*/ uptime,
            players,
            playerNodes,
            ping,
            dbPing,
            dbLatency,
            memory,
            formattedShortUptime,
            formattedLongUptime,
            validUntil: Date.now() + 60,
         };
         return this.client.cache.set('botInfo', cache, 60 * 1000);
      } catch (e) {
         console.error(e);
         return { cluster: this.client.cluster.id, e };
      }
   }
   receiveCPUUsage() {
      return os.cpu.usage(100);
   }

   async getMember(message, id) {
      if (!id) return null;
      return message.token
         ? message.guild.members.cache.get(id) || (await message.guild.members.fetch(id).catch(() => null))
         : ((message.guild.members.cache.get(id) ||
              (await message.guild.members.fetch(id).catch(() => null)) ||
              message.mentions.members.filter((m) => m.guild.id === message.guild.id).first()) as GuildMember);
   }

   async getChannel(message, id) {
      if (!id) return null;
      return message.token
         ? message.guild.channels.cache.get(id) || (await message.guild.channels.fetch(id).catch(() => null))
         : ((message.guild.channels.cache.get(id) ||
              (await message.guild.channels.fetch(id).catch(() => null)) ||
              message.mentions.channels.filter((m) => m.guild.id === message.guild.id).first()) as GuildChannel);
   }

   async getRole(message, id) {
      if (!id) return null;
      return message.token
         ? message.guild.roles.cache.get(id) || (await message.guild.roles.fetch(id).catch(() => null))
         : ((message.guild.roles.cache.get(id) ||
              (await message.guild.roles.fetch(id).catch(() => null)) ||
              message.mentions.roles.filter((m) => m.guild.id === message.guild.id).first()) as Role);
   }

   async getNsfwImage(ctx, type, userData, guildData, customTags?: string[]) {
      const { language } = guildData;
      const booruEndpoints = {
         rule34: [
            {
               cmdName: 'rule34',
               searchTags: customTags || [],
            },
            {
               cmdName: 'futa',
               searchTags: ['nai_diffusion', 'futanari'],
            },
            {
               cmdName: 'trap',
               searchTags: ['nai_diffusion', 'trap'],
            },
         ],
         realbooru: [
            {
               cmdName: 'realbooru',
               searchTags: customTags || [],
            },
            {
               cmdName: 'trans',
               searchTags: ['transgender'],
            },
            {
               cmdName: 'swimsuit',
            },
            {
               cmdName: 'milf',
            },
            {
               cmdName: 'trans',
            },
            {
               cmdName: 'cumshot',
            },
            {
               cmdName: 'milf',
            },
            {
               cmdName: 'cosplay',
            },
            {
               cmdName: 'blowjob',
            },
            {
               cmdName: 'footjob',
            },
            {
               cmdName: 'titfuck',
            },
            {
               cmdName: 'cowgirl',
            },
            {
               cmdName: 'pov',
            },
            {
               cmdName: 'fishnets',
            },
            {
               cmdName: 'latina',
            },
            {
               cmdName: 'socks',
            },
            {
               cmdName: 'panties',
            },
            {
               cmdName: 'thighhighs',
            },
            {
               cmdName: 'asian',
            },
            {
               cmdName: 'stockings',
            },
            {
               cmdName: 'tiktits',
               searchTags: ['tiktok'],
            },
         ],
      };

      const apiEndpoints = [
         {
            apiUrl: 'https://nekobot.xyz/api/image',
            endpoints: [
               'hass',
               'hmidriff',
               'pgif',
               '4k',
               'hentai',
               'holo',
               'hneko',
               'neko',
               'hyuri',
               'hkitsune',
               'kemonomimi',
               'anal',
               'hanal',
               'gonewild',
               'kanna',
               'ass',
               'pussy',
               'thigh',
               'hthigh',
               'gah',
               'coffee',
               'food',
               'paizuri',
               'tentacle',
               'boobs',
               'hboobs',
               'yaoi',
               'cosplay',
               'swimsuit',
               'pantsu',
               'nakadashi',
            ],
            params: { type },
            headers: {
               Authorization: '015445535454455354D6',
            },
         },
         {
            apiUrl: 'https://www.nekos.life/api/v2/img',
            endpoints: ['gasm', 'fox_girl', 'lizard', 'neko', 'kiss', 'wallpaper', 'spank', 'waifu', 'lewd', 'ngif'],
            aliases: {
               hneko: 'neko',
            },
         },
         {
            apiUrl: 'https://hmtai.hatsunia.cfd/v2',
            endpoints: [
               'ass',
               'anal',
               'bdsm',
               'classic',
               'cum',
               'creampie',
               'manga',
               'femdom',
               'hentai',
               'incest',
               'masturbation',
               'public',
               'ero',
               'orgy',
               'elves',
               'yuri',
               'pantsu',
               'pussy',
               'glasses',
               'cuckold',
               'blowjob',
               'boobjob',
               'handjob',
               'footjob',
               'boobs',
               'thighs',
               'ahegao',
               'uniform',
               'gangbang',
               'tentacles',
               'gif',
               'nsfwNeko',
               'nsfwMobileWallpaper',
               'zettaiRyouiki',
            ],
            aliases: {
               hpussy: 'pussy',
               hblowjob: 'blowjob',
               hboobjob: 'boobjob',
               hfootjob: 'footjob',
               hhandjob: 'handjob',
               hcreampie: 'creampie',
            },
         },
      ];

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const foundApi =
         apiEndpoints.find(
            (api) =>
               api.endpoints.includes(type) || // Buscar por tipo (cmdName)
               (api.aliases && api.aliases[type]), // Buscar por apiAliases (en caso de que ya exista un cmd con ese nombre)
         ) || null;

      const foundBooru =
         Object.entries(booruEndpoints)
            .map(([key, values]) => {
               const matchingItem = values.find((item) => item.cmdName === type);
               if (matchingItem) {
                  const searchTags =
                     matchingItem.cmdName === 'rule34' && customTags ? customTags : matchingItem.searchTags || [matchingItem.cmdName];
                  return { type: key, searchTags: searchTags };
               }
               return null;
            })
            .find((item) => item && item.searchTags) || null;

      const updateButton =
         userData.isPremium || guildData.isPremium
            ? new ButtonBuilder()
                 .setStyle(ButtonStyle.Secondary)
                 .setLabel(this.client.translate(language, `UTILS.GENERAL.GETNSFWIMAGE.button.update`))
                 .setEmoji(this.client.allemojis.load)
                 .setCustomId(`update-nsfw-{${type}}-{${ctx.user.id}}`)
            : new ButtonBuilder()
                 .setStyle(ButtonStyle.Secondary)
                 .setLabel(this.client.translate(language, `UTILS.GENERAL.GETNSFWIMAGE.button.premiumOnly`))
                 .setEmoji(this.client.allemojis.load)
                 .setDisabled(true)
                 .setCustomId(`update-nsfw-{${type}}-{${ctx.user.id}}`);

      const loadingContentMessage = {
         embeds: [],
         components: [
            new ActionRowBuilder().addComponents(
               ButtonBuilder.from(updateButton)
                  .setDisabled(true)
                  .setEmoji(this.client.allemojis.loading)
                  .setLabel(this.client.translate(language, `COMMON.TEXTS.loading`)),
            ),
         ],
      };

      // Si ctx tiene customId significa que han hecho clic en el botón actualizar
      const loadingMessage = ctx.customId ? await ctx.update(loadingContentMessage) : await ctx.reply(loadingContentMessage);
      const components = [new ActionRowBuilder().addComponents(updateButton.setDisabled(!(guildData.isPremium || userData.isPremium)))];

      if (!foundApi && !foundBooru)
         return (
            this.client.utils.message.edit(ctx, loadingMessage, {
               embeds: [
                  new ErrorEmbed().addField(
                     this.client.translate(language, `UTILS.GENERAL.GETNSFWIMAGE.error.name`),
                     this.client.translate(language, `UTILS.GENERAL.GETNSFWIMAGE.error.value`),
                  ),
               ],
            }),
            console.error(`No API found for ${type} NSFW Command`)
         );

      const reply = (url) => {
         return this.client.utils.message.edit(ctx, loadingMessage, {
            content: url,
            embeds: [],
            components,
         });
      };

      try {
         if (foundBooru) {
            const url = await this.client.wrappers.booru.search(foundBooru.searchTags, {
               limit: 1,
               cacheId: ctx.user.id,
               type: foundBooru.type,
            });
            if (!url)
               return this.client.utils.message.edit(ctx, loadingMessage, {
                  embeds: [
                     new ErrorEmbed().addField(
                        this.client.translate(language, `UTILS.GENERAL.GETNSFWIMAGE.notFound.name`),
                        this.client.translate(language, `UTILS.GENERAL.GETNSFWIMAGE.notFound.value`),
                     ),
                  ],
                  components,
               });
            const repliedMsg = await reply(url.join('\n'));
            if (customTags && (userData.isPremium || guildData.isPremium))
               return this.client.cache.set(ctx.message ? ctx.message.id : repliedMsg.id, customTags, 2 * 60 * 60 * 1024); // 2hrs
            return;
         }

         // @ts-ignore
         const searchParams = foundApi.params ? new URLSearchParams(foundApi.params) : null;
         const apiUrl = `${foundApi!.apiUrl}${
            searchParams ? `?${searchParams}` : `/${foundApi!.aliases?.[type] ? foundApi!.aliases[type] : type}`
         }`;

         const response = await fetch(apiUrl, {
            headers: foundApi!.headers,
         });
         if (response.status !== 200)
            return this.client.utils.message.edit(ctx, loadingMessage, {
               embeds: [
                  new ErrorEmbed().addField(
                     this.client.translate(language, `UTILS.GENERAL.GETNSFWIMAGE.notFound.name`),
                     this.client.translate(language, `UTILS.GENERAL.GETNSFWIMAGE.notFound.value`),
                  ),
               ],
               components,
            });

         const data = await response.json();
         const url = Object.values(data).find((v) => String(v).isValidUrl());

         return reply(url);
      } catch (e) {
         return this.client.utils.message.edit(ctx, loadingMessage, {
            embeds: [
               new ErrorEmbed().addField(
                  this.client.translate(language, `UTILS.GENERAL.GETNSFWIMAGE.searchError.name`),
                  this.client.translate(language, `UTILS.GENERAL.GETNSFWIMAGE.searchError.value`),
               ),
            ],
            components,
         });
      }
   }

   formatBytes(num) {
      return Math.floor((num / 1024 / 1024) * 100) / 100;
   }
   formatByteStrings(str) {
      if (!str) return str;
      if (typeof str === 'number') str = String(str);
      if (str.endsWith?.('k')) return `${str.replace('k', '')}gb`;
      if (str.endsWith?.('M')) return `${str.replace('M', '')}tb`;
      return `${str}mb`;
   }

   duration(time: number, language: Locale = process.env.LANGUAGE, useMilli: boolean = false, useShort = false) {
      let remain = time;
      const millisecondsPerYear = 1000 * 60 * 60 * 24 * 365;
      const millisecondsPerMonth = 1000 * 60 * 60 * 24 * 30;
      const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
      const millisecondsPerDay = 1000 * 60 * 60 * 24;
      const millisecondsPerHour = 1000 * 60 * 60;
      const millisecondsPerMinute = 1000 * 60;
      const millisecondsPerSecond = 1000;

      const years = Math.floor(remain / millisecondsPerYear);
      remain = remain % millisecondsPerYear;

      const months = Math.floor(remain / millisecondsPerMonth);
      remain = remain % millisecondsPerMonth;

      const weeks = Math.floor(remain / millisecondsPerWeek);
      remain = remain % millisecondsPerWeek;

      const days = Math.floor(remain / millisecondsPerDay);
      remain = remain % millisecondsPerDay;

      const hours = Math.floor(remain / millisecondsPerHour);
      remain = remain % millisecondsPerHour;

      const minutes = Math.floor(remain / millisecondsPerMinute);
      remain = remain % millisecondsPerMinute;

      const seconds = Math.floor(remain / millisecondsPerSecond);
      remain = remain % millisecondsPerSecond;

      const milliseconds = remain;
      const result = {
         years,
         months,
         weeks,
         days,
         hours,
         minutes,
         seconds,
         milliseconds,
      };
      const parts: string[] = [];

      if (result.years) {
         const ret =
            result.years == 1
               ? `${result.years} ${this.client.translate(
                    language,
                    `UTILS.GENERAL.DURATION.time.years.${useShort ? 'short.' : ''}singular`,
                 )}`
               : `${result.years} ${this.client.translate(
                    language,
                    `UTILS.GENERAL.DURATION.time.years.${useShort ? 'short.' : ''}plural`,
                 )}`;
         parts.push(ret);
      }

      if (result.months) {
         const ret =
            result.months == 1
               ? `${result.months} ${this.client.translate(
                    language,
                    `UTILS.GENERAL.DURATION.time.months.${useShort ? 'short.' : ''}singular`,
                 )}`
               : `${result.months} ${this.client.translate(
                    language,
                    `UTILS.GENERAL.DURATION.time.months.${useShort ? 'short.' : ''}plural`,
                 )}`;
         parts.push(ret);
      }

      if (result.weeks) {
         const ret =
            result.weeks == 1
               ? `${result.weeks} ${this.client.translate(
                    language,
                    `UTILS.GENERAL.DURATION.time.weeks.${useShort ? 'short.' : ''}singular`,
                 )}`
               : `${result.weeks} ${this.client.translate(
                    language,
                    `UTILS.GENERAL.DURATION.time.weeks.${useShort ? 'short.' : ''}plural`,
                 )}`;
         parts.push(ret);
      }

      if (result.days) {
         const ret =
            result.days == 1
               ? `${result.days} ${this.client.translate(language, `UTILS.GENERAL.DURATION.time.days.${useShort ? 'short.' : ''}singular`)}`
               : `${result.days} ${this.client.translate(language, `UTILS.GENERAL.DURATION.time.days.${useShort ? 'short.' : ''}plural`)}`;
         parts.push(ret);
      }

      if (result.hours) {
         const ret =
            result.hours == 1
               ? `${result.hours} ${this.client.translate(
                    language,
                    `UTILS.GENERAL.DURATION.time.hours.${useShort ? 'short.' : ''}singular`,
                 )}`
               : `${result.hours} ${this.client.translate(
                    language,
                    `UTILS.GENERAL.DURATION.time.hours.${useShort ? 'short.' : ''}plural`,
                 )}`;
         parts.push(ret);
      }

      if (result.minutes) {
         const ret =
            result.minutes == 1
               ? `${result.minutes} ${this.client.translate(
                    language,
                    `UTILS.GENERAL.DURATION.time.minutes.${useShort ? 'short.' : ''}singular`,
                 )}`
               : `${result.minutes} ${this.client.translate(
                    language,
                    `UTILS.GENERAL.DURATION.time.minutes.${useShort ? 'short.' : ''}plural`,
                 )}`;
         parts.push(ret);
      }

      if (result.seconds) {
         const ret =
            result.seconds == 1
               ? `${result.seconds} ${this.client.translate(
                    language,
                    `UTILS.GENERAL.DURATION.time.seconds.${useShort ? 'short.' : ''}singular`,
                 )}`
               : `${result.seconds} ${this.client.translate(
                    language,
                    `UTILS.GENERAL.DURATION.time.seconds.${useShort ? 'short.' : ''}plural`,
                 )}`;
         parts.push(ret);
      }

      if (useMilli && result.milliseconds) {
         const ret = `${result.milliseconds} ms`;
         parts.push(ret);
      }
      if (parts.length === 0) {
         return ['0s'];
      }
      return parts;
   }

   delay(time = 10) {
      return new Promise((r) => setTimeout(() => r(2), time));
   }
}
