import { Player } from 'lavalink-client';
import Client from '../../../structures/Client';
import { Command } from '../../../structures/Command';
import { Embed, ErrorEmbed } from '../../../extenders/discord/Embed';

export default {
   OPTIONS: [
      {
         NUMBER: {
            REQUIRED: true,
         },
      },
   ],
   USAGE: "<Cantidad>",
   async execute(client: Client, message, args, prefix, guildData, userData, player:Player) {
      // @ts-ignore
      if (!client.utils.music.isPlaying(message, player, prefix, guildData.language)) return;
      // Not allowed? return
      if (!client.utils.music.isAllowedToAction(message, this.NAME, guildData)) return;

      const speed = args[0];
      if (!speed)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.noargs.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.noargs.value`),
               ),
            ],
         });

      if (isNaN(speed) || speed < 0)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.invalid.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.invalid.value`),
               ),
            ],
         });


      await player.filterManager.setRate(speed)

      return message.reply({
        embeds: [
            new Embed()
            .setDescription(client.translate(guildData.language, `${this.LANG_KEY}.success.description`, {speed}))
        ]
      });
   },
} as Command;
