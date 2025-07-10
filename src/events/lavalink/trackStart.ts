import { Guild, Message, TextChannel } from 'discord.js';
import { Player, Queue, Track } from 'lavalink-client';
import Client from '../../structures/Client';
import LavalinkManager from '../../structures/LavalinkManager';

export default async (manager: LavalinkManager, player: Player, song: Track) => {
   const client: Client = manager.client;

   const queue = player.queue as Queue;

   const textChannel = client.channels.cache.get(player.textChannelId!) as TextChannel;
   const guild = client.guilds.cache.get(player.guildId!) as Guild;
   const GUILD_DATA = await client.db.getGuildData(guild.id);
   if (!textChannel || !guild) return;

   const queueEmbed = client.utils.music.getPlayingEmbed(queue, song, GUILD_DATA.language);
   const queueComponents = client.utils.music.getComponents(player);

   const noQueueMsg = player.get('noQueueMsg') as Message;
   const noQueueTimeout:ReturnType<typeof setTimeout> = player.get('noQueueTimeout');
   if(noQueueTimeout) {
      clearTimeout(noQueueTimeout);
      player.set('noQueueTimeout', null);
   }
   if (noQueueMsg && noQueueMsg.delete) {
      noQueueMsg.delete().catch(() => {});
      player.set('noQueueMsg', null);
   }

   if (GUILD_DATA.music.playingMessage)
      textChannel
         .send({
            embeds: [queueEmbed],
            // @ts-ignore
            components: queueComponents,
         })
         .then((msg) => {
            player.set(`playingMsg`, msg);
         })
         .catch(() => {
         });
};
