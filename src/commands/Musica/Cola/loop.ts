import { Command } from '../../../structures/Command';
import Client from '../../../structures/Client';
import { Player, RepeatMode } from 'lavalink-client';
import { ErrorEmbed } from '../../../extenders/discord/Embed';

export default {
   USAGE: '<(pista|cola|off)?>',
   OPTIONS: [
      {
         STRING_CHOICES: {
            REQUIRED: false,
            CHOICES: ['track', 'queue', 'off'],
         },
      },
   ],
   execute(client: Client, message, args, prefix, guildData, userData, player: Player) {
      // No player? return
      if (!client.utils.music.isPlaying(message, player, prefix, guildData.language)) return;

      // Not allowed? return
      if (!client.utils.music.isAllowedToAction(message, this.NAME, guildData)) return;

      const loopMode = args[0]?.toLowerCase() as RepeatMode;
      // @ts-ignore
      
      const translatedObject = client.translate(guildData.language, `${this.LANG_PATH}.OPTIONS.0STRING_CHOICES.CHOICES`) // {off: "Desactivar", track: "Pista", queue: "Cola"};
      const loopModes = Object.keys(translatedObject) as string[];
      const translatedLoopModes = Object.values(translatedObject) as string[]; // ["Desactivar", "Pista", "Cola"]
      const translatedLoopModesLowerCase = Object.values(translatedObject).map(e => e.toLowerCase()) as string[]; // ["Desactivar", "Pista", "Cola"]

      if (!loopMode) return client.utils.music.toggleLoop(message, player, guildData.language);

      if (![...loopModes, ...translatedLoopModes].map(m => m?.toLowerCase?.()).includes(loopMode))
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.invalidloop.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.invalidloop.value`, {
                     prefix,
                     cmdName: this.NAME,
                     cmdUsage: this.USAGE,
                     loopModes: translatedLoopModes.map((m) => `- \`${m}\``).join('\n'),
                  }),
               ),
            ],
         });

      // Skip the song
      const selectedMode = (loopModes[translatedLoopModesLowerCase.indexOf(loopMode)] || loopMode) as RepeatMode;

      return client.utils.music.toggleLoop(message, player, guildData.language, selectedMode);
   },
} as Command;
