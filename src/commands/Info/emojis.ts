import { Command } from '../../structures/Command';
import { Embed } from '../../extenders/discord/Embed';
import Client from '../../structures/Client';

export default {
   execute(client: Client, message, args, prefix, guildData) {
      const guildEmojis =
         message.guild.emojis.cache.size >= 1
            ? message.guild.emojis.cache.map((e) => e).join(' ')
            : client.translate(guildData.language, `${this.LANG_KEY}.noEmojis`);

      return message.reply({
         embeds: [
            new Embed()
               .setAuthor({
                  name: `[${message.guild.emojis.cache.size}] ${client.translate(guildData.language, `${this.LANG_KEY}.embed.author`, {name: message.guild.name})}`,
                  iconURL: message.guild.iconURL(),
               })
               .setDescription(`>>> ## ${guildEmojis}`)
               .setFooter({ text: client.translate(guildData.language, `${this.LANG_KEY}.embed.footer`, {prefix}) }),
         ],
      });
   },
} as Command;
