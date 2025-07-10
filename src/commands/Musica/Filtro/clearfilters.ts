import { Player } from 'lavalink-client';
import Client from '../../../structures/Client';
import { Command } from '../../../structures/Command';
import { Embed } from '../../../extenders/discord/Embed';

export default {
   async execute(client: Client, message, args, prefix, guildData, userData, player:Player) {
      // @ts-ignore
      if (!client.utils.music.isPlaying(message, player, prefix, guildData.language)) return;
      // Not allowed? return
      if (!client.utils.music.isAllowedToAction(message, this.NAME, guildData)) return;

      await player.filterManager.clearEQ();
      await player.filterManager.resetFilters();

      return message.reply({
        embeds: [
            new Embed()
            .setDescription(client.translate(guildData.language, `${this.LANG_KEY}.success`))
        ]
      });
   },
} as Command;
