import { Player } from 'lavalink-client';
import Client from '../../../structures/Client';
import { CustomRequester } from '../../../typings/music';
import { Command } from '../../../structures/Command';

export default {
   execute(client: Client, message, args, prefix, guildData, userData, player: Player) {
      if (!client.utils.music.isPlaying(message, player, prefix, guildData.language)) return;

      const { queue } = player;

      const totalTracks = [queue.current!, ...queue.tracks];

      let timestampCounter = 0;
      let foundStream = false;
      const texto = totalTracks.map((song, index) => {


        const QUEUE_CURRENT = player.position;
        const CURRENT_SONG = totalTracks[0]!.info.duration!;
        const CURRENT_SRC_EMOJI = client.allemojis[totalTracks[index]!.info.sourceName!.toLowerCase()] || client.allemojis.link;
        const FIRST_SONG = totalTracks[0]!.info.duration!;
        timestampCounter += CURRENT_SONG;
         let text = "";
           if(index == 0){
            text = `${client.allemojis.disk} **\`${client.translate(guildData.language, `${this.LANG_KEY}.text.current`)}:\` - ${CURRENT_SRC_EMOJI} ${song.info.title} **\n> - <@${(song.requester as CustomRequester).id}>\n> - \`${song.info.isStream ?  client.translate(guildData.language, `COMMON.TEXTS.onStream`) : client.utils.music.formatDuration(song.info.duration!)}\` | ${foundStream ? client.allemojis.question : `<t:${client.utils.general.toUnixTimestamp(((Date.now() - FIRST_SONG - QUEUE_CURRENT) + timestampCounter))}:R>`}\n\n${totalTracks.length > 1 ? "" : `${client.translate(guildData.language, `${this.LANG_KEY}.text.nosongs`)}`}`
        } else {
           text = `**\`${index}\` - ${CURRENT_SRC_EMOJI} ${song.info.title} **\n> - <@${(song.requester as CustomRequester).id}>\n> - \`${song.info.isStream ?  client.translate(guildData.language, `COMMON.TEXTS.onStream`) : client.utils.music.formatDuration(song.info.duration!)}\` | ${foundStream ? client.allemojis.question : `<t:${client.utils.general.toUnixTimestamp(((Date.now() - FIRST_SONG - QUEUE_CURRENT) + timestampCounter))}:R>`}\n`
        }
        if(song.info.isStream) foundStream = true;
        return text;
    });

      return client.utils.message.pagination(
         message,
         guildData.language,
         texto,
         `${client.allemojis.notes} ${totalTracks.length > 1 ? client.translate(guildData.language, `${this.LANG_KEY}.text.title`, {amount: totalTracks.length-1, name: message.guild.name}) : client.translate(guildData.language, `${this.LANG_KEY}.text.nowplaying`)}`,
         10,
      );
   },
} as Command;

/*
╔═════════════════════════════════════════════════════╗
║    || - || Desarrollado por dewstouh#1088 || - ||   ║
║    ----------| discord.gg/MBPsvcphGf |----------    ║
╚═════════════════════════════════════════════════════╝
*/
