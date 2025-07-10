import { Command } from '../../structures/Command';
import Client from '../../structures/Client';
import { Embed } from '../../extenders/discord/Embed';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildMember } from 'discord.js';

export default {
   ALIASES: ['userinfo', 'memberinfo'],
   OPTIONS: [
      {
         USER: {
            REQUIRED: true,
         },
      },
   ],
   USAGE: "<Usuario>",
   async execute(client: Client, message, args, prefix, guildData) {
      const member = ((await client.utils.general.getMember(message, args[0])) || message.member) as GuildMember;
      const buttons: ButtonBuilder[] = [];

      if (member.displayAvatarURL())
         buttons.push(
            new ButtonBuilder()
               .setLabel('Avatar')
               .setStyle(ButtonStyle.Link)
               .setURL(member.displayAvatarURL({ size: 4096 })),
         );

      if (member.user.bannerURL())
         buttons.push(
            new ButtonBuilder()
               .setLabel('Banner')
               .setStyle(ButtonStyle.Link)
               .setURL(member.user.bannerURL({ size: 4096 })!),
         );

      const components = buttons.length >= 1 ? [new ActionRowBuilder().addComponents(...buttons)] : [];

      const memberRoles = (() => {
         const sliceAmount = 25;
         const memberRoles = member.roles.cache
            .filter((r) => r.id !== message.guild.id)
            .sort((a, b) => b.rawPosition - a.rawPosition)
            .map((r) => `<@&${r.id}>`);
         if (memberRoles.length < 1) return [client.translate(guildData.language, `${this.LANG_KEY}.hasNoRoles`)];
         if (memberRoles.length <= sliceAmount) return memberRoles;
         const slicedRoles = memberRoles.slice(0, sliceAmount);
         slicedRoles.push(`\n${client.translate(guildData.language, `${this.LANG_KEY}.andMore`, {amount: memberRoles.length - sliceAmount})}`);
         return slicedRoles;
      })();

      return message.reply({
         embeds: [
            new Embed()
               .addField(`${client.allemojis.builder} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.member`)}`, `>>> \`${member.displayName}\`\n\`\`\`${member.user.username}\`\`\``, true)
               .addField(`${client.allemojis.info} Id`, `>>> <@${member.id}>\n\`\`\`${member.id}\`\`\``, true)
               .addField(
                  `${client.allemojis.clock} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.dates`)}`,
                  `>>> **${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.creation`)}** <t:${client.utils.general.toUnixTimestamp(
                     member.user.createdTimestamp,
                  )}> | <t:${client.utils.general.toUnixTimestamp(
                     member.user.createdTimestamp,
                  )}:R>\n**${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.joinedAt`)}** <t:${client.utils.general.toUnixTimestamp(
                     member.joinedTimestamp,
                  )}> | <t:${client.utils.general.toUnixTimestamp(member.joinedTimestamp)}:R>`,
                  false,
               )
               .addField(
                  `${client.allemojis.question} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.status`)}`,
                  `>>> ${
                     member.presence
                        ? `${client.allemojis[`${member.presence?.status || "offline"}`]} \`${client.translate(
                             guildData.language,
                             `PRESENCES.${member.presence?.status}`,
                          )}\``
                        : `${client.allemojis.offline} \`${client.translate(guildData.language, `PRESENCES.offline`)}\``
                  }`,
                  true,
               )
               .addField(
                  `${client.allemojis.role} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.highestRole`)}`,
                  member.roles.cache.size >= 1 ? `>>> <@&${member.roles.highest.id}>` : `>>> \`${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.highestRole.noRoles`)}\``,
                  true,
               )
               .addField(
                  `${client.allemojis.boost} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.booster`)}`,
                  member.premiumSince
                     ? `>>> ${client.allemojis.boost} <T:${client.utils.general.toUnixTimestamp(
                          member.premiumSinceTimestamp,
                       )}> | <T:${client.utils.general.toUnixTimestamp(member.premiumSinceTimestamp)}:R>`
                     : `>>> \`❌\``,
                  false,
               )
               .addField(
                  `${client.allemojis.favourite} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.badges.name`)}`,
                  [
                     member.user.flags && member.user.flags.toArray().length >= 1
                        ? `>>> ${member.user.flags
                             ?.toArray()
                             .map((f) => `- ${client.allemojis[f] || ""} \`${client.translate(guildData.language, `USER_FLAGS.${f}`)}\``)
                             .join('\n')}`
                        : `>>> \`${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.badges.noBadges`)}\``,
                  ].join('\n'),
                  true,
               )
               .addField(
                  `${client.allemojis.role} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.roles`)}`,
                  // @ts-ignore
                  '>>> ' + memberRoles.join(', '),
                  false,
               )
               .addField(
                  `${client.allemojis.builder} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.permissions`)}`,
                  // @ts-ignore
                  `>>> ${
                     member.id == message.guild.ownerId
                        ? `\`${client.translate(guildData.language, `PERMISSIONS.Owner`)}\``
                        : member.permissions.toArray().includes('Administrator')
                        ? `\`${client.translate(guildData.language, `PERMISSIONS.Administrator`)}\``
                        : `${member.permissions
                             .toArray()
                             .sort((a, b) => a.localeCompare(b))
                             .map((p) => `\`${client.translate(guildData.language, `PERMISSIONS.${p}`)}\``)
                             .join(', ')}`
                  }`,
                  false,
               )

               .setThumbnail(member.displayAvatarURL()),
         ],
         components,
      });
   },
} as Command;
