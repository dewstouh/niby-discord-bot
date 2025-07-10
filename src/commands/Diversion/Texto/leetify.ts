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

      const leetifiedText = (() => {
         return args
            .join(' ')
            .replace(/A/, '4')
            .replace(/B/, '8')
            .replace(/d/, 'D')
            .replace(/E/, '3')
            .replace(/I/, '1')
            .replace(/O/, '0')
            .replace(/U/, '4')
            .replace(/S/, '5')
            .replace(/Z/, '2')

            .replace(/a/, '4')
            .replace(/b/, '8')
            .replace(/e/, '3')
            .replace(/i/, '1')
            .replace(/o/, '0')
            .replace(/u/, '4')
            .replace(/s/, '5')
            .replace(/z/, '2');
      })();

      return message.reply({
         embeds: [new Embed().addField(client.translate(guildData.language, `${this.LANG_KEY}.success.name`), `\`\`\`${leetifiedText}\`\`\``)],
      });
   },
} as Command;
