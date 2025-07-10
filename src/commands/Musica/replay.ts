import { Command } from '../../structures/Command';
import Client from '../../structures/Client';
import { Player } from 'lavalink-client';

export default {
   async execute(client: Client, message, args, prefix, guildData, userData, player: Player) {
      // No player? return
      if (!client.utils.music.isPlaying(message, player, prefix, guildData.language)) return;

      // Not allowed? return
      if (!client.utils.music.isAllowedToAction(message, this.NAME, guildData)) return;

      const seekAmount = 0;
      // Skip the song
      await client.utils.music.rewindPlayer(message, player, guildData.language, seekAmount, true);
   },
} as Command;
