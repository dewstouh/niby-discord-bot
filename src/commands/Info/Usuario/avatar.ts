import { Command } from '../../../structures/Command';
import { Embed } from '../../../extenders/discord/Embed';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildMember } from 'discord.js';
import Client from '../../../structures/Client';

export default {
   ALIASES: ['useravatar', 'uavatar', 'memberavatar', 'mavatar'],
   OPTIONS: [
      {
         USER: {
            REQUIRED: false,
         },
      },
   ],
   USAGE: "<Usuario?>",
   async execute(client:Client, message, args, prefix, guildData) {
      const member = (await client.utils.general.getMember(message, args[0])) || (message.member as GuildMember);

      const buttons: ButtonBuilder[] = [];

      const isAnimatedAvatar = member.user.displayAvatarURL().endsWith('.gif');

      if (isAnimatedAvatar) {
         buttons.push(
            new ButtonBuilder()
               .setLabel('GIF')
               .setStyle(ButtonStyle.Link)
               .setURL(member.user.displayAvatarURL({ size: 4096 })),

            new ButtonBuilder()
               .setLabel('PNG')
               .setStyle(ButtonStyle.Link)
               .setURL(member.user.displayAvatarURL({ size: 4096, extension: 'png' })),
         );
      } else {
         buttons.push(
            new ButtonBuilder()
               .setLabel('PNG')
               .setStyle(ButtonStyle.Link)
               .setURL(member.user.displayAvatarURL({size: 4096 })),
         );
      }

      message.reply({
         embeds: [
            new Embed()
               .setAuthor({
                  name: client.translate(guildData.language, `${this.LANG_KEY}.embed.author.avatar`, {name: member.displayName}),
                  iconURL: member.user.displayAvatarURL({ dynamic: true }),
               })
               .setImage(member.user.displayAvatarURL({ dynamic: true, size: 512 })),
         ],
         components: [new ActionRowBuilder().addComponents(...buttons)],
      });
   },
} as Command;
