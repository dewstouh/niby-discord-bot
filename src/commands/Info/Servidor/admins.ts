import { Command } from '../../../structures/Command';
import { Embed } from '../../../extenders/discord/Embed';
import Client from '../../../structures/Client';
import { PermissionFlagsBits } from 'discord.js';

export default {
   ALIASES: ['administrators', 'adminlist', 'administratorlist', 'guildadmins', 'sadmins', "serveradmins", "gadmins"],
   GUILD_ONLY: true,
   execute(client:Client, message, args, prefix, guildData) {
      const {guild} = message;

      const adminUsers = (() => {
         const sliceAmount = 25;
         const admins = guild.members.cache.filter(m => m?.permissions.has(PermissionFlagsBits.Administrator) && !m?.user?.bot).map(m => `${m}`);
         if (admins.length < 1) return [client.translate(guildData.language, `${this.LANG_KEY}.noAdmins`)];
         if (admins.length <= sliceAmount) return admins;
         const slicedRoles = admins.slice(0, sliceAmount);
         slicedRoles.push(`\n${client.translate(guildData.language, `${this.LANG_KEY}.andMore`, {amount: admins.length - sliceAmount})}`);
         return slicedRoles;
      })();

      const adminBots = (() => {
         const sliceAmount = 25;
         const admins = guild.members.cache.filter(m => m?.permissions.has(PermissionFlagsBits.Administrator) && m?.user?.bot).map(m => `${m}`);
         if (admins.length < 1) return [client.translate(guildData.language, `${this.LANG_KEY}.noAdmins`)];
         if (admins.length <= sliceAmount) return admins;
         const slicedRoles = admins.slice(0, sliceAmount);
         slicedRoles.push(`\n${client.translate(guildData.language, `${this.LANG_KEY}.andMore`, {amount: admins.length - sliceAmount})}`);
         return slicedRoles;
      })();

      
      const embed = new Embed()
      .addField(client.translate(guildData.language, `${this.LANG_KEY}.embed.field.owner`, {ownerId: message.guild.ownerId}), `>>> <@${message.guild.ownerId}>`)
      .addField(client.translate(guildData.language, `${this.LANG_KEY}.embed.field.userAdmins`), `>>> ${adminUsers.join("\n")}`)
      .addField(client.translate(guildData.language, `${this.LANG_KEY}.embed.field.botAdmins`), `>>> ${adminBots.join("\n")}`)
      .setFooter({text: client.translate(guildData.language, `${this.LANG_KEY}.embed.footer.onlyCached`)})

      return message.reply({
         embeds: [embed]
      })
   },
} as Command;
