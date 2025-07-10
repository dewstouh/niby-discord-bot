import { Command } from '../../structures/Command';
import Client from '../../structures/Client';
import { Player } from 'lavalink-client';

export default {
   async execute(client: Client, message, args, prefix, guildData, userData, player: Player) {
      if(!client.utils.music.isPlaying(message, player, prefix, guildData.language)) return;

      // Not allowed? return
      if (!client.utils.music.isAllowedToAction(message, this.NAME, guildData)) return;

      await client.utils.music.stopPlayer(message, player, guildData.language);
   },
} as Command;
