import {
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle,
   GuildMember,
   Message,
   PermissionFlagsBits,
   TextChannel,
   VoiceChannel,
} from 'discord.js';
import { CustomRequester } from '../../typings/music';
import Client from '../Client';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import { Locale } from '../../typings/locales';
import { AudioOutputs, Player, Queue, RepeatMode, SearchResult, SourceLinksRegexes, Track } from 'lavalink-client';
import music from '../../config/music';
import undici from 'undici';
import { JSDOM } from 'jsdom';
import { IDJSettings, IGuild } from '../../database/schemas/GuildSchema';

export default class MusicUtils {
   client: Client;
   constructor(client: Client) {
      this.client = client;
   }

   async scAutoPlay(url): Promise<string[]> {
      const res = await undici.fetch(`${url}/recommended`);

      if (res.status !== 200) {
         throw new Error(`Failed to fetch URL. Status code: ${res.status}`);
      }

      const html = await res.text();

      const dom = new JSDOM(html);
      const document = dom.window.document;

      const secondNoscript = document.querySelectorAll('noscript')[1];
      const sectionElement = secondNoscript.querySelector('section');
      const articleElements = sectionElement.querySelectorAll('article');

      const hrefs: string[] = [];

      if (articleElements) {
         articleElements.forEach((articleElement) => {
            const h2Element = articleElement.querySelector('h2[itemprop="name"]');
            if (!h2Element) return;
            const aElement = h2Element.querySelector('a[itemprop="url"]');
            if (!aElement) return;
            const href = `https://soundcloud.com${aElement?.getAttribute('href') || ''}`;
            if (href) {
               hrefs.push(href);
            }
         });
      }

      return hrefs;
   }

   formatInt(int) {
      return int < 10 ? `0${int}` : int;
   }

   formatDuration(ms: number): string {
      if (!ms || !Number(ms)) return '00:00';
      const sec = Math.floor(ms / 1000);
      if (!sec || !Number(sec)) return '00:00';
      const seconds = Math.floor(sec % 60);
      const minutes = Math.floor((sec % 3600) / 60);
      const hours = Math.floor((sec % 86400) / 3600);
      const days = Math.floor(sec / 86400);
      if (days > 0) return `${this.formatInt(days)}:${this.formatInt(hours)}:${this.formatInt(minutes)}:${this.formatInt(seconds)}`;
      if (hours > 0) return `${this.formatInt(hours)}:${this.formatInt(minutes)}:${this.formatInt(seconds)}`;
      if (minutes > 0) return `${this.formatInt(minutes)}:${this.formatInt(seconds)}`;
      return `00:${this.formatInt(seconds)}`;
   }

   async setAudioOutput(ctx, output, player, language = process.env.LANGUAGE) {
      await player.filterManager.setAudioOutput(output as AudioOutputs);

      return ctx.reply({
         embeds: [new Embed().setDescription(this.client.translate(language, `UTILS.MUSIC.output.set`, { output }))],
      });
   }

   async setFilter(ctx, filter, player, language = process.env.LANGUAGE) {
      await player.filterManager?.[`toggle${filter}`]?.();

      return ctx.reply({
         embeds: [new Embed().setDescription(this.client.translate(language, `UTILS.MUSIC.filter.set`, { filter }))],
      });
   }

   isPlaying(ctx, player: Player, prefix, language = process.env.LANGUAGE): boolean {
      if (!player || !player?.playing)
         return (
            ctx.reply({
               embeds: [
                  new ErrorEmbed().addField(
                     this.client.translate(language as Locale, `UTILS.MUSIC.check.noplayer.embed.name`),
                     this.client.translate(language as Locale, `UTILS.MUSIC.check.noplayer.embed.value`, {
                        prefix: ctx.token ? '/' : prefix,
                     }),
                  ),
               ],
               ephemeral: true,
            }),
            false
         );

      return true;
   }

   hasDJRole(ctx, action: string, member: GuildMember, language = process.env.LANGUAGE, DJ_SETTINGS: IDJSettings) {
      // If DJ_SETTINGS are disabled or user is alone return or is admin return (like what)
      if (
         !DJ_SETTINGS ||
         !DJ_SETTINGS.enabled ||
         !DJ_SETTINGS.cmds?.includes(action) ||
         member.permissions.has(PermissionFlagsBits.Administrator) ||
         member.voice.channel?.members.filter((m) => !m.user.bot).size == 1
      )
         return true;
      const DJ_ROLES = DJ_SETTINGS.roles;
      // @ts-ignore
      const memberRoles = member._roles;
      if (!memberRoles.some((rId) => DJ_ROLES.includes(rId)))
         return (
            ctx.reply({
               embeds: [
                  new ErrorEmbed().addField(
                     this.client.translate(language, `UTILS.MUSIC.check.nodjrole.embed.name`),
                     this.client.translate(language, `UTILS.MUSIC.check.nodjrole.embed.value`, {
                        djRoles: DJ_ROLES.map((roleId) => `<@&${roleId}>`).join(', '),
                     }),
                  ),
               ],
               ephemeral: true,
            }),
            false
         );
      return true;
   }

   isAllowedToAction(ctx, action: string, guildData: IGuild): boolean {
      const { language } = guildData;

      // Basic data
      const BOT_VC = ctx?.guild?.members?.me?.voice?.channel;
      const MEMBER = ctx?.member;
      const MEMBER_VC = ctx?.member?.voice?.channel;

      if (!MEMBER_VC)
         return (
            ctx.reply({
               embeds: [
                  new ErrorEmbed().addField(
                     this.client.translate(language, `UTILS.MUSIC.check.nochannel.embed.name`),
                     this.client.translate(language, `UTILS.MUSIC.check.nochannel.embed.value`),
                  ),
               ],
               ephemeral: true,
            }),
            false
         );

      // MEMBER VC NOT SAME AS ME
      if (BOT_VC && MEMBER_VC.id != BOT_VC.id)
         return (
            ctx.reply({
               embeds: [
                  new ErrorEmbed().addField(
                     this.client.translate(language, `UTILS.MUSIC.check.notsamevc.embed.name`),
                     this.client.translate(language, `UTILS.MUSIC.check.notsamevc.embed.value`, { vcChannel: BOT_VC.toString() }),
                  ),
               ],
               ephemeral: true,
            }),
            false
         );

      // MY PERMISSIONS TO DO SO
      const BOT_PERMISSIONS = MEMBER_VC.permissionsFor(ctx.guild.members.me);

      // CANT CONNECT ON THE VC
      if (!BOT_PERMISSIONS.has('Connect'))
         return (
            ctx.reply({
               embeds: [
                  new ErrorEmbed().addField(
                     this.client.translate(language, `UTILS.MUSIC.check.cantconnect.embed.name`),
                     this.client.translate(language, `UTILS.MUSIC.check.cantconnect.embed.value`, { vcChannel: MEMBER_VC.toString() }),
                  ),
               ],
               ephemeral: true,
            }),
            false
         );

      // CANT SPEAK ON THE VC
      if (!BOT_PERMISSIONS.has('Speak'))
         return (
            ctx.reply({
               embeds: [
                  new ErrorEmbed().addField(
                     this.client.translate(language, `UTILS.MUSIC.check.cantspeak.embed.name`),
                     this.client.translate(language, `UTILS.MUSIC.check.cantspeak.embed.value`, { vcChannel: MEMBER_VC.toString() }),
                  ),
               ],
               ephemeral: true,
            }),
            false
         );

      // VC IS FULL
      if (!BOT_VC && MEMBER_VC && MEMBER_VC.userLimit != 0 && MEMBER_VC.full)
         return (
            ctx.reply({
               embeds: [
                  new ErrorEmbed().addField(
                     this.client.translate(language, `UTILS.MUSIC.check.channelfull.embed.name`),
                     this.client.translate(language, `UTILS.MUSIC.check.channelfull.embed.value`, { vcChannel: MEMBER_VC.toString() }),
                  ),
               ],
               ephemeral: true,
            }),
            false
         );

      if (!this.hasDJRole(ctx, action, MEMBER, language, guildData.music.djmode)) return false;
      return true;
   }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   async setVolume(ctx, player: Player, language = process.env.LANGUAGE, volume: number) {
      if (isNaN(volume) || volume < 1 || volume > 200) {
         return ctx.reply({
            embeds: [
               new Embed().addField(
                  this.client.translate(language, `UTILS.MUSIC.setVolume.invalid.name`),
                  this.client.translate(language, `UTILS.MUSIC.setVolume.invalid.value`),
               ),
            ],
            ephemeral: true,
         });
      }

      await player.setVolume(Number(volume));

      return ctx.reply({
         embeds: [new Embed().setDescription(this.client.translate(language, `UTILS.MUSIC.setVolume.success`, { volume }))],
         ephemeral: true,
      });
   }

   updatePlayingMessage(player: Player) {
      const playingMessageMap = player.get('playingMsg') as Message;
      const textChannel = this.client.channels.cache.get(player.textChannelId!) as TextChannel;

      if (playingMessageMap && textChannel) {
         // @ts-ignore
         return playingMessageMap.edit({ components: this.getComponents(player) }).catch(() => {});
      }
   }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   async seekPlayer(ctx, player: Player, language = process.env.LANGUAGE, seekAmountInSeconds: number = 10) {
      const seektime = seekAmountInSeconds * 1000;
      await player.seek(Number(seektime));
      this.updatePlayingMessage(player);
      return ctx.reply({
         embeds: [new Embed().setDescription(`>>> ${this.client.allemojis.forward} **${this.formatDuration(player.position)}!**`)],
         ephemeral: true,
      });
   }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   async rewindPlayer(ctx, player: Player, language = process.env.LANGUAGE, backwardAmountInSeconds: number = 10, replay = false) {
      let seektime = player.position - Math.floor(backwardAmountInSeconds) * 1000;
      if (seektime >= player.queue.current!.info.duration! - player.position || seektime < 0 || replay) seektime = 0;

      await player.seek(Number(seektime));

      this.updatePlayingMessage(player);
      if (replay) {
         return ctx.reply({
            embeds: [new Embed().setDescription(this.client.translate(language, `UTILS.MUSIC.replay.success`))],
            ephemeral: true,
         });
      }

      return ctx.reply({
         embeds: [
            new Embed().setDescription(
               `>>> ${this.client.allemojis.forward} ** ${this.client.translate(
                  language,
                  `UTILS.MUSIC.rewinded`,
               )} ${this.client.utils.general
                  .duration(Math.floor(backwardAmountInSeconds * 1000))
                  .map((d) => `\`${d}\``)
                  .join(', ')}!**`,
            ),
         ],
         ephemeral: true,
      });
   }

   async toggle247(ctx, player: Player, language = process.env.LANGUAGE) {
      const is247Enabled = player.get('247');
      await player.set('247', !is247Enabled);
      // this.updatePlayingMessage(player);
      return is247Enabled
         ? ctx.reply({
              embeds: [
                 new Embed().addField(
                    this.client.translate(language, `UTILS.MUSIC.toggle247.disabled.name`),
                    this.client.translate(language, `UTILS.MUSIC.toggle247.disabled.value`),
                 ),
              ],
              ephemeral: true,
           })
         : ctx.reply({
              embeds: [
                 new Embed().addField(
                    this.client.translate(language, `UTILS.MUSIC.toggle247.enabled.name`),
                    this.client.translate(language, `UTILS.MUSIC.toggle247.enabled.value`, {
                       channel: `<#${player.voiceChannelId}>`,
                    }),
                 ),
              ],
              ephemeral: true,
           });
   }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   async forwardPlayer(ctx, player: Player, language = process.env.LANGUAGE, forwardAmountInSeconds: number = 10) {
      let seektime = player.position + Math.floor(forwardAmountInSeconds) * 1000;
      if (seektime >= player.queue.current!.info.duration! - player.position) seektime = player.queue.current!.info.duration! - 1 * 1000;
      await player.seek(Number(seektime));
      this.updatePlayingMessage(player);
      return ctx.reply({
         embeds: [
            new Embed().setDescription(
               `>>> ${this.client.allemojis.forward} **${this.client.translate(
                  language,
                  `UTILS.MUSIC.forwarded`,
               )} ${this.client.utils.general
                  .duration(Math.floor(forwardAmountInSeconds * 1000))
                  .map((d) => `\`${d}\``)
                  .join(', ')}!**`,
            ),
         ],
         ephemeral: true,
      });
   }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   async toggleAutoplay(ctx, player: Player, language = process.env.LANGUAGE) {
      const isAutoPLayEnabled = player.get('autoplay');
      await player.set('autoplay', !isAutoPLayEnabled);
      this.updatePlayingMessage(player);
      return ctx.reply({
         embeds: [
            new Embed().setDescription(
               this.client.translate(language, `UTILS.MUSIC.toggleAutoplay.success`, {
                  toggleMode: player.get('autoplay')
                     ? this.client.translate(language, `COMMON.TEXTS.enabled`).toLowerCase()
                     : this.client.translate(language, `COMMON.TEXTS.disabled`).toLowerCase(),
               }),
            ),
         ],
         ephemeral: true,
      });
   }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   async toggleLoop(ctx, player: Player, language = process.env.LANGUAGE, loopMode?: RepeatMode | undefined) {
      if (loopMode) await player.setRepeatMode(loopMode);
      else
         await (player.repeatMode === 'queue'
            ? player.setRepeatMode('off')
            : player.repeatMode === 'track'
            ? player.setRepeatMode('queue')
            : player.setRepeatMode('track'));
      const translatedTrackMode = this.client.translate(language, `UTILS.MUSIC.toggleLoop.track`);
      const translatedQueueMode = this.client.translate(language, `UTILS.MUSIC.toggleLoop.queue`);
      const translatedOffMode = this.client.translate(language, `UTILS.MUSIC.toggleLoop.off`);
      this.updatePlayingMessage(player);
      return ctx.reply({
         embeds: [
            new Embed().setDescription(
               player.repeatMode === 'queue'
                  ? translatedQueueMode
                  : player.repeatMode === 'track'
                  ? translatedTrackMode
                  : translatedOffMode,
            ),
         ],
         ephemeral: true,
      });
   }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   async stopPlayer(ctx, player: Player, language = process.env.LANGUAGE) {
      await player.destroy();
      return ctx.reply({
         embeds: [new Embed().setDescription(this.client.translate(language, `UTILS.MUSIC.stopPlayer.success`))],
         ephemeral: true,
      });
   }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   async resumePlayer(ctx, player: Player, language = process.env.LANGUAGE) {
      if (!player.paused)
         return ctx.reply({
            embeds: [new Embed().setDescription(this.client.translate(language, `UTILS.MUSIC.resumePlayer.notPaused`))],
            ephemeral: true,
         });
      await player.resume();
      this.updatePlayingMessage(player);
      return ctx.reply({
         embeds: [new Embed().setDescription(this.client.translate(language, `UTILS.MUSIC.resumePlayer.success`))],
         ephemeral: true,
      });
   }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   async pausePlayer(ctx, player: Player, language = process.env.LANGUAGE) {
      if (player.paused)
         return ctx.reply({
            embeds: [new Embed().setDescription(this.client.translate(language, `UTILS.MUSIC.pausePlayer.paused`))],
            ephemeral: true,
         });
      await player.pause();
      this.updatePlayingMessage(player);
      return ctx.reply({
         embeds: [new Embed().setDescription(this.client.translate(language, `UTILS.MUSIC.pausePlayer.success`))],
         ephemeral: true,
      });
   }

   async tts(ctx, text, player: Player, guildData, language = process.env.LANGUAGE) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      const MEMBER_VC_ID = (ctx?.member as GuildMember)?.voice?.channelId!;

      if (!this.isAllowedToAction(ctx, 'tts', guildData)) return;

      if (player?.voiceChannelId && player.connected)
         return ctx.reply({
            embeds: [new ErrorEmbed().setDescription(this.client.translate(language, `UTILS.MUSIC.alreadyConnected`))],
            ephemeral: true,
         });

      if (player) {
         // player already created, but not connected yet -> connect to it!
         player.voiceChannelId ||= MEMBER_VC_ID;
         await player.connect();
      }

      const newPlayer = await this.client.lavalink.createPlayer({
         // if it was existing before, but connected afterwards, it just re-gets the player of the cache
         guildId: ctx.guildId,
         voiceChannelId: MEMBER_VC_ID,
         textChannelId: ctx.channelId,
         selfDeaf: true,
         selfMute: false,
         volume: guildData.music.volume, // default volume
         instaUpdateFiltersFix: true, // optional
         applyVolumeAsFilter: false, // if true player.setVolume(54) -> player.filters.setVolume(0.54)
      });

      await newPlayer.set('autoplay', guildData.music.autoplay);

      await newPlayer.connect();

      await newPlayer.search({ query: text, source: 'ftts' }, ctx.user);

      return ctx.reply({
         embeds: [new Embed().setDescription(this.client.translate(language, `UTILS.MUSIC.tts.playing`))],
         ephemeral: true,
      });
   }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   async skipSong(ctx, player: Player, language = process.env.LANGUAGE) {
      const nextTrack = player.queue.tracks[0];

      if (!nextTrack)
         return ctx.reply({
            embeds: [new ErrorEmbed().setDescription(this.client.translate(language, `UTILS.MUSIC.skipSong.error`))],
            ephemeral: true,
         });

      await player.skip(0);
      return ctx.reply({
         embeds: [new Embed().setDescription(this.client.translate(language, `UTILS.MUSIC.skipSong.success`))],
         ephemeral: true,
      });
   }
   async reconnect(ctx, player: Player, guildData) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      const MEMBER_VC_ID = (ctx?.member as GuildMember)?.voice?.channelId!;
      const language = guildData.language || process.env.LANGUAGE;

      if (!this.isAllowedToAction(ctx, 'reconnect', guildData)) return;

      if (player?.voiceChannelId && player.connected)
         return ctx.reply({
            embeds: [new ErrorEmbed().setDescription(this.client.translate(language, `UTILS.MUSIC.alreadyConnected`))],
            ephemeral: true,
         });

      if (player) {
         // player already created, but not connected yet -> connect to it!
         player.voiceChannelId ||= MEMBER_VC_ID;
         await player.connect();
      }

      const newPlayer = await this.client.lavalink.createPlayer({
         // if it was existing before, but connected afterwards, it just re-gets the player of the cache
         guildId: ctx.guildId,
         voiceChannelId: MEMBER_VC_ID,
         textChannelId: ctx.channelId,
         selfDeaf: true,
         selfMute: false,
         volume: guildData.music.volume, // default volume
         instaUpdateFiltersFix: true, // optional
         applyVolumeAsFilter: false, // if true player.setVolume(54) -> player.filters.setVolume(0.54)
      });

      await newPlayer.set('autoplay', guildData.music.autoplay);

      await newPlayer.connect();

      await newPlayer.queue.utils.sync(true, false);

      if (!newPlayer.queue.current && !newPlayer.queue.tracks.length)
         return ctx.reply({
            embeds: [new ErrorEmbed().setDescription(this.client.translate(language, `UTILS.MUSIC.noTracksToPlay`))],
            ephemeral: true,
         });

      await newPlayer.play();

      return ctx.reply({
         embeds: [new Embed().setDescription(this.client.translate(language, `UTILS.MUSIC.reconnected`))],
         ephemeral: true,
      });
   }

   async playSong(ctx, query: string, options) {
      const language = options.guildData.language;
      const volume = options.guildData.music.volume;
      const autoplay = options.guildData.music.autoplay;
      const autoshuffle = options.guildData.music.autoshuffle;
      const searchPlatform = options.searchPlatform || options.guildData.music.searchPlatform || music.defaultSearchPlatform;

      const action = options.playNow
         ? 'playnow'
         : options.playSkip
         ? 'playSkip'
         : options.playNext
         ? 'playNext'
         : options.playPrevious
         ? 'playPrevious'
         : options.addPrevious
         ? 'addPrevious'
         : 'play';

      let userData = options.userData;
      let guildData = options.guildData;
      if (!userData) userData = await this.client.db.getUserData(ctx.user.id);
      if (!guildData) guildData = await this.client.db.getGuildData(ctx.guild.id);
      try {
         if (!ctx) throw new Error('No CTX especificado valido para playSong');

         const vcId = (ctx.member as GuildMember)?.voice?.channelId;
         if (!vcId)
            return ctx.reply({
               embeds: [
                  new ErrorEmbed().addField(
                     this.client.translate(language, `UTILS.MUSIC.check.nochannel.embed.name`),
                     this.client.translate(language, `UTILS.MUSIC.check.nochannel.embed.value`),
                  ),
               ],
               ephemeral: true,
            });

         const BOT_VC = (ctx?.guild?.members?.me as GuildMember)?.voice?.channel as VoiceChannel;

         if (!this.isAllowedToAction(ctx, action, guildData)) return;

         if (
            (SourceLinksRegexes.YoutubeRegex.test(query) ||
               SourceLinksRegexes.YoutubeMusicRegex.test(query) ||
               ['youtube', 'youtubemusic', 'yt'].includes(searchPlatform)) &&
            !music.allowYoutube
         ) {
            return ctx.reply({
               embeds: [
                  new ErrorEmbed().addField(
                     this.client.translate(language, `UTILS.MUSIC.check.noyoutube.embed.name`),
                     this.client.translate(language, `UTILS.MUSIC.check.noyoutube.embed.value`),
                  ),
               ],
               ephemeral: true,
            });
         }

         if (SourceLinksRegexes.TwitchTv.test(query) && !(userData.isPremium || guildData.isPremium)) {
            return ctx.reply({
               embeds: [
                  new ErrorEmbed()
                     .setColor('Aqua')
                     .addField(
                        this.client.translate(language, `UTILS.MUSIC.check.twitchpremium.embed.name`),
                        this.client.translate(language, `UTILS.MUSIC.check.twitchpremium.embed.value`),
                     ),
               ],
               ephemeral: true,
               components: [
                  new ActionRowBuilder().addComponents(
                     new ButtonBuilder()
                        .setLabel(this.client.translate(language, 'COMPONENTS.BUTTONS.PREMIUM.label'))
                        .setStyle(ButtonStyle.Link)
                        .setEmoji(this.client.allemojis.favourite)
                        .setURL(`https://${process.env.WEB_DOMAIN}/premium`),
                  ),
               ],
            });
         }

         const searchingSongMsg = await ctx.reply({
            embeds: [new Embed().setDescription(this.client.translate(language, `UTILS.MUSIC.play.loading`))],
         });

         if (query === 'nothing_found')
            return this.client.utils.message.edit(ctx, searchingSongMsg, {
               embeds: [
                  new ErrorEmbed().addField(
                     this.client.translate(language, `UTILS.MUSIC.play.notfound.embed.name`),
                     this.client.translate(language, `UTILS.MUSIC.play.notfound.embed.value`),
                  ),
               ],
               ephemeral: true,
            });

         if (query === 'join_vc')
            return this.client.utils.message.edit(ctx, searchingSongMsg, {
               embeds: [
                  new ErrorEmbed().addField(
                     this.client.translate(language, `UTILS.MUSIC.play.redocmd.embed.name`),
                     this.client.translate(language, `UTILS.MUSIC.play.redocmd.embed.value`),
                  ),
               ],
               ephemeral: true,
            });

         const player =
            this.client.lavalink.getPlayer(ctx.guildId) ||
            (await this.client.lavalink.createPlayer({
               guildId: ctx.guild.id,
               voiceChannelId: vcId,
               textChannelId: ctx.channel.id,
               selfDeaf: true,
               selfMute: false,
               volume, // default volume
               instaUpdateFiltersFix: true, // optional
               applyVolumeAsFilter: false, // if true player.setVolume(54) -> player.filters.setVolume(0.54)

               // node: "testnode",
               // vcRegion: ((message.member as GuildMember)!.voice.channel!.rtcRegion!),
            }));

         await player.set('autoplay', autoplay);

         const connected = player.connected;

         if (!connected) await player.connect();

         if (player.voiceChannelId && player.voiceChannelId !== vcId)
            return this.client.utils.message.edit(ctx, searchingSongMsg, {
               embeds: [
                  new ErrorEmbed().addField(
                     this.client.translate(language, `UTILS.MUSIC.check.notsamevc.embed.name`),
                     this.client.translate(language, `UTILS.MUSIC.check.notsamevc.embed.value`, { vcChannel: BOT_VC.toString() }),
                  ),
               ],
               ephemeral: true,
            });

         const response = (await player.search({ query: query, source: searchPlatform }, ctx.user)) as SearchResult | undefined;
         if (!response || !response.tracks?.length)
            return this.client.utils.message.edit(ctx, searchingSongMsg, {
               embeds: [
                  new ErrorEmbed().addField(
                     this.client.translate(language, `UTILS.MUSIC.play.notfound.embed.name`),
                     this.client.translate(language, `UTILS.MUSIC.play.notfound.embed.value`),
                  ),
               ],
               ephemeral: true,
            });

         const b4addTracks = player.queue.tracks.map((t) => t);

         const foundTracks = (() => {
            if (response.loadType === 'playlist') {
               if (autoshuffle) response.tracks = response.tracks.shuffle();
               return response.tracks;
            }
            return response.tracks[0];
         })();

         await player.queue.add(foundTracks, options.playNext ? 0 : undefined);

         // PLAY NOW | PLAY SKIP | PLAY PREVIOUS HANDLER
         if ((options.playNow || options.playSkip || options.playPrevious) && player.playing && player.queue.current) {
            const switchedQueue = options.playSkip
               ? [...response.tracks, ...b4addTracks]
               : [...response.tracks, player.queue.current, ...b4addTracks];
            await player.queue.splice(0, player.queue.tracks.length);
            await player.queue.tracks.push(...switchedQueue);
         }

         const isPlaylist = response.loadType === 'playlist';
         const title = (isPlaylist ? response.playlist?.title : response.tracks[0].info.title) || '?';
         const uri = (isPlaylist ? response.playlist?.uri : response.tracks[0].info.uri) || '?';
         const author = (isPlaylist ? response.playlist?.author : response.tracks[0].info.author) || '?';
         const tracksLength = isPlaylist ? response.tracks.length : 1;
         const platform = response.tracks[0].info.sourceName;

         const platformEmoji = this.client.allemojis[platform] || this.client.allemojis.link;

         await this.client.utils.message.edit(ctx, searchingSongMsg, {
            embeds: [
               new Embed().addField(
                  isPlaylist
                     ? this.client.translate(language, `UTILS.MUSIC.play.playlist.embed.name`, {
                          title,
                          author,
                          uri,
                          tracksLength,
                          platformEmoji,
                       })
                     : this.client.translate(language, `UTILS.MUSIC.play.track.embed.name`, {
                          title,
                          author,
                          uri,
                          tracksLength,
                          platformEmoji,
                       }),
                  isPlaylist
                     ? this.client.translate(language, `UTILS.MUSIC.play.playlist.embed.value`, {
                          title,
                          author,
                          uri,
                          tracksLength,
                          platformEmoji,
                       })
                     : this.client.translate(language, `UTILS.MUSIC.play.track.embed.value`, {
                          title,
                          author,
                          uri,
                          tracksLength,
                          platformEmoji,
                       }),
               ),
            ],
         });

         if (!player.playing) return player.play(connected ? { volume, paused: false } : undefined);
         if (player.playing && (options.playSkip || options.playNow || options.playPrevious)) return player.skip(0);
      } catch (e) {
         console.error(e);
         return ctx
            .reply({
               embeds: [
                  new ErrorEmbed().addField(
                     this.client.translate(language, `UTILS.MUSIC.playSong.error.name`),
                     this.client.translate(language, `UTILS.MUSIC.playSong.error.value`),
                  ),
               ],
               ephemeral: true,
            })
            .catch(() => {});
      }
   }

   getPlayingEmbed(queue: Queue, song: Track, language: Locale = process.env.LANGUAGE) {
      if (!queue)
         return new ErrorEmbed().addField(
            this.client.translate(language, `UTILS.MUSIC.noqueue.name`),
            this.client.translate(language, `UTILS.MUSIC.noqueue.value`),
         );

      if (!song)
         return new ErrorEmbed().addField(
            this.client.translate(language, `UTILS.MUSIC.noqueue.name`),
            this.client.translate(language, `UTILS.MUSIC.noqueue.value`),
         );

      const requester: CustomRequester = song.requester as CustomRequester;

      return new Embed()
         .setThumbnail(song.info.artworkUrl)
         .addField(
            `${this.client.allemojis.disk} ${this.client.translate(language, `UTILS.MUSIC.getPlayingEmbed.title`)}: __${
               song.info.title || '?'
            }__`,
            `>>> ${this.client.allemojis.clock} **::  ${this.client.translate(language, `UTILS.MUSIC.getPlayingEmbed.duration`)}:** \`${
               song.info.isStream ? this.client.translate(language, `COMMON.TEXTS.onStream`) : this.formatDuration(song.info.duration)
            }\`\n${this.client.allemojis.mic} **::  ${this.client.translate(language, `UTILS.MUSIC.getPlayingEmbed.artist`)}:** \`${
               song.info.author || '?'
            }\`\n${this.client.allemojis.link} **:: Link:** ${
               song.info.uri
                  ? `[\`${this.client.translate(language, `COMMON.TEXTS.clickHere`)}\`](${song.info.uri})`
                  : this.client.translate(language, `UTILS.MUSIC.getPlayingEmbed.link.notAvailable`)
            }\n${this.client.allemojis.wait} **:: ${this.client.translate(language, `UTILS.MUSIC.getPlayingEmbed.ends`)}:** ${
               song.info.isStream
                  ? `\`${this.client.translate(language, `COMMON.TEXTS.onStream`)}\``
                  : `<t:${this.client.utils.general.toUnixTimestamp(Date.now() + song.info.duration)}:R>`
            }`,
         )
         .setFooter({
            text: `${this.client.translate(language, `COMMON.getPlayingEmbed.addedBy`)}: ${requester.username}`,
            iconURL: requester.avatar,
         });
   }

   getComponents(player: Player) {
      const COMPONENTS = [
         new ActionRowBuilder().addComponents([
            new ButtonBuilder().setEmoji(this.client.allemojis.favourite).setStyle(ButtonStyle.Secondary).setCustomId('music-{FAV_SONG}'),

            new ButtonBuilder().setEmoji(this.client.allemojis.stop).setStyle(ButtonStyle.Secondary).setCustomId('music-{STOP_SONG}'),

            new ButtonBuilder()
               .setEmoji(player.paused ? this.client.allemojis.resume : this.client.allemojis.pause)
               .setStyle(player.paused ? ButtonStyle.Danger : ButtonStyle.Secondary)
               .setCustomId('music-{PAUSERESUME_SONG}'),

            new ButtonBuilder().setEmoji(this.client.allemojis.skip).setStyle(ButtonStyle.Secondary).setCustomId('music-{SKIP_SONG}'),

            new ButtonBuilder()
               .setEmoji(this.client.allemojis.lupa)
               .setStyle(ButtonStyle.Secondary)
               .setCustomId('music-{SEARCH_SONG}')
               .setDisabled(false),
         ]),

         new ActionRowBuilder().addComponents([
            new ButtonBuilder()
               .setEmoji(this.client.allemojis.backward)
               .setStyle(ButtonStyle.Secondary)
               .setCustomId('music-{BACKWARD_SONG}'),

            new ButtonBuilder().setEmoji(this.client.allemojis.forward).setStyle(ButtonStyle.Secondary).setCustomId('music-{FORWARD_SONG}'),

            new ButtonBuilder()
               .setEmoji(this.client.allemojis.autoplay)
               .setStyle(player.get('autoplay') ? ButtonStyle.Success : ButtonStyle.Secondary)
               .setCustomId('music-{AUTO_SONG}'),

            new ButtonBuilder()
               .setEmoji(this.client.allemojis.loop)
               .setStyle(['queue', 'track'].includes(player.repeatMode) ? ButtonStyle.Success : ButtonStyle.Secondary)
               .setCustomId('music-{LOOP_SONG}'),

            new ButtonBuilder().setEmoji(this.client.allemojis.volume).setStyle(ButtonStyle.Secondary).setCustomId('music-{VOL_SONG}'),
         ]),
      ];
      return COMPONENTS;
   }

   requesterTransformer = (requester: any): CustomRequester => {
      // if it's already the transformed requester
      if (typeof requester === 'object' && 'avatar' in requester && Object.keys(requester).length === 3)
         return requester as CustomRequester;
      // if it's still a discord.js User
      if (typeof requester === 'object' && 'displayAvatarURL' in requester) {
         // it's a user
         return {
            id: requester.id,
            username: requester.username,
            avatar: requester.displayAvatarURL(),
         };
      }
      // if it's non of the above
      return { id: requester!.toString(), username: 'unknown' }; // reteurn something that makes sense for you!
   };

   autoPlayFunction = async (player, lastPlayedTrack) => {
      if (!player.get('autoplay')) return;
      const autoPlayRequester = {
         id: player.LavalinkManager.client.user.id,
         username: player.LavalinkManager.client.user.username,
         avatar: player.LavalinkManager.client.user.displayAvatarURL(),
      };
      if (!lastPlayedTrack || !lastPlayedTrack.info) return;
      const sourceName = lastPlayedTrack.info.sourceName;
      if (sourceName === 'spotify') {
         const filtered = player.queue.previous.filter((v) => v.info && v.info.sourceName && v.info.sourceName === sourceName).slice(0, 5);
         if (filtered.length === 0) filtered.push(lastPlayedTrack);
         const ids = filtered.map(
            (v) => v?.info?.identifier || v?.info?.uri?.split?.('/')?.reverse?.()?.[0] || v?.info?.uri?.split?.('/')?.reverse?.()?.[1],
         );
         if (ids.length >= 1) {
            const res = await player
               .search(
                  {
                     query: `seed_tracks=${ids.join(',')}`, // `seed_artists=${artistIds.join(",")}&seed_genres=${genre.join(",")}&seed_tracks=${trackIds.join(",")}`;
                     source: 'sprec',
                  },
                  autoPlayRequester,
               )
               .then((response) => {
                  response.tracks = response.tracks.filter((v) => v.info.identifier !== lastPlayedTrack.info.identifier); // remove the lastPlayed track if it's in there..
                  return response;
               })
               .catch(console.warn);
            if (res && res.tracks.length)
               await player.queue.add(
                  res.tracks.slice(0, 5).map((track) => {
                     // transform the track plugininfo so you can figure out if the track is from autoplay or not.
                     track.pluginInfo.clientData = { ...(track.pluginInfo.clientData || {}), fromAutoplay: true };
                     return track;
                  }),
               );
         }
         return;
      }
      if (sourceName === 'youtube' || sourceName === 'youtubemusic') {
         const res = await player
            .search(
               {
                  query: `https://www.youtube.com/watch?v=${lastPlayedTrack.info.identifier}&list=RD${lastPlayedTrack.info.identifier}`,
                  source: 'youtube',
               },
               autoPlayRequester,
            )
            .then((response) => {
               response.tracks = response.tracks.filter((v) => v.info.identifier !== lastPlayedTrack.info.identifier); // remove the lastPlayed track if it's in there..
               return response;
            })
            .catch(console.warn);
         if (res && res.tracks.length)
            await player.queue.add(
               res.tracks.slice(0, 5).map((track) => {
                  // transform the track plugininfo so you can figure out if the track is from autoplay or not.
                  track.pluginInfo.clientData = { ...(track.pluginInfo.clientData || {}), fromAutoplay: true };
                  return track;
               }),
            );
         return;
      }
      if (sourceName === 'soundcloud') {
         const relatedScTracks = await this.scAutoPlay(lastPlayedTrack.info.uri);
         if (relatedScTracks && relatedScTracks.length >= 1) {
            for (const relatedTrackUri of relatedScTracks) {
               const res = await player
                  .search(
                     {
                        query: relatedTrackUri,
                        source: 'scsearch',
                     },
                     autoPlayRequester,
                  )
                  .then((response) => {
                     response.tracks = response.tracks.filter((v) => v.info.identifier !== lastPlayedTrack.info.identifier);
                     return response;
                  })
                  .catch(console.warn);

               if (res && res.tracks.length) {
                  await player.queue.add(
                     res.tracks.slice(0, 5).map((track) => {
                        track.pluginInfo.clientData = { ...(track.pluginInfo.clientData || {}), fromAutoplay: true };
                        return track;
                     }),
                  );
               }
            }
         }
      }

      // NEVER STOP PLAYING EVEN IF NOT FOUND ON AUTOPLAY (AND 247 MODE IS ENABLED)
      if ((player.get('247') && !player.queue.tracks) || player.queue.tracks.length === 0) {
         const res = await player
            .search(
               {
                  query: music.fallBackPlaylist,
                  source: 'sprec',
               },
               autoPlayRequester,
            )
            .then((response) => {
               response.tracks = response.tracks.filter((v) => v.info.identifier !== lastPlayedTrack.info.identifier); // remove the lastPlayed track if it's in there..
               return response;
            })
            .catch(console.warn);
         if (res && res.tracks.length)
            await player.queue.add(
               res.tracks
                  .shuffle()
                  .slice(0, 5)
                  .map((track) => {
                     // transform the track plugininfo so you can figure out if the track is from autoplay or not.
                     track.pluginInfo.clientData = { ...(track.pluginInfo.clientData || {}), fromAutoplay: true };
                     return track;
                  }),
            );
      }
   };
}
