import { Embed } from '../../../extenders/discord/Embed';
import { Command } from '../../../structures/Command';
import Client from '../../../structures/Client';

export default {
   ALIASES: ['botmemory', 'ram', 'botram'],
   async execute(client: Client, message, args, prefix: string, guildData) {
      const LOADING_MSG = await message.reply({
         embeds: [
            new Embed().addField(
               client.translate(guildData.language, `COMMANDS.INFO.BOT.stats.execute.loadingEmbed.field1.name`, {
                  emoji: client.allemojis.online,
               }),
               client.translate(guildData.language, `COMMANDS.INFO.BOT.stats.execute.loadingEmbed.field1.value`),
            ),
         ],
         ephemeral: true,
         fetchReply: true,
      });

      const thisStats = await client.utils.general.receiveBotInfo();
      const totalData = (await client.cluster
         .broadcastEval('this.utils.general.receiveBotInfo()', {
            timeout: 10000,
         })
         .catch((e) => console.error(e))) || [thisStats];
      const MAIN_EMBED = new Embed()
         .addField(
            client.translate(guildData.language, `COMMANDS.INFO.BOT.stats.execute.statsEmbed.hardware.name`),
            [
               `>>> \`\`\`yml\n`,
               `${client.translate(guildData.language, `COMMANDS.INFO.BOT.stats.execute.statsEmbed.hardware.memory`)}: ${Math.abs(totalData.reduce((a, b) => a + b.ram.heapUsed, 0).toFixed(2))}mb/${Math.abs(
                  totalData.reduce((a, b) => a + b.ram.rss, 0).toFixed(2),
               )}mb`,
               `${client.translate(guildData.language, `COMMANDS.INFO.BOT.stats.execute.statsEmbed.hardware.memoryFile`)}: ${Math.abs(
                  totalData.reduce((a, b) => a + b.ram.arrayBuffers, 0).toFixed(2),
               )}mb`,
               `${client.translate(guildData.language, `COMMANDS.INFO.BOT.stats.execute.statsEmbed.hardware.memoryTotal`)}: ${Math.abs(totalData.reduce((a, b) => a + b.ram.rss, 0).toFixed(2))}mb`,
               `${client.translate(guildData.language, `COMMANDS.INFO.BOT.stats.execute.statsEmbed.hardware.players`)}: ${Math.abs(totalData.reduce((a, b) => a + b.players, 0))}`,
               `${client.translate(guildData.language, `COMMANDS.INFO.BOT.stats.execute.statsEmbed.hardware.cpuUsage`)}: ${Math.abs(totalData.reduce((a, b) => a + b.CPUUsage, 0).toFixed(2))}%`,
               `\`\`\``,
            ].join("\n"),
            false,
         )

      const embeds = totalData.map((data) => {
         const embed = new Embed()
         .addField(
            client.translate(guildData.language, `COMMANDS.INFO.BOT.stats.execute.singleStatsEmbed.title`, {
               thisOrOther:
                  data.cluster == client.cluster.id
                     ? client.translate(guildData.language, `COMMANDS.INFO.BOT.stats.execute.thisOrOther.this`)
                     : client.translate(guildData.language, `COMMANDS.INFO.BOT.stats.execute.thisOrOther.other`),
               cluster: data.cluster,
               uptime: `<t:${client.utils.general.toUnixTimestamp(Date.now() - data.uptime)}:R>`,
            }),
            [
               `>>> \`\`\`yml\n`,
               `${client.translate(guildData.language, `COMMANDS.INFO.BOT.stats.execute.statsEmbed.hardware.memory`)}: ${data.ram.heapUsed.toFixed(2)}mb/${Math.abs(data.ram.rss).toFixed(2)}mb`,
               `${client.translate(guildData.language, `COMMANDS.INFO.BOT.stats.execute.statsEmbed.hardware.memoryFile`)}: ${Math.abs(data.ram.arrayBuffers).toFixed(2)}mb`,
               `${client.translate(guildData.language, `COMMANDS.INFO.BOT.stats.execute.statsEmbed.hardware.memoryTotal`)}: ${Math.abs(data.ram.rss).toFixed(2)}mb`,
               `${client.translate(guildData.language, `COMMANDS.INFO.BOT.stats.execute.statsEmbed.hardware.players`)}: ${Math.abs(data.players)}`,
               `${client.translate(guildData.language, `COMMANDS.INFO.BOT.stats.execute.statsEmbed.hardware.cpuUsage`)}: ${Math.abs(data.CPUUsage).toFixed(2)}%`,
               `\`\`\``,
            ].join("\n"),
            false,
         )
         .setFooter({
            text: `Cluster #${client.cluster.id} - Shard: #${message.guild.shardId}`,
            iconURL: client.user!.displayAvatarURL(),
         });
         return embed;
      });

      return client.utils.message.paginateEmbeds(message, guildData.language, embeds, {
         startFrom: client.cluster.id,
         extraEmbeds: [MAIN_EMBED],
         messageToEdit: LOADING_MSG,
      });
   },
} as Command;
