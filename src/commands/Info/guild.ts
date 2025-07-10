import { Command } from '../../structures/Command';
import Client from '../../structures/Client';
import { Embed } from '../../extenders/discord/Embed';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Locale, PermissionFlagsBits } from 'discord.js';
import LocaleEmojis from '../../config/LocaleEmojis';

export default {
   ALIASES: ['serverinfo', 'guildinfo'],
   execute(client: Client, message, args, prefix, guildData) {
      const { guild } = message;
      const guildLanguage = Object.keys(Locale).find((v) => Locale[v] === guild.preferredLocale) || client.allemojis.question;
      const buttons: ButtonBuilder[] = [];

      if (guild.iconURL())
         buttons.push(
            new ButtonBuilder()
               .setLabel('Avatar')
               .setStyle(ButtonStyle.Link)
               .setURL(guild.iconURL({ size: 4096 })),
         );

      if (guild.bannerURL())
         buttons.push(
            new ButtonBuilder()
               .setLabel('Banner')
               .setStyle(ButtonStyle.Link)
               .setURL(guild.bannerURL({ size: 4096 })),
         );

      if (guild.splashURL())
         buttons.push(
            new ButtonBuilder()
               .setLabel('Splash')
               .setStyle(ButtonStyle.Link)
               .setURL(guild.splashURL({ size: 4096 })),
         );

      const components = buttons.length >= 1 ? [new ActionRowBuilder().addComponents(...buttons)] : [];

      return message.reply({
         embeds: [
            new Embed()
               .addField(`${client.allemojis.builder} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.guild`)}`, `>>> \`${guild.name}\`\n\`\`\`${guild.id}\`\`\``, true)
               .addField(`${client.allemojis.crown} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.owner`)}`, `>>> <@${guild.ownerId}>\n\`\`\`${guild.ownerId}\`\`\``, true)
               .addField(
                  `${client.allemojis.clock} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.dates`)}`,
                  `>>> **${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.creation`)}** <t:${client.utils.general.toUnixTimestamp(
                     guild.createdTimestamp,
                  )}> | <t:${client.utils.general.toUnixTimestamp(
                     guild.createdTimestamp,
                  )}:R>\n**${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.gotInvitedAt`)}** <t:${client.utils.general.toUnixTimestamp(
                     guild.members.me.joinedTimestamp,
                  )}> | <t:${client.utils.general.toUnixTimestamp(guild.members.me.joinedTimestamp)}:R>`,
                  false,
               )
               .addField(
                  `${client.allemojis.person} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.members.name`)}`,
                  [
                     `>>> 💯 **${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.members.totals`)}** \`${guild.memberCount}\``,
                     `${client.allemojis.niby} **${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.members.cached`)}** \`${guild.members.cache.size}\``,
                     `${client.allemojis.role} **${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.members.admins`)}** \`${
                        guild.members.cache.filter((m) => m.permissions.has(PermissionFlagsBits.Administrator)).size
                     }\``,
                     `${client.allemojis.bot} **Bots:** \`${guild.members.cache.filter((m) => m.user.bot).size}\``,
                     `${client.allemojis.online} **${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.members.online`)}** \`${
                        guild.members.cache.filter((m) => m.presence && m.presence.status != 'offline').size
                     }\``,
                     `${client.allemojis.dnd} **${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.members.dnd`)}** \`${
                        guild.members.cache.filter((m) => m.presence && m.presence.status == 'dnd').size
                     }\``,
                     `${client.allemojis.idle} **${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.members.idle`)}** \`${
                        guild.members.cache.filter((m) => m.presence && m.presence.status == 'idle').size
                     }\``,
                     `${client.allemojis.offline} **${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.members.offline`)}** \`${
                        guild.members.cache.filter((member) => !member.presence || (member.presence && member.presence.status == 'offline'))
                           .size
                     }\``,
                  ].join('\n'),
                  true,
               )
               .addField(`\u200b`, `\u200b`, true)
               .addField(
                  `${client.allemojis.channel} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.channels.name`)}`,
                  [
                     `>>> 💯 ** ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.channels.totals`)}** \`${guild.channels.cache.size}\``,
                     `${client.allemojis.chat} **${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.channels.text`)}** \`${guild.channels.cache.filter((c) => c.type == ChannelType.GuildText).size}\``,
                     `${client.allemojis.nsfw} **NSFW:** \`${guild.channels.cache.filter((c) => c.nsfw).size}\``,
                     `${client.allemojis.thread} **${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.channels.threads`)}** \`${
                        guild.channels.cache.filter((c) => c.type == ChannelType.PublicThread).size
                     }\``,
                     `${client.allemojis.volume} **${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.channels.voice`)}** \`${guild.channels.cache.filter((c) => c.type == ChannelType.GuildVoice).size}\``,
                     `📢 **${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.channels.announcements`)}** ${guild.publicUpdatesChannelId ? `<#${guild.publicUpdatesChannelId}>` : `\`❌\``}`,
                     `📘 **${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.channels.rules`)}** ${guild.rulesChannelId ? `<#${guild.rulesChannelId}>` : `\`❌\``}`,
                     `💤 **AFK:** ${guild.afkChannelId ? `<#${guild.afkChannelId}>` : `\`❌\``}`,
                  ].join('\n'),
                  true,
               )
               .addField(`${client.allemojis.discord} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.events`)}`, `>>> \`${guild.scheduledEvents.cache.size}\``, true)
               .addField(`${client.allemojis.role} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.roles`)}`, `>>> \`${guild.roles.cache.filter((r) => r.id !== guild.id).size}\``, true)
               .addField(`${client.allemojis.builder} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.bans`)}`, `>>> \`${guild.bans.cache.size}\``, true)

               .addField(`${client.allemojis.boost} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.level`)}`, `>>> \`${guild.premiumTier}\``, true)
               .addField(`${client.allemojis.boost} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.boosts`)}`, `>>> \`${guild.premiumSubscriptionCount}\``, true)
               .addField(`${client.allemojis.link} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.invites`)}`, `>>> \`${guild.invites.cache.size}\``, true)

               .addField(`🍋 Emojis`, `>>> \`${guild.emojis.cache.size}\``, true)
               .addField(`💠 ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.stickers`)}`, `>>> \`${guild.stickers.cache.size}\``, true)
               .addField(
                  `${LocaleEmojis[guildLanguage]} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.language`)}`,
                  `>>> \`${client.translate(guildData.language, `LANGUAGES.${guildLanguage}`)}\``,
                  true,
               )

               .setThumbnail(guild.iconURL()),
         ],
         components,
      });
   },
} as Command;
