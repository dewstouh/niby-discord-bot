import { Command } from '../../structures/Command';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import Client from '../../structures/Client';

export default {
   OPTIONS: [
      {
         STRING: {
            REQUIRED: true,
         },
      },
   ],
   USAGE: '<emoji>',
   execute(client: Client, message, args, prefix, guildData) {
      const emojis = client.utils.message.extractEmojis(args.join(' '), true);
      if (emojis.length < 1)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.invalid.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.invalid.value`, {example: `${prefix}${this.NAME} 🍋`}),
               ),
            ],
         });

      const emojiEmbeds = emojis.map((e) => {
         if (e.parsed.id)
            return new Embed()
               .addField(`URL`, `>>> [\`${client.translate(guildData.language, `COMMON.TEXTS.clickHere`)}\`](${e.url})`, true)
               .addField(`${client.translate(guildData.language, `${this.LANG_KEY}.copy.name`)}`, `>>> \`\`\`${e.str}\`\`\``, false)
               .setImage(e.url);

         return new Embed()
            .addField(`URL`, `>>> [\`${client.translate(guildData.language, `COMMON.TEXTS.clickHere`)}\`](${e.url})`, false)
            .addField(`${client.translate(guildData.language, `${this.LANG_KEY}.copy.name`)}`, `>>> \`\`\`${e.str}\`\`\``, false)
            .setImage(e.url);
      });

      return client.utils.message.paginateEmbeds(message, guildData.language, emojiEmbeds);
   },
} as Command;
