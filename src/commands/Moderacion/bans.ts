import { GuildBan } from 'discord.js';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import Client from '../../structures/Client';
import { Command } from '../../structures/Command';
export default {
   PERMISSIONS: ['ViewAuditLog'],
   BOT_PERMISSIONS: ['ViewAuditLog'],
   async execute(client: Client, message, args, prefix, guildData) {

      const tempMsg = await message.reply({
         embeds: [
            new Embed()
            .addField(client.translate(guildData.language, `${this.LANG_KEY}.loadingBans.name`), client.translate(guildData.language, `${this.LANG_KEY}.loadingBans.value`))
         ]
      })

      const bans = (await message.guild!.bans.fetch().catch(() => null)) as GuildBan[];

      if (!bans)
         return client.utils.message.edit(message, tempMsg, {
            embeds: [new ErrorEmbed().setDescription(client.translate(guildData.language, `${this.LANG_KEY}.noBans`))],
         });

      const embeds = bans.map((ban) => {
         return new Embed()
         .setAuthor({ name: client.translate(guildData.language, `COMMANDS.MODERACION.baninfo.execute.embed.author`, {name: ban.user.displayName}), iconURL: ban.user.displayAvatarURL() })
         .addField(`${client.translate(guildData.language, `COMMANDS.MODERACION.baninfo.execute.embed.field.username`)}`, `>>> \`\`\`${ban.user.username}\`\`\``, true)
         .addField(`${client.translate(guildData.language, `COMMANDS.MODERACION.baninfo.execute.embed.field.userid`)}`, `>>> \`\`\`${ban.user.id}\`\`\``, true)
         .addField(`${client.translate(guildData.language, `COMMANDS.MODERACION.baninfo.execute.embed.field.bot`)}`, `>>> \`\`\`${ban.user.bot ? "✅" : "❌"}\`\`\``, true)
         .addField(
            `${client.translate(guildData.language, `COMMANDS.MODERACION.baninfo.execute.embed.field.banReason`)}`,
            `>>> \`\`\`${ban.reason || client.translate(guildData.language, `COMMON.TEXTS.noReason`)}\`\`\``,
            true,
         )
         .setFooter({text: `Id: ${ban.user.id}`})
      })

      return client.utils.message.paginateEmbeds(message, guildData.language, embeds, {messageToEdit: tempMsg});
   },
} as Command;
