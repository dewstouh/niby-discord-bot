import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import Client from '../../structures/Client';
import { Command } from '../../structures/Command';
export default {
   USAGE: '<nuevoPrefijo>',
   PERMISSIONS: ['ManageGuild'],
   BOT_PERMISSIONS: ['ManageGuild'],
   OPTIONS: [
		{
			STRING: {
				REQUIRED: true,
			},
		},
	],
   execute(client: Client, message, args, prefix, guildData) {
      if (!args.length)
         return message.reply({
            embeds: [
               new ErrorEmbed().addFields({
                  name: client.translate(guildData.language, `${this.LANG_KEY}.noargs.name`, {
                     prefix,
                  }),
                  value: client.translate(guildData.language, `${this.LANG_KEY}.noargs.value`, {
                     prefix,
                     cmdName: this.NAME,
                  }),
               }),
            ],
            ephemeral: true,
         });

      guildData.updateOne({ prefix: args[0] })
      .then(() => {
         return message.reply({
            embeds: [
               new Embed().addFields({
                  name: client.translate(guildData.language, `${this.LANG_KEY}.success.name`, {
                     yesEmoji: client.allemojis.yes,
                  }),
                  value: client.translate(guildData.language, `${this.LANG_KEY}.success.value`, {
                     prefix: args[0],
                  }),
               }),
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
