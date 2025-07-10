import { Command } from '../../structures/Command';
import Client from '../../structures/Client';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Role } from 'discord.js';

export default {
   ALIASES: ['roleinfo', 'inforole'],
   OPTIONS: [
      {
         ROLE: {
            REQUIRED: true,
         },
      },
   ],
   USAGE: "<Rol>",
   async execute(client: Client, message, args, prefix, guildData) {
      if(!args[0]) return message.reply({
         embeds: [
            new ErrorEmbed()
            .addField(
               client.translate(guildData.language, `${this.LANG_KEY}.noargs.name`),
               client.translate(guildData.language, `${this.LANG_KEY}.noargs.value`, {prefix, cmdName: this.NAME})
            ),
         ]
      });

      const role:Role = await client.utils.general.getRole(message, args[0]);

      if(!role) return message.reply({
         embeds: [
            new ErrorEmbed()
            .addField(
               client.translate(guildData.language, `${this.LANG_KEY}.notfound.name`),
               client.translate(guildData.language, `${this.LANG_KEY}.notfound.value`, {prefix, cmdName: this.NAME})
            ),
         ]
      });

      const buttons: ButtonBuilder[] = [];

      if (role.iconURL())
         buttons.push(
            new ButtonBuilder()
               .setLabel(client.translate(guildData.language, `${this.LANG_KEY}.button.icon`))
               .setStyle(ButtonStyle.Link)
               .setURL(role.iconURL({size: 4096})!),
         );

      const components = buttons.length >= 1 ? [new ActionRowBuilder().addComponents(...buttons)] : [];

      return message.reply({
         embeds: [
            new Embed()
               .addField(`${client.allemojis.builder} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.role`)}`, `>>> \`${role.name}\`\n\`\`\`${role.name}\`\`\``, true)
               .addField(`${client.allemojis.info} Id`, `>>> <@&${role.id}>\n\`\`\`${role.id}\`\`\``, true)
               .addField(
                  `${client.allemojis.clock} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.dates`)}`,
                  `>>> **${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.creation`)}** <t:${client.utils.general.toUnixTimestamp(
                     role.createdTimestamp,
                  )}> | <t:${client.utils.general.toUnixTimestamp(
                     role.createdTimestamp,
                  )}:R>`,
                  false,
               )
               .addField(
                  `${client.allemojis.question} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.position`)}`,
                  `>>> \`${role.rawPosition}\``,
                  true,
               )
               .addField(
                  `${client.allemojis.role} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.hexColor`)}`,
                  `>>> \`${role.hexColor}\``,
                  true,
               )
               .addField(
                  `${client.allemojis.role} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.membersWhoHaveIt`)}`,
                  `>>> \`${role.members.size}\``,
                  true,
               )
               .addField(
                  `${client.allemojis.favourite} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.extras.name`)}`,
                  [
                     `>>> **${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.extras.emoji`)}:** ${role.unicodeEmoji || "`❌`"}`,
                     `**${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.extras.mentionable`)}:** ${role.mentionable ? "`✅`" :  "`❌`"}`,
                     `**${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.extras.managed`)}:** ${role.managed ? "`✅`" :  "`❌`"}`,
                     `**${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.extras.hoisted`)}:** ${role.hoist ? "`✅`" :  "`❌`"}`,
                     `**${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.extras.boosterRole`)}:** ${role.tags?.premiumSubscriberRole ? "`✅`" :  "`❌`"}`,
                     `**${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.extras.purchaseable`)}:** ${role.tags?.availableForPurchase ? "`✅`" :  "`❌`"}`,
                     `**${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.extras.editable`)}:** ${role.editable ? "`✅`" :  "`❌`"}`,
                  ].join("\n"),
                  true,
               )
               .addField(
                  `${client.allemojis.builder} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.permissions`)}`,
                  // @ts-ignore
                  `>>> ${
                     role.id == message.guild.ownerId
                        ? `\`${client.translate(guildData.language, `PERMISSIONS.Owner`)}\``
                        : role.permissions.toArray().includes('Administrator')
                        ? `\`${client.translate(guildData.language, `PERMISSIONS.Administrator`)}\``
                        : `${role.permissions
                             .toArray()
                             .sort((a, b) => a.localeCompare(b))
                             .map((p) => `\`${client.translate(guildData.language, `PERMISSIONS.${p}`)}\``)
                             .join(', ')}`
                  }`,
                  false,
               )
         ],
         components
      });
   },
} as Command;
