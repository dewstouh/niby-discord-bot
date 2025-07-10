import { Command } from '../../structures/Command';
import Client from '../../structures/Client';
import music from '../../config/music';
export const validSearchPlatforms = {
   "youtube": "Youtube",
   "spotify": "Spotify",
   "soundcloud": "SoundCloud",
   "deezer": "Deezer",
   "youtubemusic": "Youtube Music",
   "yt": "Youtube",
   "sp": "Spotify",
   "sc": "SoundCloud"
}
export default {
   OPTIONS: [
      {
         STRING: {
            REQUIRED: false,
         },
      },
   ],
   async execute(client:Client, message, args, prefix, guildData, userData) {
      let query = args.slice(0).join(" ") || music.randomPlaylists.random();
      let searchPlatform = guildData.music.searchPlatform;
      if(Object.keys(validSearchPlatforms).includes(query.split(":")[0])){
         searchPlatform = query.split(":")[0];
         query = query.split(":")[1]?.trim() || music.randomPlaylists.random();
      }
      await client.utils.music.playSong(message, query, { guildData, userData, searchPlatform })
   },
} as Command;
