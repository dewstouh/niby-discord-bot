import { Command } from '../../../structures/Command';
import { Embed } from '../../../extenders/discord/Embed';
import Client from '../../../structures/Client';
import { PermissionFlagsBits } from 'discord.js';

export default {
   ALIASES: ['membercount', 'guildmembers'],
   GUILD_ONLY: true,
   execute(client:Client, message, args, prefix, guildData) {
      const {guild} = message;

      const embed = new Embed()
      .setAuthor({name: `[${guild.memberCount}] Miembros de ${guild.name}`, iconURL: guild.iconURL()})
      .setDescription([
         client.translate(guildData.language, `${this.LANG_KEY}.embed.description.totalMemberCount`, {memberCount: guild.memberCount}),
         client.translate(guildData.language, `${this.LANG_KEY}.embed.description.members`, {memberCount: guild.members.cache.filter(m => !m.user.bot).size, percentage: ((guild.members.cache.filter(m => !m.user.bot).size / guild.members.cache.size) * 100).toFixed(2)}),
         client.translate(guildData.language, `${this.LANG_KEY}.embed.description.bots`, {memberCount: guild.members.cache.filter(m => m.user.bot).size, percentage: ((guild.members.cache.filter(m => m.user.bot).size / guild.members.cache.size) * 100).toFixed(2)}),
         client.translate(guildData.language, `${this.LANG_KEY}.embed.description.cached`, {memberCount: guild.members.cache.size, percentage: ((guild.members.cache.size / guild.memberCount) * 100).toFixed(2)}),
      ].join("\n"))
      .addField(
         client.translate(guildData.language, `${this.LANG_KEY}.embed.field.members.name`),
         [
         client.translate(guildData.language, `${this.LANG_KEY}.embed.field.members.value.cached`, {memberCount: guild.members.cache.filter(m => !m.user.bot).size}),
         client.translate(guildData.language, `${this.LANG_KEY}.embed.field.members.value.admins`, {memberCount: guild.members.cache.filter((m) => !m.user.bot && m.permissions.has(PermissionFlagsBits.Administrator)).size}),
         client.translate(guildData.language, `${this.LANG_KEY}.embed.field.members.value.online`, {memberCount: guild.members.cache.filter((m) => !m.user.bot && m.presence && m.presence.status != 'offline').size}),
         client.translate(guildData.language, `${this.LANG_KEY}.embed.field.members.value.dnd`, {memberCount: guild.members.cache.filter((m) => !m.user.bot && m.presence && m.presence.status == 'dnd').size}),
         client.translate(guildData.language, `${this.LANG_KEY}.embed.field.members.value.idle`, {memberCount: guild.members.cache.filter((m) => !m.user.bot && m.presence && m.presence.status == 'idle').size}),
         client.translate(guildData.language, `${this.LANG_KEY}.embed.field.members.value.offline`, {memberCount: guild.members.cache.filter((m) => !m.user.bot && (!m.presence || (m.presence && m.presence.status == 'offline'))).size}),
         ].join('\n'),
         true,
      )
      .addField(
         client.translate(guildData.language, `${this.LANG_KEY}.embed.field.bots.name`),
         [
         client.translate(guildData.language, `${this.LANG_KEY}.embed.field.bots.value.cached`, {memberCount: guild.members.cache.filter(m => m.user.bot).size}),
         client.translate(guildData.language, `${this.LANG_KEY}.embed.field.bots.value.admins`, {memberCount: guild.members.cache.filter((m) => m.user.bot && m.permissions.has(PermissionFlagsBits.Administrator)).size}),
         client.translate(guildData.language, `${this.LANG_KEY}.embed.field.bots.value.online`, {memberCount: guild.members.cache.filter((m) => m.user.bot && m.presence && m.presence.status != 'offline').size}),
         client.translate(guildData.language, `${this.LANG_KEY}.embed.field.bots.value.dnd`, {memberCount: guild.members.cache.filter((m) => m.user.bot && m.presence && m.presence.status == 'dnd').size}),
         client.translate(guildData.language, `${this.LANG_KEY}.embed.field.bots.value.idle`, {memberCount: guild.members.cache.filter((m) => m.user.bot && m.presence && m.presence.status == 'idle').size}),
         client.translate(guildData.language, `${this.LANG_KEY}.embed.field.bots.value.offline`, {memberCount: guild.members.cache.filter((m) => m.user.bot && (!m.presence || (m.presence && m.presence.status == 'offline'))).size}),
         ].join('\n'),
         true,
      )
      .setFooter({text: client.translate(guildData.language, `${this.LANG_KEY}.embed.footer.onlyCached`)})

      return message.reply({
         embeds: [embed]
      })
   },
} as Command;
