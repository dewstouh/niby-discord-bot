import { Command } from '../../../structures/Command';
import { Embed } from '../../../extenders/discord/Embed';

export default {
   execute(client, message, args, prefix, guildData) {
      const UPTIME = `${Math.floor(Math.floor(Date.now() - client.uptime) / 1000)}`;
      message.reply({
         embeds: [
            new Embed()
            .addField(
               client.translate(guildData.language, `${this.LANG_KEY}.embed.field1.name`),
               `> <t:${UPTIME}:F> | <t:${UPTIME}:R>`,
            )
            .setFooter({
               text: `Cluster #${client.cluster.id} - Shard: #${message.guild.shardId}`,
               iconURL: client.user!.displayAvatarURL(),
            })
         ],
         ephemeral: true,
      });
   },
} as Command;
