import { Command } from '../../structures/Command';
import Client from '../../structures/Client';
import { Player } from 'lavalink-client';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import { EmbedBuilder } from 'discord.js';
import music from '../../config/music';
export default {
   OPTIONS: [
      {
         STRING: {
            REQUIRED: false,
         },
      },
   ],
   execute(client: Client, message, args, prefix, guildData, userData, player: Player) {
      // No player? return

      const argsQuery = args.join(" ");
      const trackTitle = (argsQuery || player?.queue?.current?.info?.title)?.capitalizeFirstChar();

      if (!trackTitle)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.noargs.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.noargs.value`, { cmdName: this.NAME, prefix }),
               ),
            ],
         });

      const formattedTitle = cleanTitle(trackTitle);
      const currentAuthor = argsQuery ? "" : player?.queue?.current?.info?.author ? cleanAuthor(player?.queue?.current?.info?.author) : "";

      return message
         .reply({
            embeds: [
               new Embed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.loading.name`, { songTitle: trackTitle }),
                  client.translate(guildData.language, `${this.LANG_KEY}.loading.value`, { songTitle: trackTitle }),
               ),
            ],
         })
         .then((msg) => {

            fetch(`${music.lyricsApi.url}?title=${formattedTitle}&author=${currentAuthor}`, {
               headers: {
                  authorization: music.lyricsApi.token
               }
            })
               .then((response) => {
                  if(response.status == 403) throw '[LYRICS API] - Forbidden (403)'
                  return response.json()
               })
               .then((json: unknown) => {
                  if (!json) throw '[LYRICS API] - Not found (404)';
                  const lyricsData = json as { lyrics: string };
                  const paragraphs = lyricsData.lyrics.split('\n\n');
                  const paragraphsPerEmbed = 5;
                  const embeds: EmbedBuilder[] = [];
                  for (let i = 0; i < paragraphs.length; i += paragraphsPerEmbed) {
                     const paragraph = paragraphs.slice(i, i + paragraphsPerEmbed).join('\n\n');
                     embeds.push(
                        new EmbedBuilder()
                           .setTitle(client.translate(guildData.language, `${this.LANG_KEY}.title`, { songTitle: trackTitle }))
                           .setDescription(`>>> ${paragraph}`),
                     );
                  }
                  return client.utils.message.paginateEmbeds(message, guildData.language, embeds, {
                     messageToEdit: msg,
                  });
               })
               .catch((e) => {
                  if(typeof e === "string" && !e.includes("404")) console.error(e);
                  return client.utils.message.edit(message, msg, {
                     embeds: [
                        new Embed().setDescription(
                           client.translate(guildData.language, `${this.LANG_KEY}.notfound.description`, { songTitle: trackTitle }),
                        ),
                     ],
                  });
               });
         });
   },
} as Command;

function cleanTitle(title: string | undefined) {
   return title
      ? title
           .toLowerCase()
           .replace(/\(.*/, '')
           .replace(
              /\s*(official|official\s*music\s*video|audio|lyrics|lyric|clip\s*officiel|clip|extended|hq|slowed|boosted|bass\s*boosted)\s*/g,
              '',
           )
           .replace(/\s+/g, '%20') // Reemplaza espacios en blanco con "%20"
           .trim()
      : undefined;
}

function cleanAuthor(title: string) {
   return title
      .toLowerCase()
      .replace(/\s*VEVO\s*/i, '')
      ?.trim();
}
