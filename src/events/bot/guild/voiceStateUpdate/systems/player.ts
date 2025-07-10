import { Message, PermissionFlagsBits, TextChannel } from 'discord.js';
import { Embed } from '../../../../../extenders/discord/Embed';
import Client from '../../../../../structures/Client';
import { Player } from 'lavalink-client';
import { System } from '../../../../../typings/system';

export default {
   async execute(client: Client, guildData, userData, oldState, newState) {
      try {
         // idk sum stolen code hehe
         if (newState.channelId && newState.channel.type == 13 && newState.guild.members.me.voice.suppress) {
            if (
               newState.guild.members.me.permissions.has(PermissionFlagsBits.Speak) ||
               (newState.channel && newState.channel.permissionsFor(newState.guild.members.me).has(PermissionFlagsBits.Speak))
            ) {
               newState.guild.members.me.voice.setSuppressed(false);
            }
         }

         // join
         if (!oldState.channelId && newState.channelId) handleJoinTimeout(client, oldState, newState, guildData);

         // leave
         if (oldState.channelId && !newState.channelId) {
            // Kicked or left
            if (oldState.id == client.user?.id) {
               const player = client.lavalink.getPlayer(oldState.guild.id);
               if (!player || !player?.textChannelId) return;
               // @ts-ignore
               const GUILD_DATA = guildData;
               const textChannel = client.channels.cache.get(player.textChannelId) as TextChannel;
               // MUST GOT KICKED
               if (textChannel) {
                  await player.destroy();

                  textChannel
                     .send({
                        embeds: [
                           new Embed().addField(
                              client.translate(GUILD_DATA.language, `UTILS.MUSIC.getPlayingEmbed.playerEnded`),
                              client.translate(GUILD_DATA.language, `UTILS.MUSIC.getPlayingEmbed.gotDisconnected`, {
                                 channel: `<#${oldState.channelId}>`,
                              }),
                           ),
                        ],
                     })
                     .catch((e) => {
                        console.log(e);
                     });
               }
            } else handleLeaveTimeout(client, oldState, guildData);
         }

         // switch
         if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            const { guild } = oldState;
            // join
            if (guild.members.me.voice.channelId == newState.channelId) handleJoinTimeout(client, oldState, newState, guildData);
            else handleLeaveTimeout(client, oldState, guildData);
         }
      } catch (e) {
         console.log(e);
      }
   },
} as System;

export async function handleJoinTimeout(client: Client, oldState, newState, guildData) {
   // join
   const { guild } = newState;

   // client was moved to another vc
   if (client.user!.id == newState.id) handleLeaveTimeout(client, newState, guildData);
   // comprobaciones previas (player, canal, cliente, 24/7)
   const player = client.lavalink.getPlayer(guild.id);
   if (!player || !player?.textChannelId) return;
   const queue = player.queue;
   if (!queue) return;
   // si el modo 247 estaba activado y el reproductor estaba pausado debido a que no habia nadie, lo reproducimos de vuelta
   if (player.get('247') && newState.channel.members.filter((m) => !m.user.bot).size >= 1) {
      if (!player.paused) return; // Ya se estaba reproduciendo
      await player.resume();
      const ALLDAY_PAUSED_MSG: Message = player.get('247_pausedMsg');
      if (ALLDAY_PAUSED_MSG) {
         ALLDAY_PAUSED_MSG.delete().catch(() => {});
         player.set('247_pausedMsg', null);
      }
      return;
   }
   if (guild.members.me.voice.channelId != newState.channelId) return;
   if (!player.get('noMembersMsg')) return; // ya estaba el mensaje enviado;
   const PAUSED_MSG = player.get('noMembersMsg') as Message;
   const TIMEOUT: ReturnType<typeof setTimeout> = player.get('noMembersTimeout');

   // filtrar por cantidad de usuarios en el canal que NO sean bots
   if (newState.channel.members.filter((m) => !m.user.bot).size >= 1) {
      if (player.paused) await player.resume();
      player.set('noMembersMsg', null);
      player.set('noMembersTimeout', null);
      PAUSED_MSG.delete().catch(() => {});
      clearTimeout(TIMEOUT);
   }
}

export async function handleLeaveTimeout(client: Client, oldState, guildData) {
   const { guild } = oldState;
   const { music, language } = guildData;

   // comprobaciones previas (player, canal, cliente, 24/7)
   const player = client.lavalink.getPlayer(guild.id) as Player;
   if (!player || !player?.textChannelId) return;
   const queue = player.queue;
   if (!queue) return;
   if (player.get('247') && oldState.channel.members.filter((m) => !m.user.bot).size < 1) {
      if (player.paused) return; // Ya estaba pausado
      await player.pause();
      const textChannel = client.channels.cache.get(player.textChannelId!) as TextChannel;
      const voiceChannelMention = `<#${guild.members.me.voice.channelId}>`;
      if(textChannel) textChannel.send({
         embeds: [
            new Embed().addFields([
               {
                  name: client.translate(language, `UTILS.MUSIC.getPlayingEmbed.playerPaused.name`),
                  value: client.translate(language, `UTILS.MUSIC.getPlayingEmbed.playerPaused.247`, {channel: voiceChannelMention})
               },
            ]),
         ],
      })
      .then((msg) => player.set('247_pausedMsg', msg))
      .catch(() => {});
      return;
   }
   if (player.voiceChannelId != oldState.channelId) return;
   if (player.get('noMembersMsg') || player.get('noMembersTimeout')) return; // ya estaba el mensaje enviado;

   // filtrar por cantidad de usuarios en el canal que NO sean bots
   if (oldState.channel.members.filter((m) => !m.user.bot).size < 1) {
      if (!player.paused) await player.pause();
      const textChannel = client.channels.cache.get(player.textChannelId!) as TextChannel;
      const leaveTimestamp = `<t:${Math.round((Date.now() + Number(music.leaveTimeout)) / 1000)}:R>`;
      const voiceChannelMention = `<#${guild.members.me.voice.channelId}>`;

      if (textChannel)
         textChannel
            .send({
               embeds: [
                  new Embed().addFields([
                     {
                        name: client.translate(language, `UTILS.MUSIC.getPlayingEmbed.playerPaused.name`),
                        value: client.translate(language, `UTILS.MUSIC.getPlayingEmbed.playerPaused.empty`, {
                           channel: voiceChannelMention,
                           leaveTimestamp,
                        }),
                     },
                  ]),
               ],
            })
            .then((msg) => player.set('noMembersMsg', msg))
            .catch(() => {});

      const timeout = setTimeout(() => {
         return new Promise((resolve) => {
            const VOICE_CHANNEL = guild.members.me.voice.channelId;
            const PAUSED_MSG = player.get('noMembersMsg') as Message;
            if (oldState.channel.members.filter((m) => !m.user.bot).size < 1) {
               if (!queue) return;
               player.destroy();
               player.set('noMembersMsg', null);
               player.set('noMembersTimeout', null);
               if (textChannel && PAUSED_MSG) {
                  // @ts-ignore
                  const infoMessage = {
                     embeds: [
                        new Embed().addFields([
                           {
                              name: client.translate(language, `UTILS.MUSIC.getPlayingEmbed.playerEnded`),
                              value: client.translate(language, `UTILS.MUSIC.getPlayingEmbed.left`, {
                                 channel: `<#${VOICE_CHANNEL}>`,
                                 leaveDuration: client.utils.general
                                    .duration(music.leaveTimeout, language)
                                    .map((d) => `\`${d}\``)
                                    .join(', '),
                              }),
                           },
                        ]),
                     ],
                  };
                  PAUSED_MSG.edit(infoMessage).catch(() => textChannel.send(infoMessage).catch(() => {}));
               }
            }
            resolve(2);
         });
      }, Number(music.leaveTimeout));

      player.set('noMembersTimeout', timeout);
   }
}
