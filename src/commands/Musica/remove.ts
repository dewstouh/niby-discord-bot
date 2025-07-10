import { Player } from 'lavalink-client';
import { Command } from '../../structures/Command';
import Client from '../../structures/Client';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';

export default {
   OPTIONS: [
      {
         NUMBER: {
            REQUIRED: true,
         },
      },
   ],
   USAGE: "<idPista>",
   async execute(client: Client, message, args, prefix, guildData, userData, player: Player) {
      if (!client.utils.music.isPlaying(message, player, prefix, guildData.language)) return;
      // Not allowed? return
      if (!client.utils.music.isAllowedToAction(message, this.NAME, guildData)) return;

      const nextTracks = player.queue.tracks.length;
      if (!nextTracks)
         return message.reply({
            embeds: [new ErrorEmbed().setDescription(client.translate(guildData.language, `${this.LANG_KEY}.error.notrackstoremove`)),
            ]
         });

      let indexOrigin = args[0];
      if (!indexOrigin || isNaN(indexOrigin) || indexOrigin % 1 != 0)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.noargs.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.noargs.value`),
               ),
            ],
         });
      indexOrigin -= 1;
      const originTrack = player.queue.tracks[indexOrigin];
      if (!originTrack)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.invalid.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.invalid.value`),
               ),
            ],
         });

      await player.queue.splice(indexOrigin, 1);

      return message.reply({
         embeds: [
            new Embed().setDescription(client.translate(guildData.language, `${this.LANG_KEY}.success.description`, { name: originTrack.info.title, id: indexOrigin })),
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
