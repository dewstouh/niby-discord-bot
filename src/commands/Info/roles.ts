import { Command } from '../../structures/Command';
import { Embed } from '../../extenders/discord/Embed';
import Client from '../../structures/Client';

export default {
   ALIASES: ['userroles', 'uroles', 'memberroles', 'mroles'],
   OPTIONS: [
      {
         USER: {
            REQUIRED: false,
         },
      },
   ],
   USAGE: "<Usuario?>",
   async execute(client: Client, message, args, prefix, guildData) {
      const member = (await client.utils.general.getMember(message, args[0])) || message.guild;

      const memberRoles = (() => {
         const sliceAmount = 100;
         const memberRoles = member.roles.cache
            .filter((r) => r.id !== message.guild.id)
            .sort((a, b) => b.rawPosition - a.rawPosition)
            .map((r) => `<@&${r.id}>`);
         if (memberRoles.length < 1) return [client.translate(guildData.language, `${this.LANG_KEY}.embed.field.noRoles`)];
         if (memberRoles.length <= sliceAmount) return memberRoles;
         const slicedRoles = memberRoles.slice(0, sliceAmount);
         slicedRoles.push(`\n${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.andMore`, {amount: memberRoles.length - sliceAmount})}`);
         return slicedRoles;
      })();

      message.reply({
         embeds: [
            new Embed()
               .setAuthor({
                  name: `${member.roles.cache.size} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.author`, {name: member.displayName || member.name})}`,
                  iconURL: `${member.user ? member.user.displayAvatarURL() : member.iconURL()}`,
               })
               .setDescription(`>>> ${memberRoles.join(', ')}`)
               .setFooter({ text: client.translate(guildData.language, `${this.LANG_KEY}.embed.footer`) }),
         ],
      });
   },
} as Command;
