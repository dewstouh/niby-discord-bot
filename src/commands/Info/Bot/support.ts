import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Embed } from '../../../extenders/discord/Embed';
import { Command } from '../../../structures/Command';
import Client from '../../../structures/Client';

export default {
   ALIASES: ['soporte'],
   execute(client:Client, message, args, prefix, guildData) {
      message.reply({
         embeds: [
            new Embed().addFields([
               {
                  name: client.translate(guildData.language, `${this.LANG_KEY}.embed.name`, {
                     emoji: client.allemojis.niby,
                  }),
                  value: `> [\`discord.gg/niby\`](${process.env.DISCORD})`,
                  inline: true,
               },
            ]),
         ],
         components: [
            new ActionRowBuilder().addComponents([
               new ButtonBuilder()
                  .setStyle(ButtonStyle.Link)
                  .setURL(process.env.DISCORD)
                  .setEmoji(client.allemojis.discord)
                  .setLabel(client.translate(guildData.language, `${this.LANG_KEY}.button.support`)),
            ]),
         ],
         ephemeral: true,
      });
   },
} as Command;
