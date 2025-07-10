import { Command } from '../../structures/Command';
import Client from '../../structures/Client';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import { default as LocaleList } from '../../config/LocaleEmojis';
import {
   ActionRowBuilder,
   AnyComponentBuilder,
   ButtonBuilder,
   ButtonStyle,
   ModalBuilder,
   StringSelectMenuBuilder,
   TextInputBuilder,
   TextInputStyle,
} from 'discord.js';

export default {
   async execute(client: Client, message, args, prefix, guildData) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const languageEntries = Object.entries(LocaleList);

      const languageOptions = languageEntries.map(([key, value]) => {
         const percentageTranslated = client.utils.locale.getPercentageTranslated(key);
         return {
            label: client.translate(guildData.language, `LANGUAGES.${key}`),
            value: key,
            emoji: value,
            description: client.translate(guildData.language, `${this.LANG_KEY}.menu.options.selectLanguage`, {
               name: client.translate(guildData.language, `LANGUAGES.${key}`),
               percentageTranslated
            }),
         };
      });

      const rows: ActionRowBuilder<AnyComponentBuilder>[] = [];

      for (let i = 0; i < languageOptions.length; i += 25) {
         rows.push(
            new ActionRowBuilder().addComponents(
               new StringSelectMenuBuilder()
                  .setCustomId(`LanguageSelection${i}`)
                  .setMaxValues(1)
                  .setMinValues(1)
                  .addOptions(...languageOptions.slice(i, i + 25)),
            ),
         );
      }

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

      const totalRadios = languageOptions.length;
      for (let i = 0; i < rows.length; i += 4) {
         const currentPage = Math.floor(i / rows.length) + 1; // Calcula la página actual
         const embed = new Embed()
            .addField(
               `${client.allemojis.chat} [${totalRadios}] ${client.translate(
                  guildData.language,
                  `${this.LANG_KEY}.embed.availableRadios`,
               )}:`,
               `${
                  messages.length + 1 > 1
                     ? languageOptions
                          .slice(i, i + 4)
                          .map((r) => `- ${r.emoji} **${r.label}**`)
                          .join('\n')
                     : languageOptions.map((r) => `- ${r.emoji} **${r.label}**`).join('\n')
               }`,
            )

            .setFooter({
               text: client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.message.embed.footer', {
                  page: currentPage,
                  pages: messages.length + 1 > 1 ? rows.length / 4 : 1,
               }),
               iconURL: client.user!.displayAvatarURL(),
            });

         const components = [rows[i]];
         if (rows[i + 1]) components.push(rows[i + 1]);
         if (rows[i + 2]) components.push(rows[i + 2]);
         if (rows[i + 3]) components.push(rows[i + 3]);
         if (messages.length + 1 > 1) components.push(buttonRow);

         messages.push({
            content: client.translate(guildData.language, `${this.LANG_KEY}.content.selectRadio`),
            embeds: [embed],
            components,
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
            const SELECTED_LANG = b?.values[0];
            guildData
               .updateOne({
                  language: SELECTED_LANG,
               })
               .then(() => {
                  return b.reply({
                     embeds: [
                        new Embed().addFields({
                           name: client.translate(SELECTED_LANG, `${this.LANG_KEY}.success.name`, {
                              emoji: LocaleList[SELECTED_LANG],
                              language: client.translate(SELECTED_LANG, `LANGUAGES.${SELECTED_LANG}`),
                           }),
                           value: client.translate(SELECTED_LANG, `${this.LANG_KEY}.success.value`, {
                              emoji: LocaleList[SELECTED_LANG],
                              language: client.translate(SELECTED_LANG, `LANGUAGES.${SELECTED_LANG}`),
                           }),
                        }),
                     ],
                     ephemeral: true,
                  });
               })
               .catch(() => {
                  return b.reply({
                     embeds: [
                        new ErrorEmbed().addFields({
                           name: client.translate(SELECTED_LANG, `${this.LANG_KEY}.error.name`, {
                              emoji: LocaleList[SELECTED_LANG],
                              language: client.translate(SELECTED_LANG, `LANGUAGES.${SELECTED_LANG}`),
                           }),
                           value: client.translate(SELECTED_LANG, `${this.LANG_KEY}.error.value`, {
                              emoji: LocaleList[SELECTED_LANG],
                              language: client.translate(SELECTED_LANG, `LANGUAGES.${SELECTED_LANG}`),
                           }),
                        }),
                     ],
                     ephemeral: true,
                  });
               });
         }
      });

      collector.on('end', (collected) => {
         const lastSelected = Array.from(collected.values()).pop();
         // @ts-ignore
         const labelSelected = lastSelected ? languageOptions.find((o) => o.value == lastSelected.values)!.label : undefined;
         // Desactivamos los botones y editamos el mensaje
         return client.utils.message
            .edit(message, radioMsg, {
               ...messages[paginaActual],
               content:
                  // @ts-ignore
                  lastSelected && lastSelected.values
                     ? // @ts-ignore
                       `${client.allemojis.yes} **\`${labelSelected}\`**`
                     : client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.collector.expire'),
               components: client.utils.message.disableComponents(messages[paginaActual]),
            })
            .catch(() => {});
      });
   },
} as Command;