import { Embed, ErrorEmbed } from '../../../extenders/discord/Embed';
import Client from '../../../structures/Client';
import { Command } from '../../../structures/Command';

export default {
   OPTIONS: [
      {
         STRING: {
            REQUIRED: true,
         },
      },
   ],
   USAGE: '<texto>',
   execute(client: Client, message, args: string[], prefix, guildData) {
      if (!args.length)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.noargs.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.noargs.value`, {
                     prefix, cmdName: this.NAME, cmdUsage: this.USAGE,
                  }),
               ),
            ],
         });

      const casedText = (() => {
         const text = args.join(" ");
         return text.split('').map(char => {
            return Math.random() < 0.5 ? char.toUpperCase() : char.toLowerCase();
          }).join('');
      })();

      return message.reply({
         embeds: [new Embed().addField(client.translate(guildData.language, `${this.LANG_KEY}.success.name`), `\`\`\`${casedText}\`\`\``)],
      });
   },
} as Command;
