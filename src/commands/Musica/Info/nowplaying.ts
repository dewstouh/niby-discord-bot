import { Player } from 'lavalink-client';
import { Command } from '../../../structures/Command';
import Client from '../../../structures/Client';
import { Embed } from '../../../extenders/discord/Embed';
import { CustomRequester } from '../../../typings/music';
import { ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';

export default {
   ALIASES: ['np'],
   execute(client: Client, message, args, prefix, guildData, userData, player: Player) {
      if (!client.utils.music.isPlaying(message, player, prefix, guildData.language)) return;

      const cancion = player.queue.current!;
      const bar = client.utils.message.createProgressBar(player.position, cancion.info.isStream ? player.position : cancion.info.duration, "▱", "▰", 8);
      const currentDuration = cancion.info.isStream ? `${client.translate(guildData.language, `COMMON.TEXTS.onStream`)}` : `${client.utils.music.formatDuration(player.position)} / ${client.utils.music.formatDuration(cancion.info.duration)}`;
      message.reply({
         embeds: [
            new Embed()
               .addField(client.translate(guildData.language, `${this.LANG_KEY}.embed.nowplaying`), `>>> \`\`\`${cancion.info.title} - ${cancion.info.author}\`\`\``)
               .addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.embed.duration`),
                  `>>> \`\`\`${currentDuration}\n${bar}\`\`\``,
               )
               .setThumbnail(cancion.info.artworkUrl)
               .setFooter({
                  text: `${client.translate(guildData.language, `${this.LANG_KEY}.footer.addedBy`)}: ${
                     (cancion.requester as CustomRequester).username
                  }\n${client.translate(guildData.language, `${this.LANG_KEY}.footer.queueSongs`, {amount: [player.queue.current, ...player.queue.tracks].length})}`,
                  iconURL: (cancion.requester as CustomRequester).avatar,
               }),
         ],
         components: [
            new ActionRowBuilder().addComponents([
               new ButtonBuilder()
                  .setStyle(ButtonStyle.Link)
                  .setURL(cancion.info.uri)
                  .setEmoji(client.allemojis.link)
                  .setLabel(client.translate(guildData.language, `${this.LANG_KEY}.button.listen`)),
               // new ButtonBuilder()
               //    .setStyle(ButtonStyle.Secondary)
               //    .setCustomId(`music-save-{${cancion.info.uri}}`)
               //    .setEmoji(client.allemojis.favourite)
               //    .setLabel(client.translate(guildData.language, `${this.LANG_KEY}.button.save`)),
            ]),
         ]
      });
   },
} as Command;

/*
╔═════════════════════════════════════════════════════╗
║    || - || Desarrollado por dewstouh#1088 || - ||   ║
║    ----------| discord.gg/MBPsvcphGf |----------    ║
╚═════════════════════════════════════════════════════╝
*/
