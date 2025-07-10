import { Command } from '../../structures/Command';
import Client from '../../structures/Client';
import { Player } from 'lavalink-client';
import { ErrorEmbed } from '../../extenders/discord/Embed';

export default {
   OPTIONS: [
      {
         NUMBER: {
            REQUIRED: true,
         },
      },
   ],
   USAGE: '<volumen>',
   async execute(client: Client, message, args, prefix, guildData, userData, player: Player) {
      // No player? return
      if (!client.utils.music.isPlaying(message, player, prefix, guildData.language)) return;

      // Not allowed? return
      if (!client.utils.music.isAllowedToAction(message, this.NAME, guildData)) return;

      const volume = args[0];
      if (!volume)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.noargs.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.noargs.value`),
               ),
            ],
         });

      if (isNaN(volume))
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.invalid.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.invalid.value`),
               ),
            ],
         });

      // Set the vol
      await client.utils.music.setVolume(message, player, guildData.language, volume);
   },
} as Command;
