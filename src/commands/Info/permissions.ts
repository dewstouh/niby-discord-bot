import { Command } from '../../structures/Command';
import { Embed } from '../../extenders/discord/Embed';
import { GuildMember } from 'discord.js';
import Client from '../../structures/Client';

export default {
   ALIASES: ['perms'],
   OPTIONS: [
      {
         STRING: {
            REQUIRED: true,
         },
      },
   ],
   USAGE: "<Usuario | Rol>",
   async execute(client: Client, message, args, prefix, guildData) {
      const resolvable =
         (await client.utils.general.getMember(message, args[0])) ||
         (await client.utils.general.getRole(message, args[0])) ||
         (message.member as GuildMember);

      const permissions =
         resolvable.id == message.guild.ownerId
            ? `\`${client.translate(guildData.language, `PERMISSIONS.Owner`)}\``
            : resolvable.permissions.toArray().includes('Administrator')
            ? `\`${client.translate(guildData.language, `PERMISSIONS.Administrator`)}\``
            : `${resolvable.permissions
                 .toArray()
                 .sort((a, b) => a.localeCompare(b))
                 .map((p) => `\`${client.translate(guildData.language, `PERMISSIONS.${p}`)}\``)
                 .join(', ')}`;

      return message.reply({
         embeds: [
            new Embed()
               .setAuthor({
                  name: client.translate(guildData.language, `${this.LANG_KEY}.author`, {name: `${resolvable.user ? '' : '@'}${resolvable.user ? resolvable.displayName : resolvable.name}`}),
                  iconURL: resolvable.user ? `${resolvable.user.displayAvatarURL()}` : undefined,
               })
               .setDescription(`>>> **${permissions}**\n${resolvable}`),
         ],
      });
   },
} as Command;
