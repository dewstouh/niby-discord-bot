import { Command } from '../../../structures/Command';
import { Embed, ErrorEmbed } from '../../../extenders/discord/Embed';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildMember } from 'discord.js';
import Client from '../../../structures/Client';

export default {
   ALIASES: ['userbanner', 'memberbanner', 'ubanner', 'mbanner'],
   GUILD_ONLY: true,
   OPTIONS: [
      {
         USER: {
            REQUIRED: false,
         },
      },
   ],
   USAGE: "<Usuario?>",
   async execute(client: Client, message, args, prefix, guildData) {
      const member = (await client.utils.general.getMember(message, args[0])) || (message.member as GuildMember);

      const buttons: ButtonBuilder[] = [];

      const memberBanner = member.user.bannerURL({ size: 4096 });
      if (!memberBanner)
         return message.reply({
            embeds: [
               new ErrorEmbed()
               .setDescription(client.translate(guildData.language, `${this.LANG_KEY}.embed.description`))
            ],
         });
      const isAnimatedAvatar = memberBanner.endsWith('.gif');

      if (isAnimatedAvatar) {
         buttons.push(
            new ButtonBuilder()
               .setLabel('GIF')
               .setStyle(ButtonStyle.Link)
               .setURL(member.user.bannerURL({ size: 4096 }) as string),

            new ButtonBuilder()
               .setLabel('PNG')
               .setStyle(ButtonStyle.Link)
               .setURL(member.user.bannerURL({ size: 4096, extension: 'png' }) as string),
         );
      } else {
         buttons.push(
            new ButtonBuilder()
               .setLabel('PNG')
               .setStyle(ButtonStyle.Link)
               .setURL(member.user.bannerURL({ size: 4096 }) as string),
         );
      }

      message.reply({
         embeds: [
            new Embed()
               .setAuthor({
                  name: client.translate(guildData.language, `${this.LANG_KEY}.embed.author`, {name: message.guild.name}),
                  iconURL: message.guild.iconURL({ dynamic: true }),
               })
               .setImage(memberBanner),
         ],
         components: [new ActionRowBuilder().addComponents(...buttons)],
      });
   },
} as Command;
