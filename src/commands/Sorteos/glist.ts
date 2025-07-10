import { ErrorEmbed } from '../../extenders/discord/Embed';
import GiveawaySchema from '../../database/schemas/GiveawaySchema';
import { Command } from '../../structures/Command';
export default {
   async execute(client, interaction, args, prefix, guildData) {
      const giveawayDatas = await GiveawaySchema.find({ guildId: interaction.guild.id, ended: false });
      if (!giveawayDatas || !giveawayDatas.length)
         return interaction.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.embed.name`, { noEmoji: client.allemojis.no }),
                  client.translate(guildData.language, `${this.LANG_KEY}.embed.value`, { prefix }),
               ),
               // .addField(`${client.allemojis.no} No hay sorteos activos en este servidor.`, `> Usa \`${prefix}start\` para crear un nuevo sorteo.`)
            ],
            ephemeral: true,
         });
      const texto = giveawayDatas.map((gData) =>
         client.translate(guildData.language, `${this.LANG_KEY}.giveawayMap`, {
            prize: gData.prize.substring(0, 25),
            embedFooter: gData.messages.embedFooter,
            hostedBy: gData.hostedBy,
            authorTag: interaction.guild.members.cache.get(gData.hostedBy.replace('<@', '').replace('>', '')).user.tag,
            endsAt:
               gData.endAt == Infinity
                  ? client.translate(guildData.language, `COMMANDS.SORTEOS.gstart.execute.giveawaysManager.pauseOptions.infiniteDurationText`)
                  : `<t:${Math.round(gData.endAt / 1000)}:R>`,
            giveawayEmoji: guildData.giveaway.emoji,
            giveawayUrl: `https://discord.com/channels/${gData.guildId}/${gData.channelId}/${gData.messageId}`,
         }) + `\n> **ID:**\n> \`\`\`${gData.messageId}\`\`\``,
      );
      client.utils.message.pagination(
         interaction,
         guildData.language,
         texto,
         client.translate(guildData.language, `${this.LANG_KEY}.pagination`, {
            giveawayEmoji: guildData.giveaway.emoji,
            giveawayLength: giveawayDatas.length,
         }),
         1,
      );
   },
} as Command;

/*
╔═════════════════════════════════════════════════════╗
║    || - || Desarrollado por dewstouh#1088 || - ||   ║
║    ----------| discord.gg/MBPsvcphGf |----------    ║
╚═════════════════════════════════════════════════════╝
*/
