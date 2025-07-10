import { Player } from 'lavalink-client';
import { Command } from '../../../structures/Command';
import Client from '../../../structures/Client';
import { Embed, ErrorEmbed } from '../../../extenders/discord/Embed';

export default {
   async execute(client: Client, message, args, prefix, guildData, userData, player: Player) {
      if (!client.utils.music.isPlaying(message, player, prefix, guildData.language)) return;

      // Not allowed? return
      if (!client.utils.music.isAllowedToAction(message, this.NAME, guildData)) return;

      const nextTracks = player.queue.tracks.length;
      if (!nextTracks || nextTracks < 2)
         return message.reply({
            embeds: [new ErrorEmbed().setDescription(client.translate(guildData.language, `${this.LANG_KEY}.error.description`))],
         });

      const unshuffledTracks = player.queue.tracks.map((t) => t);

      player.set('b4shuffle', unshuffledTracks);

      await player.queue.shuffle();

      return message.reply({
         embeds: [
            new Embed().setDescription(
               client.translate(guildData.language, `${this.LANG_KEY}.success.description`, { amount: nextTracks }),
            ),
         ],
      });
   },
} as Command;

/*
╔═════════════════════════════════════════════════════╗
║    || - || Desarrollado por dewstouh#1088 || - ||   ║
║    ----------| discord.gg/MBPsvcphGf |----------    ║
╚═════════════════════════════════════════════════════╝
*/
