import { TextChannel } from 'discord.js';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import Client from '../../structures/Client';
import { Command } from '../../structures/Command';
export default {
   PERMISSIONS: ['ManageChannels'],
   BOT_PERMISSIONS: ['ManageChannels'],
   OPTIONS: [
      {
         CHANNEL: {
            TYPES: ['GuildText'],
            REQUIRED: false,
         },
      },
      {
         USER: {
            REQUIRED: false,
         },
      },
      {
         ROLE: {
            REQUIRED: false,
         },
      },
   ],
   USAGE: '<Canal?> <Usuario?> <Rol?>',
   async execute(client: Client, message, args, prefix, guildData) {
      const channel = ((await client.utils.general.getChannel(message, args[0])) || message.channel) as TextChannel;

      if (channel.isThread())
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.noThreads.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.noThreads.value`),
               ),
            ],
         });

      const roles =
      !message.token && message.mentions.roles.size > 0
            ? message.mentions.roles.map((r) => r.id)
            : args.length > 0
            ? args.map((arg) => message.guild.roles.cache.get(arg)).filter(Boolean)
            : null;
      const users =
      !message.token && message.mentions.users.size > 0
            ? message.mentions.users.map((r) => r.id)
            : args.length > 0
            ? args.map((arg) => message.guild.members.cache.get(arg)).filter(Boolean)
            : null;

      const unlockUsersAndRoles = async () => {
         if (users && users.length > 0) {
            for (const user of users) {
               await channel.permissionOverwrites
                  .edit(user, {
                     SendMessages: null,
                     AddReactions: null,
                  })
                  .catch(() => {});
            }
         }
         if (roles && roles.length > 0) {
            for (const role of roles) {
               await channel.permissionOverwrites
                  .edit(role, {
                     SendMessages: null,
                     AddReactions: null,
                  })
                  .catch(() => {});
            }
         }
         return message.reply({
            embeds: [
               new Embed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.success.name`, {channel: channel.toString()}),
                  client.translate(guildData.language, `${this.LANG_KEY}.success.value`, {rolesAmount: roles.length, usersAmount: users.length}),
               ),
            ],
         });
      };

      const unlockForEveyone = async () => {
         if (channel.permissionsFor(message.guild.id).has('SendMessages'))
            return message.reply({
               embeds: [
                  new ErrorEmbed().addField(
                     client.translate(guildData.language, `${this.LANG_KEY}.alreadyUnlocked.name`, {channel: channel.toString()}),
                  client.translate(guildData.language, `${this.LANG_KEY}.alreadyUnlocked.value`, {channel: channel.toString(), prefix}),
                  ),
               ],
            });

         await channel.permissionOverwrites.edit(message.guild.id, {
            SendMessages: null,
            AddReactions: null,
         });

         return message.reply({
            embeds: [new Embed().setDescription(client.translate(guildData.language, `${this.LANG_KEY}.success.description`, {channel: channel.toString()}),)],
         });
      };

      if ((users && users.length > 0) || (roles && roles.length > 0)) return unlockUsersAndRoles();
      return unlockForEveyone();
   },
} as Command;
