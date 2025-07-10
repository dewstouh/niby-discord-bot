import { Player } from 'lavalink-client';
import Client from '../../../structures/Client';
import { Command } from '../../../structures/Command';

export default {
   execute(client: Client, message, args, prefix, guildData, userData, player:Player) {
      // @ts-ignore
      if (!client.utils.music.isPlaying(message, player, prefix, guildData.language)) return;
      // Not allowed? return
      if (!client.utils.music.isAllowedToAction(message, this.NAME, guildData)) return;

      return client.utils.music.setFilter(message, this.NAME.capitalizeFirstChar(), player, guildData.language);

   },
} as Command;
