import { EQBand, FilterData, Player, PlayerOptions, RepeatMode } from 'lavalink-client';
import LavalinkManager from '../../structures/LavalinkManager';
export interface PlayerCacheJson {
   options: PlayerOptions; // El tipo de options dependerá de su estructura
   voiceChannelId: string;
   textChannelId: string;
   position: number;
   lastPosition: number;
   volume: number;
   lavalinkVolume: number;
   repeatMode: RepeatMode; // El tipo de repeatMode dependerá de su estructura
   paused: boolean;
   autoplay: boolean;
   "247": boolean;
   playing: boolean;
   createdTimeStamp: number;
   filters: FilterData; // El tipo de filters dependerá de su estructura
   equalizer: EQBand[]; // El tipo de equalizer dependerá de su estructura
   updatedAt: number;
}
export default async (manager: LavalinkManager, oldPlayerJson: Player, newPlayer: Player) => {
   const { client } = manager;
   if(!newPlayer.queue.current) return;
   const newPlayerJson = newPlayer.toJSON();
   const newPlayerCacheJson = {
      options: newPlayerJson.options,
      voiceChannelId: newPlayerJson.voiceChannelId,
      textChannelId: newPlayerJson.textChannelId,
      position: newPlayerJson.position,
      lastPosition: newPlayerJson.lastPosition,
      volume: newPlayerJson.volume,
      lavalinkVolume: newPlayerJson.lavalinkVolume,
      repeatMode: newPlayerJson.repeatMode,
      paused: newPlayerJson.paused,
      autoplay: newPlayer.get("autoplay"),
      "247": newPlayer.get("247"),
      playing: newPlayerJson.playing,
      createdTimeStamp: newPlayerJson.createdTimeStamp,
      filters: newPlayerJson.filters,
      equalizer: newPlayerJson.equalizer,
      updatedAt: Date.now(),
   };

   const newPlayerCacheFilteredJson = removeKeyFromObject('updatedAt', newPlayerCacheJson);


   const oldPlayerCacheJson = await client.redisCache.get(`lavalinkplayer_${newPlayer.guildId}`);

   if(oldPlayerCacheJson) {
    const oldPlayerCacheFilteredJson = removeKeyFromObject('updatedAt', oldPlayerCacheJson);

    // Check if all values are DIFFERENT and UPDATE EACH 5 SECONDS...
    if (!oldPlayerCacheFilteredJson?.isEqual(newPlayerCacheFilteredJson) && Date.now() + 5000 >= (oldPlayerCacheJson?.updatedAt || 0)) {
       //   console.log('updated the player cache');
       //   console.log(getDifferences(oldPlayerCacheJson, newPlayerCacheJson));
       await client.redisCache.set(`lavalinkplayer_${newPlayer.guildId}`, newPlayerCacheJson);
    }
   } else {
    await client.redisCache.set(`lavalinkplayer_${newPlayer.guildId}`, newPlayerCacheJson);
   }
   
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getDifferences(objetoA: any, objetoB: any): Record<string, any> {
   const diferencias: Record<string, any> = {};

   for (const key in objetoA) {
      if (objetoA.hasOwnProperty(key)) {
         if (typeof objetoA[key] === 'object' && typeof objetoB[key] === 'object') {
            const subDiferencias = getDifferences(objetoA[key], objetoB[key]);
            if (Object.keys(subDiferencias).length > 0) {
               diferencias[key] = subDiferencias;
            }
         } else if (objetoA[key] !== objetoB[key]) {
            diferencias[key] = objetoB[key];
         }
      }
   }

   return diferencias;
}

function removeKeyFromObject(keyToFilter: string, object: object): object {
   return Object.keys(object)
      .filter((key) => key !== keyToFilter)
      .reduce((obj, key) => {
         obj[key] = object[key];
         return obj;
      }, {});
}
