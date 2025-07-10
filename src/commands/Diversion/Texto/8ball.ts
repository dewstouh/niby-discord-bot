import { Embed, ErrorEmbed } from '../../../extenders/discord/Embed';
import Client from '../../../structures/Client';
import { Command } from '../../../structures/Command';

export default {
   USAGE: '<pregunta>',
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
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.noargs.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.noargs.value`, {
                     prefix, cmdName: this.NAME, cmdUsage: this.USAGE,
                  }),
               ),
            ],
         });

      const randomAnswer = (() => {
         const answers: any = client.translate(guildData.language, `${this.LANG_KEY}.answers`);
         return answers.random();
      })();

      return message.reply({
         embeds: [
            new Embed().addField(
               client.translate(guildData.language, `${this.LANG_KEY}.success.name`),
               `\`\`\`${randomAnswer}\`\`\``,
            ),
         ],
      });
   },
} as Command;
