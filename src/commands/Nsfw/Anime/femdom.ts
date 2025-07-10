import Client from '../../../structures/Client';
import { Command } from '../../../structures/Command';

export default {
   execute(client: Client, message, args, prefix, guildData, userData) {
      return client.utils.general.getNsfwImage(message, this.NAME, userData, guildData);
   },
} as Command;
