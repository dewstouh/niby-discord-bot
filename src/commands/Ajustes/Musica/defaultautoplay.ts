import { Embed, ErrorEmbed } from '../../../extenders/discord/Embed';
import Client from '../../../structures/Client';
import { Command } from '../../../structures/Command';
export default {
   PERMISSIONS: ['ManageGuild'],
   BOT_PERMISSIONS: ['ManageGuild'],
   execute(client: Client, message, args, prefix, guildData) {
      const toggledAutoplay = !guildData.music.autoplay;

      guildData
         .updateOne({ 'music.autoplay': toggledAutoplay })
         .then(() => {
            return message.reply({
               embeds: [
                  new Embed()
                  .setDescription(
                     client.translate(guildData.language, `${this.LANG_KEY}.success`, {
                        toggleMode: toggledAutoplay
                           ? client.translate(guildData.language, `COMMON.TEXTS.enabled`).toLowerCase()
                           : client.translate(guildData.language, `COMMON.TEXTS.disabled`).toLowerCase(),
                     }),
                  ),
               ],
               ephemeral: true,
            });
         })
         .catch(() => {
            return message.reply({
               embeds: [
                  new ErrorEmbed().addFields({
                     name: client.translate(guildData.language, `${this.LANG_KEY}.error.name`),
                     value: client.translate(guildData.language, `${this.LANG_KEY}.error.value`, {
                        toggleMode: toggledAutoplay
                           ? client.translate(guildData.language, `COMMON.TEXTS.enabled`).toLowerCase()
                           : client.translate(guildData.language, `COMMON.TEXTS.disabled`).toLowerCase(),
                     }),
                  }),
               ],
               ephemeral: true,
            });
         });
   },
} as Command;
