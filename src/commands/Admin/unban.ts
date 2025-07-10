import { GuildBan, GuildMember } from 'discord.js';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import Client from '../../structures/Client';
import { Command } from '../../structures/Command';
export default {
   PERMISSIONS: ['BanMembers'],
   BOT_PERMISSIONS: ['BanMembers'],
   OPTIONS: [
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
   USAGE: '<Miembro> <Razon?>',
   ALIASES: ['idunban'],
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
      const member = ((await client.utils.general.getMember(message, args[0])) as GuildMember) || args[0];

      if (!member)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `COMMON.TEXTS.noMember.notfound.name`),
                  client.translate(guildData.language, `COMMON.TEXTS.noMember.notfound.value`),
               ),
            ],
         });

      const ban = (await message.guild!.bans.fetch(member.id || member).catch(() => null)) as GuildBan;

      if (!ban)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.notbanned.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.notbanned.value`),
               ),
            ],
         });

         const reason = (args.slice(1).join(" ")?.trim() || client.translate(guildData.language, `COMMON.TEXTS.noReason`)) + ` (- ${message.author.username})`;

      message.guild.bans
         .remove(member.id || member, reason)
         .then(() => {
            return message.reply({
               embeds: [
                  new Embed()
                     .addField(
                        client.translate(guildData.language, `${this.LANG_KEY}.success.name`),
                        client.translate(guildData.language, `${this.LANG_KEY}.success.value`),
                     )
                     .setFooter({ text: `Id: ${ban.user.id}`, iconURL: ban.user.displayAvatarURL() }),
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
