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
   USAGE: '<Miembro>',
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

      if(!client.utils.general.canModerate(message, member, guildData.language)) return;

      const memberData = await client.db.getUserData(member.id);

      const warnData = memberData.punishments.filter((p) => p.type === 'Warn' && p.guildId === message.guild.id);

      if (!warnData.length)
         return message.reply({
            embeds: [new Embed().setDescription(client.translate(guildData.language, `${this.LANG_KEY}.nowarns`, {mention: member.user.toString()}))],
         });

      const noWarnPunishments = memberData.punishments.filter((p) => p.type !== 'Warn' && p.guildId == message.guild.id);

      memberData.punishments = [...noWarnPunishments];

      memberData
         .save()
         .then(() => {
            return message.reply({
               embeds: [
                  new Embed()
                     .setAuthor({ name: client.translate(guildData.language, `${this.LANG_KEY}.success.author`, {name: member.displayName}), iconURL: member.user.displayAvatarURL() })
                     .addField(
                        client.translate(guildData.language, `${this.LANG_KEY}.success.name`, {name: member.displayName}),
                        client.translate(guildData.language, `${this.LANG_KEY}.success.value`, {name: member.displayName}),
                     )
                     .setFooter({ text: `Id: ${member.user.id} | ${client.translate(guildData.language, `${this.LANG_KEY}.footer.allRemoved`)}` }),
               ],
            });
         })
         .catch((e) => {
            console.error(e);
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
