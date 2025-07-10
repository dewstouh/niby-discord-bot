import { Command } from '../../structures/Command';
import Client from '../../structures/Client';
import music from '../../config/music';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import {
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle,
   ModalBuilder,
   StringSelectMenuBuilder,
   TextInputBuilder,
   TextInputStyle,
} from 'discord.js';

export default {
   async execute(client: Client, message, args, prefix, guildData) {
      // Not allowed? return
      if (!client.utils.music.isAllowedToAction(message, this.NAME, guildData)) return;
      const radioEntries = Object.entries(music.radios);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const radioMap = radioEntries.map(([key, value]) => {
         const options = value.map((fm) => {
            const fmName = fm.split(' :: ')[0];
            return {
               description: client.translate(guildData.language, `${this.LANG_KEY}.menu.options.playRadio`, { name: fmName }),
               value: `${fmName}`,
               label: fmName,
            };
         });
         return {
            name: client.translate(guildData.language, `${this.LANG_KEY}.radios.${key}`),
            options,
         };
      });

      const rows = radioMap.map((r, index) => {
         return new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
               // @ts-ignore
               .setCustomId(`RadioSelection${index}`)
               .setMaxValues(1)
               .setMinValues(1)
               .setPlaceholder(client.translate(guildData.language, `${this.LANG_KEY}.menu.placeholder`, { name: r.name }))
               .addOptions(r.options),
         );
      });

      const buttons = [
         new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('Atrás')
            .setEmoji(client.allemojis.flechaizq)
            .setLabel(client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.message.buttons.back')),
         new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setCustomId('Inicio')
            .setEmoji('🏠')
            .setLabel(client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.message.buttons.home')),
         new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('Avanzar')
            .setEmoji(client.allemojis.flechader)
            .setLabel(client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.message.buttons.forward')),
         new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('Página')
            .setEmoji('🔢')
            .setLabel(client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.message.buttons.page')),
      ];

      const buttonRow = new ActionRowBuilder().addComponents(buttons);

      const messages: object[] = [];

      const totalRadios = radioMap.reduce((accumulator, entry) => accumulator + entry.options.length, 0);
      for (let i = 0; i < rows.length; i += 4) {
         const currentPage = Math.floor(i / 4) + 1; // Calcula la página actual
         const embed = new Embed()
            .addField(
               `📻 [${totalRadios}] ${client.translate(guildData.language, `${this.LANG_KEY}.embed.availableRadios`)}:`,
               `${radioMap
                  .slice(i, +Math.min(i + 4, radioEntries.length))
                  .map(
                     (r) =>
                        `- **${r.name}**\n - \`${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.value.fm`, {
                           amount: r.options.length,
                        })}\``,
                  )
                  .join('\n')}`,
            )

            .setFooter({
               text: client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.message.embed.footer', {
                  page: currentPage,
                  pages: rows.length / 4,
               }),
               iconURL: client.user!.displayAvatarURL(),
            });

         messages.push({
            content: client.translate(guildData.language, `${this.LANG_KEY}.content.selectRadio`),
            embeds: [embed],
            components: [rows[i], rows[i + 1], rows[i + 2], rows[i + 3], buttonRow],
         });
      }

      const radioMsg = await message.reply(messages[0]);

      const collector = radioMsg.createMessageComponentCollector({
         filter: (i) => (i.isButton() || i.isStringSelectMenu()) && i.user && i.message.author.id == client.user!.id,
         time: 1 * 60 * 1000,
      });

      let paginaActual = 0;

      collector.on('collect', async (b) => {
         // Si el usuario que hace clic a el botón no es el mismo que ha escrito el comando, le respondemos que solo la persona que ha escrito >>queue puede cambiar de páginas
         if (b?.user.id !== message.user.id)
            return b?.reply({
               content: client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.collector.wrongUser'),
            });

         if (b?.isButton()) {
            switch (b?.customId) {
               case 'Atrás':
                  {
                     // Resetemamos el tiempo del collector
                     collector.resetTimer();
                     // Si la pagina a retroceder no es igual a la primera pagina entonces retrocedemos
                     if (paginaActual !== 0) {
                        // Resetemamos el valor de pagina actual -1
                        paginaActual -= 1;
                        // Editamos el embeds
                        await b?.update(messages[paginaActual]).catch(() => {});
                     } else {
                        // Reseteamos al cantidad de embeds - 1
                        paginaActual = messages.length - 1;
                        // Editamos el embeds
                        await b?.update(messages[paginaActual]).catch(() => {});
                     }
                  }
                  break;

               case 'Inicio':
                  {
                     // Resetemamos el tiempo del collector
                     collector.resetTimer();
                     // Si la pagina a retroceder no es igual a la primera pagina entonces retrocedemos
                     paginaActual = 0;
                     await b?.update(messages[paginaActual]).catch(() => {});
                  }
                  break;

               case 'Avanzar':
                  {
                     // Resetemamos el tiempo del collector
                     collector.resetTimer();
                     // Si la pagina a avanzar no es la ultima, entonces avanzamos una página
                     if (paginaActual < messages.length - 1) {
                        // Aumentamos el valor de pagina actual +1
                        paginaActual++;
                        // Editamos el embeds
                        await b?.update(messages[paginaActual]).catch(() => {});
                        // En caso de que sea la ultima, volvemos a la primera
                     } else {
                        // Reseteamos al cantidad de embeds - 1
                        paginaActual = 0;
                        // Editamos el embeds
                        await b?.update(messages[paginaActual]).catch(() => {});
                     }
                  }
                  break;

               case 'Página':
                  {
                     const MODAL = new ModalBuilder()
                        .setCustomId('paginaModal')
                        .setTitle(client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.message.modal.title'));

                     const MODAL_PAGE_OPTION = new TextInputBuilder()
                        .setCustomId('numeroPagina')
                        .setLabel(client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.message.modal.options.modalPage.label'))
                        .setRequired(true)
                        .setPlaceholder(`1 - ${messages.length}`)
                        .setStyle(TextInputStyle.Short);

                     const MODAL_ROW = new ActionRowBuilder().addComponents(MODAL_PAGE_OPTION);
                     // @ts-ignore
                     MODAL.addComponents(MODAL_ROW);

                     await b?.showModal(MODAL);
                     await b
                        ?.awaitModalSubmit({
                           time: 180e3,
                           filter: (i) => i.user.id === message.user.id,
                        })
                        .then(async (modal) => {
                           const page = modal.fields.getTextInputValue('numeroPagina');
                           if (isNaN(page))
                              return modal?.reply({
                                 embeds: [
                                    new ErrorEmbed().setDescription(
                                       client.translate(
                                          guildData.language,
                                          'UTILS.MESSAGE.PAGINATION.message.modal.options.modalPage.execute.invalidNumber',
                                       ),
                                    ),
                                 ],
                                 ephemeral: true,
                              });
                           paginaActual = Number(page - 1);
                           if (page > messages.length - 1) paginaActual = messages.length - 1;
                           if (page < 1) paginaActual = 0;
                           // Editamos el embed
                           await modal?.update(messages[paginaActual]).catch(() => {});
                        })
                        .catch(() => {});
                  }
                  break;

               default:
                  break;
            }
         }

         if (b?.isAnySelectMenu()) {
            collector.stop();
            const fmName = b?.values[0];
            const selectedRadioURL = Object.values(music.radios)
               .flat()
               .find((radio) => radio.includes(fmName))!
               .split(' :: ')[1];
            return client.utils.music.playSong(b, selectedRadioURL, { guildData });
         }
      });

      collector.on('end', (collected) => {
         const lastSelected = Array.from(collected.values()).pop();
         // Desactivamos los botones y editamos el mensaje
         return client.utils.message
            .edit(message, radioMsg, {
               ...messages[paginaActual],
               content:
               // @ts-ignore
                  lastSelected && lastSelected.values
               // @ts-ignore
                     ? `${client.allemojis.yes} **\`${lastSelected.values}\`**`
                     : client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.collector.expire'),
               components: client.utils.message.disableComponents(messages[paginaActual]),
            })
            .catch(() => {});
      });
   },
} as Command;
