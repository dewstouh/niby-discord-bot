import { Command } from '../../structures/Command';
import Client from '../../structures/Client';

export default {
   async execute(client:Client, message, args, prefix, guildData, userData) {
      const query = args.slice(0).join(" ");
      await client.utils.music.playSong(message, query, { guildData, userData, playSkip: true })
   },
} as Command;
