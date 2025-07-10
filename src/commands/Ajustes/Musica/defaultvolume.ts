import { Embed, ErrorEmbed } from '../../../extenders/discord/Embed';
import Client from '../../../structures/Client';
import { Command } from '../../../structures/Command';
export default {
   USAGE: '<volumen>',
   PERMISSIONS: ['ManageGuild'],
   BOT_PERMISSIONS: ['ManageGuild'],
   OPTIONS: [
      {
         NUMBER: {
            REQUIRED: true,
         },
      },
   ],
   execute(client: Client, message, args, prefix, guildData) {
      const volume = args[0];
      if (!volume)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.noargs.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.noargs.value`, {
                     prefix, cmdName: this.NAME, usage: this.USAGE,
                  }),
               ),
            ],
         });

      if (isNaN(volume))
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.invalid.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.invalid.value`, {
                     prefix, cmdName: this.NAME, usage: this.USAGE,
                  }),
               ),
            ],
         });

      guildData
         .updateOne({ 'music.volume': parseInt(volume) })
         .then(() => {
            return message.reply({
               embeds: [
                  new Embed().setDescription(
                     client.translate(guildData.language, `${this.LANG_KEY}.success`, {volume}),
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
                        prefix, cmdName: this.NAME, usage: this.USAGE,
                     }),
                  }),
               ],
               ephemeral: true,
            });
         });
   },
} as Command;
