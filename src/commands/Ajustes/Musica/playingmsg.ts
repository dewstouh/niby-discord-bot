import { Embed, ErrorEmbed } from '../../../extenders/discord/Embed';
import Client from '../../../structures/Client';
import { Command } from '../../../structures/Command';
export default {
   PERMISSIONS: ['ManageGuild'],
   BOT_PERMISSIONS: ['ManageGuild'],
   execute(client: Client, message, args, prefix, guildData) {
    const playingMessage = !guildData.music.playingMessage;

      guildData.updateOne({ "music.playingMessage": playingMessage })
      .then(() => {
         return message.reply({
            embeds: [
               new Embed().setDescription(
                  client.translate(guildData.language, `${this.LANG_KEY}.success`, {
                     toggleMode: (playingMessage
                        ? client.translate(guildData.language, `COMMON.TEXTS.enabled`)
                        : client.translate(guildData.language, `COMMON.TEXTS.disabled`))?.toLowerCase(),
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
                  value: client.translate(guildData.language, `${this.LANG_KEY}.error.value`)
               }),
            ],
            ephemeral: true,
         });
      })


   },
} as Command;
