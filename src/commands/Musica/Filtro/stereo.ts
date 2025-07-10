import { AudioOutputs } from 'lavalink-client';
import Client from '../../../structures/Client';
import { Command } from '../../../structures/Command';

export default {
   async execute(client: Client, message, args, prefix, guildData, userData, player) {
      // @ts-ignore
      if (!client.utils.music.isPlaying(message, player, prefix, guildData.language)) return;
      // Not allowed? return
      if (!client.utils.music.isAllowedToAction(message, this.NAME, guildData)) return;

      await player.filterManager.setAudioOutput(this.NAME as AudioOutputs);


   },
} as Command;
