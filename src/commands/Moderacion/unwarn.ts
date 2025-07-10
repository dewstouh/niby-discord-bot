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
      {
         STRING: {
            REQUIRED: true,
         },
      },
   ],
   USAGE: '<Miembro> <IdWarn>',
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

      const warnId = args[1];
      if (!warnId)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.noId.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.noId.value`, {
                     prefix, cmdName: this.NAME
                  }),
               ),
            ],
         });

      if(!client.utils.general.canModerate(message, member, guildData.language)) return;

      const memberData = await client.db.getUserData(member.id);

      const warnData = memberData.punishments.filter((p) => p.type === 'Warn' && p.guildId === message.guild.id);

      if (!warnData.length)
         return message.reply({
            embeds: [new Embed()
               .setDescription(client.translate(guildData.language, `${this.LANG_KEY}.nowarns`, {memberMention: member.user.toString()}))],
         });

      if (!warnData[warnId - 1])
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.notFound.name`, {warnId, name: member.displayName}),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.notFound.value`, {prefix, cmdName: this.NAME, memberId: member.id}),
               ),
            ],
         });

      const noWarnPunishments = memberData.punishments.filter((p) => p.type !== 'Warn' && p.guildId == message.guild.id);

      warnData.splice(warnId - 1, 1);

      memberData.punishments = [...noWarnPunishments, ...warnData];

      memberData
         .save()
         .then(() => {
            return message.reply({
               embeds: [
                  new Embed()
                     .setAuthor({ name: client.translate(guildData.language, `${this.LANG_KEY}.success.author`, {warnId, name: member.displayName}), iconURL: member.user.displayAvatarURL() })
                     .addField(
                        client.translate(guildData.language, `${this.LANG_KEY}.success.name`, {warnId, name: member.displayName}),
                        client.translate(guildData.language, `${this.LANG_KEY}.success.value`, {warnId})
                        )
                     .setFooter({ text: `Id: ${member.user.id} | ${client.translate(guildData.language, `${this.LANG_KEY}.success.footer`)}: ${warnId}` }),
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
