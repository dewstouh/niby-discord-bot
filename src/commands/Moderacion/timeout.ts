import { GuildMember } from 'discord.js';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import Client from '../../structures/Client';
import ms from 'ms';
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
      {
         STRING: {
            REQUIRED: false,
         },
      },
   ],
   ALIASES: ["mute"],
   USAGE: '<Miembro> <Tiempo> <Razón?>',
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
      const member = await client.utils.general.getMember(message, args[0]) as GuildMember;
      if (!member)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `COMMON.TEXTS.noMember.notfound.name`),
                  client.translate(guildData.language, `COMMON.TEXTS.noMember.notfound.value`),
               ),
            ],
         });

      if(member.isCommunicationDisabled()) return message.reply({
         embeds: [
            new ErrorEmbed().addField(
               client.translate(guildData.language, `${this.LANG_KEY}.alreadyMuted.name`),
               client.translate(guildData.language, `${this.LANG_KEY}.alreadyMuted.value`, {timeout: `<t:${client.utils.general.toUnixTimestamp(member.communicationDisabledUntilTimestamp)}:R>`}),
            ),
         ],
      });

      if(!client.utils.general.canModerate(message, member, guildData.language)) return;


      const time = args[1];
      if(!time) return message.reply({
         embeds: [
            new ErrorEmbed().addField(
               client.translate(guildData.language, `${this.LANG_KEY}.error.notimeout.name`),
               client.translate(guildData.language, `${this.LANG_KEY}.error.notimeout.value`),
            ),
         ],
      });

      const msTime = parseInt(ms(args[1]));
      if(!msTime) return message.reply({
         embeds: [
            new ErrorEmbed().addField(
               client.translate(guildData.language, `${this.LANG_KEY}.error.invalidTimeout.name`),
               client.translate(guildData.language, `${this.LANG_KEY}.error.invalidTimeout.value`),
            ),
         ],
      });

      if(msTime < 30 * 1000) return message.reply({
         embeds: [
            new ErrorEmbed().addField(
               client.translate(guildData.language, `${this.LANG_KEY}.error.tooLowTimeout.name`),
               client.translate(guildData.language, `${this.LANG_KEY}.error.tooLowTimeout.value`),
            ),
         ],
      });

      if(msTime > 27 * 24 * 60 * 60 * 1000) return message.reply({
         embeds: [
            new ErrorEmbed().addField(
               client.translate(guildData.language, `${this.LANG_KEY}.error.tooHighTimeout.name`),
               client.translate(guildData.language, `${this.LANG_KEY}.error.tooHighTimeout.value`),
            ),
         ],
      });

      const mappedTime = client.utils.general.duration(msTime, guildData.language).map(d => `\`${d}\``).join(", ")
      const unmutedTimeUnix = `<t:${client.utils.general.toUnixTimestamp(Date.now() + msTime)}:R>`;

      const reason = (args.slice(2).join(" ")?.trim() || client.translate(guildData.language, `COMMON.TEXTS.noReason`)) + ` (- ${message.author.username})`;

      member.timeout(msTime, reason)
      .then(() => {

         member.send({
            embeds: [
               new Embed()
               .setAuthor({name: message.guild.name, iconURL: message.guild.iconURL()})
               .addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.dm.success.name`, {name: message.guild.name}),
                  client.translate(guildData.language, `${this.LANG_KEY}.dm.success.value`, {reason, moderator: message.member.displayName, moderatorMention: message.author.toString(), unmutedTimeUnix, duration: mappedTime}),
                  )
                  .setFooter({text: `Id: ${member.user.id}`})
            ]
         }).catch(() => {})

         return message.reply({
            embeds: [
               new Embed()
               .setAuthor({name: client.translate(guildData.language, `${this.LANG_KEY}.author`, {name: member.displayName}), iconURL: member.user.displayAvatarURL()})
               .addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.success.name`, {name: message.guild.name}),
                  client.translate(guildData.language, `${this.LANG_KEY}.success.value`, {reason, moderator: message.member.displayName, moderatorMention: message.author.toString(), unmutedTimeUnix, duration: mappedTime}),
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
