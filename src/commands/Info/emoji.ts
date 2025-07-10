import { Command } from '../../structures/Command';
import Client from '../../structures/Client';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';

export default {
   ALIASES: ['emojiinfo'],
   OPTIONS: [
      {
         STRING: {
            REQUIRED: true,
         },
      },
   ],
   USAGE: "<Emoji(s)>",
   execute(client: Client, message, args, prefix, guildData) {
      const emojis = client.utils.message.extractEmojis(args.join(' '), true);
      if (emojis.length < 1)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.invalid.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.invalid.value`, {prefix, cmdName: this.NAME, cmdUsage: this.USAGE}),
               ),
            ],
         });

      const emojiEmbeds = emojis.map((e) => {
         if (e.parsed.id)
            return new Embed()
               .addField(client.translate(guildData.language, `${this.LANG_KEY}.emoji.name`), `>>> \`${e.parsed.name}\``, true)
               .addField(`Id`, `>>> \`${e.parsed.id}\``, true)
               .addField(client.translate(guildData.language, `${this.LANG_KEY}.emoji.animated`), `>>> \`${e.parsed.animated ? "`✅`" : "`❌`"}\``, true)
               .addField(client.translate(guildData.language, `${this.LANG_KEY}.emoji.type.name`), `>>> \`${client.translate(guildData.language, `${this.LANG_KEY}.emoji.type.custom.value`)}\``, true)
               .addField(client.translate(guildData.language, `${this.LANG_KEY}.emoji.url`), `>>> [${client.translate(guildData.language, `COMMON.TEXTS.clickHere`)}](${e.url})`, true)
               .addField(client.translate(guildData.language, `${this.LANG_KEY}.emoji.copy`), `>>> \`\`\`${e.str}\`\`\``, false)
               .setImage(e.url);

         return new Embed()
            .addField(client.translate(guildData.language, `${this.LANG_KEY}.emoji.name`), `\`${e.parsed.name}\``, true)
            .addField(client.translate(guildData.language, `${this.LANG_KEY}.emoji.type.name`), `>>> \`${client.translate(guildData.language, `${this.LANG_KEY}.emoji.type.default.value`)}\``, false)
            .addField(client.translate(guildData.language, `${this.LANG_KEY}.emoji.url`), `>>> [${client.translate(guildData.language, `COMMON.TEXTS.clickHere`)}](${e.url})`, false)
            .addField(client.translate(guildData.language, `${this.LANG_KEY}.emoji.copy`), `>>> \`\`\`${e.str}\`\`\``, false)
            .setImage(e.url);
      });

      return client.utils.message.paginateEmbeds(message, guildData.language, emojiEmbeds);
   },
} as Command;
