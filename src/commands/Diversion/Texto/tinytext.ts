import { Embed, ErrorEmbed } from '../../../extenders/discord/Embed';
import Client from '../../../structures/Client';
import { Command } from '../../../structures/Command';

const map = {
   A: '\u1d00',
   B: '\u0299',
   C: '\u1d04',
   D: '\u1d05',
   E: '\u1d07',
   F: '\ua730',
   G: '\u0262',
   H: '\u029c',
   I: '\u026a',
   J: '\u1d0a',
   K: '\u1d0b',
   L: '\u029f',
   M: '\u1d0d',
   N: '\u0274',
   O: '\u1d0f',
   P: '\u1d18',
   Q: 'Q',
   R: '\u0280',
   S: '\ua731',
   T: '\u1d1b',
   U: '\u1d1c',
   V: '\u1d20',
   W: '\u1d21',
   X: 'x',
   Y: '\u028f',
   Z: '\u1d22',
};

export default {
   OPTIONS: [
      {
         STRING: {
            REQUIRED: true,
         },
      },
   ],
   USAGE: '<pregunta>',
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

      const tinifiedText = (() => {
         let str = args.join(' ');
         let c = '',
            a;
         str = str.toUpperCase();
         for (let d = 0, e = str.length; d < e; d++) {
            (a = map[str.charAt(d)]), typeof a == 'undefined' && (a = str.charAt(d)), (c += a);
         }
         return c;
      })();

      return message.reply({
         embeds: [new Embed().addField(client.translate(guildData.language, `${this.LANG_KEY}.success.name`), `\`\`\`${tinifiedText}\`\`\``)],
      });
   },
} as Command;
