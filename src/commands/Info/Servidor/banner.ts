import { Command } from '../../../structures/Command';
import { Embed, ErrorEmbed } from '../../../extenders/discord/Embed';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
   ALIASES: ['serverbanner', 'guildbanner', 'bannerserver', 'guildthumbnail', 'serverthumbnail', 'gbanner', 'sbanner', "svbanner"],
   GUILD_ONLY: true,
   execute(client, message, args, prefix, guildData) {
      const buttons: ButtonBuilder[] = [];

      const guildBanner = message.guild!.bannerURL({dynamic: true, size: 4096});
      if(!guildBanner) return message.reply({
        embeds: [
            new ErrorEmbed()
            .setDescription(client.translate(guildData.language, `${this.LANG_KEY}.error.nobanner`, {name: message.guild.name}))
        ]
      })
      const isAnimatedAvatar = guildBanner.endsWith('.gif');

      if (isAnimatedAvatar) {
         buttons.push(
            new ButtonBuilder()
               .setLabel('GIF')
               .setStyle(ButtonStyle.Link)
               .setURL(message.guild.bannerURL({ dynamic: true, size: 4096 })),

            new ButtonBuilder()
               .setLabel('PNG')
               .setStyle(ButtonStyle.Link)
               .setURL(message.guild.bannerURL({ size: 4096, extension: 'png' })),
         );
      } else {
         buttons.push(
            new ButtonBuilder()
               .setLabel('PNG')
               .setStyle(ButtonStyle.Link)
               .setURL(message.guild.bannerURL({ dynamic: true, size: 4096 })),
         );
      }

      message.reply({
         embeds: [
            new Embed()
               .setAuthor({
                  name: client.translate(guildData.language, `${this.LANG_KEY}.embed.author`, {name: message.guild.name}),
                  iconURL: message.guild.iconURL({dynamic: true}),
               })
               .setImage(guildBanner),
         ],
         components: [new ActionRowBuilder().addComponents(...buttons)],
      });
   },
} as Command;
