import { Player, Track } from 'lavalink-client';
import { Command } from '../../../structures/Command';
import Client from '../../../structures/Client';
import { Embed, ErrorEmbed } from '../../../extenders/discord/Embed';

export default {
   OPTIONS: [
      {
         NUMBER: {
            REQUIRED: true,
         },
      },
            {
         NUMBER: {
            REQUIRED: true,
         },
      },
   ],
   USAGE: "<idPistaOrigen> <idPistaDestino>",
   async execute(client: Client, message, args, prefix, guildData, userData, player: Player) {
      if (!client.utils.music.isPlaying(message, player, prefix, guildData.language)) return;

      // Not allowed? return
      if (!client.utils.music.isAllowedToAction(message, this.NAME, guildData)) return;

      const nextTracks = player.queue.tracks.length;
      if (!nextTracks || nextTracks < 2)
         return message.reply({
            embeds: [new ErrorEmbed().setDescription(client.translate(guildData.language, `${this.LANG_KEY}.error.description`))],
         });

      let indexOrigin = args[0];
      if (!indexOrigin || isNaN(indexOrigin) || indexOrigin % 1 != 0)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.noOrigin.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.noOrigin.value`, {prefix}),
               ),
            ],
         });
      indexOrigin -= 1;
      const originTrack = player.queue.tracks[indexOrigin];
      if (!originTrack)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.invalidOrigin.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.invalidOrigin.value`, {prefix}),
               ),
            ],
         });

      let indexDestiny = args[1];
      if (!indexDestiny || isNaN(indexDestiny) || indexDestiny % 1 != 0)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.noDestiny.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.noDestiny.value`, {prefix}),
               ),
            ],
         });
      indexDestiny -= 1;
      const destinyTrack = player.queue.tracks[indexOrigin];
      if (!destinyTrack)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.invalidDestiny.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.invalidDestiny.value`, {prefix}),
               ),
            ],
         });

      const switchedQueue = player.queue.tracks.map((t) => t).move(indexOrigin, indexDestiny) as Track[];

      await player.queue.splice(0, player.queue.tracks.length);

      await player.queue.tracks.push(...switchedQueue);

      return message.reply({
         embeds: [
            new Embed().setDescription(
               client.translate(guildData.language, `${this.LANG_KEY}.success.description`, {name: originTrack.info.title, newIndex: indexDestiny+1}),
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
