import { Player } from 'lavalink-client';
import { Command } from '../../../structures/Command';
import Client from '../../../structures/Client';
import { Embed } from '../../../extenders/discord/Embed';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
   execute(client: Client, message, args, prefix, guildData, userData, player: Player) {
      if (!client.utils.music.isPlaying(message, player, prefix, guildData.language)) return;

      const current = player.queue.current!;

      message.author.send({
         embeds: [
            new Embed()
               .setTitle(`${client.translate(guildData.language, `${this.LANG_KEY}.title`)}`)
               .setURL(current.info.uri)
               .addField(client.translate(guildData.language, `${this.LANG_KEY}.field.title`), `>>> **\`${current.info.title}\`**`, true)
               .addField(client.translate(guildData.language, `${this.LANG_KEY}.field.duration`), `>>> **\`${client.utils.music.formatDuration(current.info.duration)}\`**`, true)
               .addField(client.translate(guildData.language, `${this.LANG_KEY}.field.artist`), `>>> **\`${current.info.author}\`**`, true)
               .setImage(current.info.artworkUrl)
               .setFooter({text: client.translate(guildData.language, `${this.LANG_KEY}.footer`, {timestamp: client.utils.music.formatDuration(player.position)})})
         ],
         components: [
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setLabel(client.translate(guildData.language, `${this.LANG_KEY}.button.listen`))
                .setEmoji("📺")
                .setStyle(ButtonStyle.Link)
                .setURL(current.info.uri)
            )
         ]
      })
      .then(() => message.token ? message.reply({content: client.allemojis.yes}) : message.react(client.allemojis.yes))
      .catch(() => message.token ? message.reply({content: client.allemojis.no}) : message.react(client.allemojis.no))
   },
} as Command;

/*
╔═════════════════════════════════════════════════════╗
║    || - || Desarrollado por dewstouh#1088 || - ||   ║
║    ----------| discord.gg/MBPsvcphGf |----------    ║
╚═════════════════════════════════════════════════════╝
*/
