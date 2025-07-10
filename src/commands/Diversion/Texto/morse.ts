import { Embed, ErrorEmbed } from '../../../extenders/discord/Embed';
import { Command } from '../../../structures/Command';

const morseCode = {
   A: '.-',
   B: '-...',
   C: '-.-.',
   D: '-..',
   E: '.',
   F: '..-.',
   G: '--.',
   H: '....',
   I: '..',
   J: '.---',
   K: '-.-',
   L: '.-..',
   M: '--',
   N: '-.',
   O: '---',
   P: '.--.',
   Q: '--.-',
   R: '.-.',
   S: '...',
   T: '-',
   U: '..-',
   W: '.--',
   X: '-..-',
   Y: '-.--',
   Z: '--..',
};

export default {
   OPTIONS: [
      {
         STRING: {
            REQUIRED: true,
         },
      },
   ],
   USAGE: '<texto>',
   execute(client, message, args, prefix, guildData) {
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

      const morsedText = (() => {
         const text = args.join(' ');
         return text
            .toUpperCase()
            .split('')
            .map((el) => {
               return morseCode[el] ? morseCode[el] : el;
            })
            .join('');
      })();

      return message.reply({
         embeds: [new Embed().addField(client.translate(guildData.language, `${this.LANG_KEY}.success.name`), `\`\`\`${morsedText}\`\`\``)],
      });
   },
} as Command;
