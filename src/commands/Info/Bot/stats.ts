import { Embed } from '../../../extenders/discord/Embed';
import Client from '../../../structures/Client';
import { Command } from '../../../structures/Command';

export default {
   ALIASES: ['botstats', 'botinfo'],
   async execute(client: Client, message, args, prefix, guildData) {
      const LOADING_MSG = await message.reply({
         embeds: [
            new Embed().addField(
               client.translate(guildData.language, `${this.LANG_KEY}.loadingEmbed.field1.name`, {
                  emoji: client.allemojis.online,
               }),
               client.translate(guildData.language, `${this.LANG_KEY}.loadingEmbed.field1.value`),
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
         .setThumbnail(client.user!.displayAvatarURL())
         .addField(
            client.translate(guildData.language, `${this.LANG_KEY}.statsEmbed.name`),
            `>>> \`\`\`${client.user?.username}\`\`\``,
            true,
         )
         .addField(`${client.allemojis.info} Id`, `>>> \`\`\`${client.user?.id}\`\`\``, true)
         .addField(client.translate(guildData.language, `${this.LANG_KEY}.statsEmbed.connection.name`),
            [
               `>>> \`\`\`yml\n${client.user?.username}: ${Math.abs(totalData.reduce((a, b) => a + b.ping, 0))}ms`,
               `${client.translate(guildData.language, `${this.LANG_KEY}.statsEmbed.connection.dbPing`)}: ${Math.abs(totalData.reduce((a, b) => a + b.dbPing, 0))}ms`,
               `${client.translate(guildData.language, `${this.LANG_KEY}.statsEmbed.connection.dbLatency`)}: ${Math.abs(totalData.reduce((a, b) => a + b.dbLatency, 0))}ms`,
               `\`\`\``
            ]
            .join("\n"),
            false,
         )
         .addField(
            client.translate(guildData.language, `${this.LANG_KEY}.statsEmbed.counters.name`),
            [
               `>>> \`\`\`yml\n`,
               `${client.translate(guildData.language, `${this.LANG_KEY}.statsEmbed.counters.users`)}: ${Math.abs(totalData.reduce((a, b) => a + b.members, 0))}`,
               `${client.translate(guildData.language, `${this.LANG_KEY}.statsEmbed.counters.guilds`)}: ${Math.abs(totalData.reduce((a, b) => a + b.guilds, 0))}`,
               `${client.translate(guildData.language, `${this.LANG_KEY}.statsEmbed.counters.players`)}: ${totalData.reduce((a, b) => a + b.players, 0)}`,
               `\`\`\``
            ].join("\n"),
            true,
         )
         .addField(
            client.translate(guildData.language, `${this.LANG_KEY}.statsEmbed.instances.name`),
            [
               `>>> \`\`\`yml\n`,
               `Clusters: ${client.cluster.info.CLUSTER_COUNT}`,
               `Shards: ${client.cluster.info.CLUSTER_COUNT}`,
               `${client.translate(guildData.language, `${this.LANG_KEY}.statsEmbed.instances.playerNodes`)}: ${totalData.reduce((a, b) => a + b.playerNodes, 0)}`,
               `\`\`\``,
            ].join("\n"),
            true,
         )
         .addField(
            client.translate(guildData.language, `${this.LANG_KEY}.statsEmbed.hardware.name`),
            [
               `>>> \`\`\`yml\n`,
               `${client.translate(guildData.language, `${this.LANG_KEY}.statsEmbed.hardware.memory`)}: ${Math.abs(totalData.reduce((a, b) => a + b.ram.heapUsed, 0).toFixed(2))}mb/${Math.abs(
                  totalData.reduce((a, b) => a + b.ram.rss, 0).toFixed(2),
               )}mb`,
               `${client.translate(guildData.language, `${this.LANG_KEY}.statsEmbed.hardware.memoryFile`)}: ${Math.abs(
                  totalData.reduce((a, b) => a + b.ram.arrayBuffers, 0).toFixed(2),
               )}mb`,
               `${client.translate(guildData.language, `${this.LANG_KEY}.statsEmbed.hardware.memoryTotal`)}: ${Math.abs(totalData.reduce((a, b) => a + b.ram.rss, 0).toFixed(2))}mb`,
               `${client.translate(guildData.language, `${this.LANG_KEY}.statsEmbed.hardware.cpuUsage`)}: ${Math.abs(totalData.reduce((a, b) => a + b.CPUUsage, 0).toFixed(2))}%`,
               `\`\`\``,
            ].join("\n"),
            false,
         )
         .setFooter({
            text: `Cluster #${client.cluster.id} - Shard: #${message.guild.shardId}`,
            iconURL: client.user!.displayAvatarURL(),
         });

      const embeds = totalData.map((data) => {
         const embed = new Embed()
            .addField(
               client.translate(guildData.language, `${this.LANG_KEY}.singleStatsEmbed.title`, {
                  thisOrOther:
                     data.cluster == client.cluster.id
                        ? client.translate(guildData.language, `${this.LANG_KEY}.thisOrOther.this`)
                        : client.translate(guildData.language, `${this.LANG_KEY}.thisOrOther.other`),
                  cluster: data.cluster,
                  uptime: `<t:${client.utils.general.toUnixTimestamp(Date.now() - data.uptime)}:R>`,
               }),

               client.translate(guildData.language, `${this.LANG_KEY}.singleStatsEmbed.description`, {
                  shards: data.shards,
                  ping: Math.abs(data.ping),
                  guilds: data.guilds,
                  memory: data.memory,
                  members: data.members,
                  players: data.players,
                  playerNodes: data.playerNodes
               }),
            )

         return embed;
      });

      return client.utils.message.paginateEmbeds(message, guildData.language, embeds, {
         startFrom: client.cluster.id,
         extraEmbeds: [MAIN_EMBED],
         messageToEdit: LOADING_MSG,
      });
   },
} as Command;
