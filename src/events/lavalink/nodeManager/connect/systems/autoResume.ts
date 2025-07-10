import { Queue } from 'lavalink-client';
import { Embed } from '../../../../../extenders/discord/Embed';
import Client from '../../../../../structures/Client';
import { PlayerCacheJson } from '../../../playerUpdate';
import { TextChannel, VoiceChannel } from 'discord.js';

export default {
   async execute(client: Client) {
      const queueResumeKeys: string[] = await client.redisCache.keys(`lavalinkqueue_*`);
      if (queueResumeKeys.length >= 1) {
         for (const queueResumeKey of queueResumeKeys) {
            await client.utils.general.delay(500); // Esperar 500 ms entre canal y canal
            const guildId = queueResumeKey.split('_')[1];
            const playerResumeKey = `lavalinkplayer_${guildId}`;
            const GUILD_DATA = await client.db.getGuildData(guildId);
            const guild = client.guilds.cache.get(guildId);
            if (!guild) {
               await clearCaches(client, queueResumeKey, playerResumeKey);
               continue;
            }

            const queueData: Queue = await client.redisCache.get(queueResumeKey);
            const playerData: PlayerCacheJson = await client.redisCache.get(playerResumeKey);
            if (!queueData || !queueData.current || !playerData) {
               await clearCaches(client, queueResumeKey, playerResumeKey);
               continue;
            }

            const voiceChannel:VoiceChannel = (guild.channels.cache.get(playerData.voiceChannelId) ||
               (await guild.channels.fetch(playerData.voiceChannelId).catch(() => null))) as VoiceChannel;
            if (!voiceChannel || !voiceChannel.joinable || !voiceChannel.speakable || voiceChannel.full) {
               await clearCaches(client, queueResumeKey, playerResumeKey);
               continue;
            }

            // Desconectar el bot del vc si está dentro del canal de voz y no hay más bots en ese mismo canal de voz y el modo 24/7 no está activado
            if(voiceChannel && voiceChannel.members.has(client.user!.id) && voiceChannel.members.filter((m) => !m.user.bot).size < 1 && !playerData['247']) {
               const botMember = voiceChannel.members.find(m => m.user.id === client.user!.id);
               if(botMember) botMember.voice?.disconnect();
               await clearCaches(client, queueResumeKey, playerResumeKey);
               continue;
            }

            const textChannel = (guild.channels.cache.get(playerData.textChannelId) ||
               (await guild.channels.fetch(playerData.textChannelId).catch(() => null))) as TextChannel;
            if (!textChannel) {
               await clearCaches(client, queueResumeKey, playerResumeKey);
               continue;
            }

            const player = client.lavalink.getPlayer(guildId) || (await client.lavalink.createPlayer(playerData.options));

            // SET PLAYER SETTINGS B4 CONNECTING
            if (playerData['247']) await player.set('247', true);
            await player.set("autoplay", playerData.autoplay);
            await player.setRepeatMode(playerData.repeatMode);

            await player.connect();

            await player.queue.utils.sync(true, false);

            await player.play({
               track: queueData.current,
               position: playerData.position || 0,
            });
            // If playerData was paused or no voiceChannel members (humans only) is empty
            if (playerData.paused) await player.pause();

            return textChannel.send({
               embeds: [new Embed().setDescription(client.translate(GUILD_DATA.language, `UTILS.MUSIC.reconnected`))],
            });
         }
      }
   },
};

async function clearCaches(client:Client, queueResumeKey:string, playerResumeKey:string):Promise<void>{
   await client.redisCache.delete(queueResumeKey);
   await client.redisCache.delete(playerResumeKey);
}