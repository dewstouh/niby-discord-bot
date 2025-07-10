import { Command } from '../../structures/Command';
import { GuildMember } from 'discord.js';
import { Embed } from '../../extenders/discord/Embed';
import Client from '../../structures/Client';

export default {
   OPTIONS: [
      {
         STRING: {
            REQUIRED: true,
         },
      },
   ],
   USAGE: "<Usuario | Canal | Rol>",
   async execute(client: Client, message, args, prefix, guildData) {
      const resolvable =
         (await client.utils.general.getMember(message, args[0])) ||
         (await client.utils.general.getRole(message, args[0])) ||
         (await client.utils.general.getChannel(message, args[0])) ||
         (message.member as GuildMember);

      message.reply({
         embeds: [
            new Embed()
               .setAuthor({
                  name: client.translate(guildData.language, `${this.LANG_KEY}.embed.author`, {name: `${'topic' in resolvable ? '#' : resolvable.user ? '' : '@'}${resolvable.user ? resolvable.displayName : resolvable.name}`}),
                  iconURL: resolvable.user ? `${resolvable.user.displayAvatarURL()}` : undefined,
               })
               .setDescription(`>>> **\`${resolvable.id}\`**\n${resolvable}`),
         ],
      });
   },
} as Command;
