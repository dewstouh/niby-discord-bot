import { GuildMember } from 'discord.js';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import Client from '../../structures/Client';
import { Command } from '../../structures/Command';
export default {
   PERMISSIONS: ['ModerateMembers'],
   BOT_PERMISSIONS: ['ModerateMembers'],
   OPTIONS: [
      {
         USER: {
            REQUIRED: true,
         },
      },
   ],
   ALIASES: ['fixname', 'namefix', 'normalize', 'sanitize'],
   USAGE: '<Miembro> <Razón?>',
   async execute(client: Client, message, args, prefix, guildData) {
      if (!args[0])
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `COMMON.TEXTS.noMember.noargs.name`),
                  client.translate(guildData.language, `COMMON.TEXTS.noMember.noargs.value`),
               ),
            ],
         });
      const member = (await client.utils.general.getMember(message, args[0])) as GuildMember;
      if (!member)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `COMMON.TEXTS.noMember.notfound.name`),
                  client.translate(guildData.language, `COMMON.TEXTS.noMember.notfound.value`),
               ),
            ],
         });

      if (!client.utils.general.canModerate(message, member, guildData.language)) return;

      const reason = (args.slice(1).join(" ")?.trim() || client.translate(guildData.language, `COMMON.TEXTS.noReason`)) + ` (- ${message.author.username})`;

      const fixedName = member.displayName.normalize('NFKD');

      member
         .setNickname(fixedName, reason)
         .then(() => {
            return message.reply({
               embeds: [
                  new Embed()
                     .setAuthor({
                        name: client.translate(guildData.language, `${this.LANG_KEY}.success.author`, { name: member.displayName }),
                        iconURL: member.user.displayAvatarURL(),
                     })
                     .addField(
                        client.translate(guildData.language, `${this.LANG_KEY}.success.name`, { name: member.displayName }),
                        client.translate(guildData.language, `${this.LANG_KEY}.success.value`, {
                           name: member.displayName,
                           moderator: message.author.username,
                           moderatorMention: message.author.toString(),
                           reason,
                        }),
                     )
                     .setFooter({ text: `Id: ${member.user.id}` }),
               ],
            });
         })
         .catch(() => {
            return message.reply({
               embeds: [
                  new ErrorEmbed().addField(
                     client.translate(guildData.language, `${this.LANG_KEY}.error.name`),
                     client.translate(guildData.language, `${this.LANG_KEY}.error.value`),
                  ),
               ],
            });
         });
   },
} as Command;
