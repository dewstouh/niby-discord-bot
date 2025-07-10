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
   const {language} = GUILD_DATA;
   const textChannel = client.channels.cache.get(player.textChannelId!) as TextChannel;

   if (PLAYINGMSG_MAP && textChannel) {
      const infoMessage = {
         embeds: [
            new Embed()
               .addField(
                  // @ts-ignore
                  PLAYINGMSG_MAP.embeds[0].fields[0].name.replace(
                     `${client.allemojis.disk} ${client.translate(language, `UTILS.MUSIC.getPlayingEmbed.title`)}:`,
                     `${client.allemojis.yes} ${client.translate(language, `UTILS.MUSIC.getPlayingEmbed.ended`)}:`,
                  ),
                  `>>> ${client.allemojis.wait} ${client.translate(language, `UTILS.MUSIC.getPlayingEmbed.ended`)} <t:${Math.round(Date.now() / 1000)}:R>`,
               )
               .setFooter(PLAYINGMSG_MAP?.embeds[0]?.footer)
               .setColor(PLAYINGMSG_MAP?.embeds[0]?.color)
               .setThumbnail(PLAYINGMSG_MAP?.embeds[0]?.thumbnail?.url || null),
         ],
         components: client.utils.message.disableComponents(PLAYINGMSG_MAP),
      }
      PLAYINGMSG_MAP.edit(infoMessage).catch(() => textChannel.send(infoMessage).catch(() => {}));
   }
};
