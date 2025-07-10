import Client from '../../../structures/Client';
import { Component } from '../../../typings/component';

export default {
     execute(client: Client, interaction, args, guildData, userData) {
      const type = args[0];
      const executorId = args[1];
      const customTags = client.cache.get(interaction.message.id);
      if(executorId !== interaction.user.id) {
         interaction.customId = null;
         interaction.message = null;
         return client.utils.general.getNsfwImage(interaction, type, userData, guildData, customTags);
      }
      return client.utils.general.getNsfwImage(interaction, type, userData, guildData, customTags);
   },
} as Component;
