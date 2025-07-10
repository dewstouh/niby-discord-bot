import { GuildMember } from 'discord.js';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import Client from '../../structures/Client';
import { Command } from '../../structures/Command';
export default {
   PERMISSIONS: ['KickMembers'],
   BOT_PERMISSIONS: ['KickMembers'],
   OPTIONS: [
		{
			USER: {
				REQUIRED: true,
			},
		},
      {
			STRING: {
				REQUIRED: false,
			},
		},
	],
   USAGE: "<Miembro> <Razón>",
   async execute(client: Client, message, args, prefix, guildData) {
      if(!args[0]) return message.reply({
         embeds: [
            new ErrorEmbed()
            .addField(
               client.translate(guildData.language, `COMMON.TEXTS.noMember.noargs.name`),
               client.translate(guildData.language, `COMMON.TEXTS.noMember.noargs.value`),
            )
         ]
      });

      const member = (await client.utils.general.getMember(message, args[0])) as GuildMember;
      if(!member) return message.reply({
         embeds: [
            new ErrorEmbed()
            .addField(
               client.translate(guildData.language, `COMMON.TEXTS.noMember.notfound.name`),
               client.translate(guildData.language, `COMMON.TEXTS.noMember.notfound.value`),
            )
         ]
      });


      if(!client.utils.general.canModerate(message, member, guildData.language)) return;

      const reason = (args.slice(1).join(" ")?.trim() || client.translate(guildData.language, `COMMON.TEXTS.noReason`)) + ` (- ${message.author.username})`;

      member.kick(reason)
      .then(() => {

         member.send({
            embeds: [
               new Embed()
               .setAuthor({name: message.guild.name, iconURL: message.guild.iconURL()})
               .addField(
                  client.translate(guildData.language, `COMMON.TEXTS.noMember.notfound.name`),
                  client.translate(guildData.language, `COMMON.TEXTS.noMember.notfound.value`),
                  )
                  .setFooter({text: `Id: ${member.user.id}`})
               ]
         }).catch(() => {})

         return message.reply({
            embeds: [
               new Embed()
               .setAuthor({name: client.translate(guildData.language, `${this.LANG_KEY}.success.authorName`), iconURL: member.user.displayAvatarURL()})
               .addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.success.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.success.value`),
               )
               .setFooter({text: `Id: ${member.user.id}`})
            ]
         });
      })
      .catch(() => {
         return message.reply({
            embeds: [
               new ErrorEmbed()
               .addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.value`),
               )
            ]
         });
      })

   },
} as Command;
