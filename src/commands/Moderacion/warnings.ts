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
   ALIASES: ["warns"],
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

      const memberData = await client.db.getUserData(member.id);

      const warnData = memberData.punishments.filter(p => p.type === "Warn" && p.guildId === message.guild.id)

      if(!warnData.length) return message.reply({
         embeds: [
            new Embed()
               .setDescription(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.nowarns`, {memberMention: member.user.toString()})
            )],
      })

      const warnText = warnData.map((p, i) => {
         return `>>> ${client.allemojis.info} **Id:** \`${i+1}\`\n${client.allemojis.clock} **${client.translate(guildData.language, `${this.LANG_KEY}.warnText.date`)}:** <t:${client.utils.general.toUnixTimestamp(p.createdTimestamp)}> | <t:${client.utils.general.toUnixTimestamp(p.createdTimestamp)}:R>\n${client.allemojis.person} **${client.translate(guildData.language, `${this.LANG_KEY}.warnText.moderator`)}:** <@${p.authorId}>\n${client.allemojis.question} **${client.translate(guildData.language, `${this.LANG_KEY}.warnText.reason`)}:** *${p.reason}*`
      })

      await client.utils.message.pagination(message, guildData.language, warnText, `[\`${warnData.length}\`] ${client.translate(guildData.language, `${this.LANG_KEY}.pagination.title`, {name: member.displayName})}`, 1)

   },
} as Command;
