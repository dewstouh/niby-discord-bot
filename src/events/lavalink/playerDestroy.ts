import { Message, TextChannel } from 'discord.js';
import { Embed } from '../../extenders/discord/Embed';
import { Player } from 'lavalink-client';
import Client from '../../structures/Client';
import LavalinkManager from '../../structures/LavalinkManager';

export default async (manager: LavalinkManager, player: Player) => {
   // @ts-ignore
   const client: Client = manager.client;
   const PLAYINGMSG_MAP = player.get('playingMsg') as Message;
   const GUILD_DATA = await client.db.getGuildData(player.guildId);
   const { language } = GUILD_DATA;
   const textChannel = client.channels.cache.get(player.textChannelId!) as TextChannel;

   // CLEAR TIMERS & WARNING THINGS UP
   const noQueueMsg = player.get('noQueueMsg') as Message;
   const noMembersMsg = player.get('noMembersMsg') as Message;
   const noQueueTimeout: ReturnType<typeof setTimeout> = player.get('noQueueTimeout');
   const noMembersTimeout: ReturnType<typeof setTimeout> = player.get('noMembersTimeout');
   if (noQueueMsg) noQueueMsg.delete().catch(() => {});
   if (noMembersMsg) noMembersMsg.delete().catch(() => {});
   if (noMembersTimeout) clearTimeout(noMembersTimeout);
   if (noQueueTimeout) clearTimeout(noQueueTimeout);

   if (textChannel) {
      if (PLAYINGMSG_MAP) {
         const infoMessage = {
            embeds: [
               new Embed()
                  .addField(
                     // @ts-ignore
                     PLAYINGMSG_MAP.embeds[0].fields[0].name.replace(
                        `${client.allemojis.disk} ${client.translate(language, `UTILS.MUSIC.getPlayingEmbed.title`)}:`,
                        `${client.allemojis.yes} ${client.translate(language, `UTILS.MUSIC.getPlayingEmbed.ended`)}:`,
                     ),
                     `>>> ${client.allemojis.wait} ${client.translate(language, `UTILS.MUSIC.getPlayingEmbed.ended`)} <t:${Math.round(
                        Date.now() / 1000,
                     )}:R>`,
                  )
                  // @ts-ignore
                  .setFooter(PLAYINGMSG_MAP?.embeds[0]?.footer)
                  // @ts-ignore
                  .setColor(PLAYINGMSG_MAP?.embeds[0]?.color)
                  // @ts-ignore
                  .setThumbnail(PLAYINGMSG_MAP?.embeds[0]?.thumbnail?.url),
            ],
            components: client.utils.message.disableComponents(PLAYINGMSG_MAP),
         };
         PLAYINGMSG_MAP.edit(infoMessage).catch(() => textChannel.send(infoMessage).catch(() => {}));
      }
   }

   const playerCache = await client.redisCache.get(`lavalinkplayer_${player.guildId}`);
   if (playerCache) client.redisCache.delete(`lavalinkplayer_${player.guildId}`);
};
