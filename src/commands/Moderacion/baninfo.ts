import { GuildBan, GuildMember } from 'discord.js';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import Client from '../../structures/Client';
import { Command } from '../../structures/Command';
export default {
   PERMISSIONS: ['ViewAuditLog'],
   BOT_PERMISSIONS: ['ViewAuditLog'],
   OPTIONS: [
      {
         STRING: {
            REQUIRED: true,
         },
      },
   ],
   USAGE: '<Miembro>',
   ALIASES: ['infoban'],
   async execute(client: Client, message, args, prefix, guildData) {
      if (!args[0])
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `COMMON.TEXTS.noMember.noargs.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.norags.value`, {
                     prefix, cmdName: this.NAME, cmdUsage: this.USAGE
                  }),
               ),
            ],
         });
      const member = ((await client.utils.general.getMember(message, args[0])) as GuildMember) || args[0];

      if (!member)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `COMMON.TEXTS.noMember.notfound.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.nomember.value`, {
                     prefix, cmdName: this.NAME, cmdUsage: this.USAGE
                  }),
               ),
            ],
         });

      const ban = (await message.guild!.bans.fetch(member.id || member).catch(() => null)) as GuildBan;

      if (!ban) return message.reply({
            embeds: [new ErrorEmbed().addField(client.translate(guildData.language, `${this.LANG_KEY}.error.notbanned.name`), client.translate(guildData.language, `${this.LANG_KEY}.error.notbanned.value`, {prefix}))],
         });

      return message.reply({
         embeds: [
            new Embed()
               .setAuthor({ name: client.translate(guildData.language, `${this.LANG_KEY}.embed.author`, {name: ban.user.displayName}), iconURL: ban.user.displayAvatarURL() })
               .addField(`${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.username`)}`, `>>> \`\`\`${ban.user.username}\`\`\``, true)
               .addField(`${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.userid`)}`, `>>> \`\`\`${ban.user.id}\`\`\``, true)
               .addField(`${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.bot`)}`, `>>> \`\`\`${ban.user.bot ? "✅" : "❌"}\`\`\``, true)
               .addField(
                  `${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.banReason`)}`,
                  `>>> \`\`\`${ban.reason || client.translate(guildData.language, `COMMON.TEXTS.noReason`)}\`\`\``,
                  true,
               )
               .setFooter({text: `Id: ${ban.user.id}`})
         ],
      });
   },
} as Command;
