import { Command } from '../../../structures/Command';
import { Embed } from '../../../extenders/discord/Embed';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
   ALIASES: ["guildavatar", "serveravatar", "gavatar", "savatar", "svavatar"],
   execute(client, message, args, prefix, guildData) {
      const buttons: ButtonBuilder[] = [];

      const isAnimatedAvatar = message.guild.iconURL({ dynamic: true }).endsWith('.gif');

      if (isAnimatedAvatar) {
         buttons.push(
            new ButtonBuilder()
               .setLabel('GIF')
               .setStyle(ButtonStyle.Link)
               .setURL(message.guild.iconURL({ dynamic: true, size: 4096 })),

            new ButtonBuilder()
               .setLabel('PNG')
               .setStyle(ButtonStyle.Link)
               .setURL(message.guild.iconURL({size: 4096, extension: "png" })),
         );
      } else {
        buttons.push(
            new ButtonBuilder()
               .setLabel('PNG')
               .setStyle(ButtonStyle.Link)
               .setURL(message.guild.iconURL({ dynamic: true, size: 4096 })),
        )
      }

      message.reply({
         embeds: [
            new Embed()
               .setAuthor({
                  name: client.translate(guildData.language, `${this.LANG_KEY}.embed.author`, {name: message.guild.name}),
                  iconURL: message.guild.iconURL({ dynamic: true }),
               })
               .setImage(message.guild.iconURL({ dynamic: true, size: 512 })),
         ],
         components: [new ActionRowBuilder().addComponents(...buttons)],
      });
   },
} as Command;
