import { Command } from '../../structures/Command';
import Client from '../../structures/Client';

export default {
   async execute(client:Client, message, args, prefix, guildData, userData, player) {
      await client.utils.music.reconnect(message, player, guildData)
   },
} as Command;
