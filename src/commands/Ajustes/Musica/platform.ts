import { ActionRowBuilder, AnyComponentBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Embed } from '../../../extenders/discord/Embed';
import Client from '../../../structures/Client';
import { Command } from '../../../structures/Command';
import { validSearchPlatforms } from '../../Musica/play';
import music from '../../../config/music';
export default {
   PERMISSIONS: ['ManageGuild'],
   BOT_PERMISSIONS: ['ManageGuild'],
   async execute(client: Client, message, args, prefix, guildData) {
      const getPlatformComponents = (currentSearchPlatform = guildData.music?.searchPlatform) => {
         const rows: ActionRowBuilder<AnyComponentBuilder>[] = [];

         const platformButtons = Object.entries(validSearchPlatforms).reduce((accumulator: any, [k, v]) => {
            if (!accumulator.some((item) => item.data.label === v)) {
               const button = new ButtonBuilder()
                  .setLabel(v)
                  .setCustomId(k)
                  .setStyle(currentSearchPlatform === k ? ButtonStyle.Success : ButtonStyle.Secondary)
                  .setEmoji(client.allemojis[k] || client.allemojis.link)
                  .setDisabled((['youtubemusic', 'youtube'].includes(k) && !music.allowYoutube) || k === currentSearchPlatform);
               accumulator.push(button);
            }
            return accumulator;
         }, []);

         for (let i = 0; i < platformButtons.length; i += 5) {
            rows.push(new ActionRowBuilder().addComponents([...platformButtons.slice(i, i + 5)]));
         }
         return rows;
      };

      const selectPlatformMsg = await message.reply({
         embeds: [
            new Embed().addField(
               client.translate(guildData.language, `${this.LANG_KEY}.select.name`, {
                  // @ts-ignore
                  platformEmoji: client.allemojis[guildData.music.searchPlatform] || client.allemojis.link,
                  platformName: validSearchPlatforms[guildData.music.searchPlatform || music.defaultSearchPlatform],
               }),
               client.translate(guildData.language, `${this.LANG_KEY}.select.value`, {
                  current: `${client.allemojis[guildData.music.searchPlatform] || client.allemojis.link} ${
                     validSearchPlatforms[guildData.music.searchPlatform || music.defaultSearchPlatform]
                  }`,
               }),
            ),
         ],
         components: [...getPlatformComponents().slice(0, 5)],
      });

      const collector = selectPlatformMsg.createMessageComponentCollector({
         filter: (i) => i.isButton() && i.user && i.message.author.id == client.user!.id,
         time: 1 * 60 * 1000,
      });

      collector.on('collect', async (b) => {
         // Si el usuario que hace clic a el botón no es el mismo que ha escrito el comando, le respondemos que solo la persona que ha escrito >>queue puede cambiar de páginas
         if (b?.user.id !== message.user.id)
            return b?.reply({
               content: client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.collector.wrongUser'),
            });
         collector.stop();
         await guildData.updateOne({ 'music.searchPlatform': b.customId });
         b?.deferUpdate();
      });

      collector.on('end', (collected) => {
         const lastSelected = Array.from(collected?.values()).pop();
         // @ts-ignore
         const labelSelected = validSearchPlatforms[lastSelected?.customId];
         // Desactivamos los botones y editamos el mensaje
         return client.utils.message
            .edit(message, selectPlatformMsg, {
               content:
                  // @ts-ignore
                  lastSelected && labelSelected
                     ? // @ts-ignore
                       `${client.allemojis.yes} **\`${labelSelected}\`**`
                     : client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.collector.expire'),
               // @ts-ignore
               components:
                  lastSelected && labelSelected
                     ? // @ts-ignore
                       client.utils.message.disableComponents(getPlatformComponents(lastSelected.customId).slice(0, 5))
                     : client.utils.message.disableComponents(selectPlatformMsg),

               embeds:
                  // @ts-ignore
                  lastSelected && labelSelected
                     ? // @ts-ignore
                       [
                          new Embed().addField(
                             client.translate(guildData.language, `${this.LANG_KEY}.selected.name`, {
                                // @ts-ignore
                                platformEmoji: client.allemojis[lastSelected.customId] || client.allemojis.link,
                                platformName: labelSelected,
                             }),
                             client.translate(guildData.language, `${this.LANG_KEY}.selected.value`, {
                                // @ts-ignore
                                current: `${client.allemojis[lastSelected.customId] || client.allemojis.link} ${labelSelected}`,
                             }),
                          ),
                       ]
                     : selectPlatformMsg.embeds,
            })
            .catch(() => {});
      });
   },
} as Command;
