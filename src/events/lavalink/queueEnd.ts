import { Message, TextChannel } from 'discord.js';
import { Embed } from '../../extenders/discord/Embed';
import { Player } from 'lavalink-client';
import Client from '../../structures/Client';
import LavalinkManager from '../../structures/LavalinkManager';
import music from '../../config/music';

export default async (manager: LavalinkManager, player: Player) => {
   // @ts-ignore
   const client: Client = manager.client;
   if(player.get("247")) return;
   const textChannel = client.channels.cache.get(player.textChannelId!) as TextChannel;
   const GUILD_DATA = await client.db.getGuildData(player.guildId);
   const {language} = GUILD_DATA;

   const leaveTimestamp = `<t:${Math.round((Date.now() + Number(GUILD_DATA.music.leaveTimeout || music.defaultLeaveTimeout)) / 1000)}:R>`;

   if(textChannel) textChannel.send({
      embeds: [
         new Embed().addFields([
            {
               name: client.translate(language, `UTILS.MUSIC.getPlayingEmbed.playerPaused.name`),
               value: client.translate(language, `UTILS.MUSIC.getPlayingEmbed.playerPaused.noqueue`, {channel: `<#${player.voiceChannelId}>`, leaveTimestamp}),
            },
         ]),
      ],
   })
   .then((msg) => {
      const timeout = setTimeout(() => {
         return new Promise((resolve) => {
            const VOICE_CHANNEL = `<#${player.voiceChannelId}>`;
            const NOQUEUE_MSG = player.get('noQueueMsg') as Message;
               player.destroy();
               player.set('noQueueMsg', null);
               player.set('noQueueTimeout', null);
               if (textChannel && NOQUEUE_MSG) {
                  // @ts-ignore
                  const infoMessage = {
                     embeds: [
                        new Embed().addFields([
                           {
                              name: client.translate(language, `UTILS.MUSIC.getPlayingEmbed.playerEnded`),
                              value: client.translate(language, `UTILS.MUSIC.getPlayingEmbed.noqueueleft`, {
                                 channel: VOICE_CHANNEL,
                                 leaveDuration: client.utils.general.duration(GUILD_DATA.music.leaveTimeout, language).map(d => `\`${d}\``).join(", "),
                              }),
                           },
                        ]),
                     ],
                  };
                  NOQUEUE_MSG.edit(infoMessage).catch(() => textChannel.send(infoMessage).catch(() => {}));
               }
            resolve(2);
         });
      }, Number(GUILD_DATA.music.leaveTimeout));

      player.set('noQueueMsg', msg);
      player.set('noQueueTimeout', timeout);
   })
   .catch(() => {})
};
