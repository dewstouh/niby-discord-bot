import { Command } from '../../structures/Command';
import Client from '../../structures/Client';
import { ErrorEmbed } from '../../extenders/discord/Embed';

export default {
   execute(client: Client, message, args, prefix, guildData, userData, player) {
      if (!client.utils.music.isPlaying(message, player, prefix, guildData.language)) return;
      const previous = player.queue.previous[0];
      if (!previous)
         return message.reply({
            embeds: [new ErrorEmbed().setDescription(client.translate(guildData.language, `UTILS.MUSIC.playPrevious.error`))],
            ephemeral: true,
         });
      return client.utils.music.playSong(message, previous.info.uri, { guildData, playPrevious: true });
   },
} as Command;
