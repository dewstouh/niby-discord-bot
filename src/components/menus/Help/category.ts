import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import help, { getHelpMessage, buildCategoryEmbeds } from '../../../commands/Info/Bot/help';
import Client from '../../../structures/Client';
import { Category } from '../../../structures/Category';
import { SubCategory } from '../../../structures/SubCategory';
import { ErrorEmbed } from '../../../extenders/discord/Embed';
import { Component } from '../../../typings/component';
export default {
   async execute(client: Client, interaction, args, guildData) {
      const executorId = args[0];
      const prefix = args[1];

      if (interaction.user.id !== executorId) return help.execute!(client, interaction, [], prefix, guildData);

      const isShowingSlash = prefix == '/';
      const areKeysShown = true;

      const getPaginationRow = (embedsLength) => {
         return new ActionRowBuilder().addComponents([
            new ButtonBuilder()
               .setStyle(ButtonStyle.Secondary)
               .setCustomId('Atrás')
               .setEmoji(client.allemojis.flechaizq)
               .setLabel(client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.message.buttons.back'))
               .setDisabled(embedsLength < 2),
            new ButtonBuilder()
               .setStyle(ButtonStyle.Primary)
               .setCustomId('Inicio')
               .setEmoji('🏠')
               .setLabel(client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.message.buttons.home'))
               .setDisabled(embedsLength < 2),
            new ButtonBuilder()
               .setStyle(ButtonStyle.Secondary)
               .setCustomId('Avanzar')
               .setEmoji(client.allemojis.flechader)
               .setLabel(client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.message.buttons.forward'))
               .setDisabled(embedsLength < 2),
            new ButtonBuilder()
               .setStyle(ButtonStyle.Secondary)
               .setCustomId('Página')
               .setEmoji('🔢')
               .setLabel(client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.message.buttons.page'))
               .setDisabled(embedsLength < 2),
         ]);
      };

      const getButtonRow = (showSlash, showKeys) => {
         return new ActionRowBuilder().addComponents([
            new ButtonBuilder()
            .setLabel(client.translate(guildData.language, `${this.LANG_KEY}.buttons.goBack`))
            .setStyle(ButtonStyle.Secondary).setCustomId('back-home'),

            new ButtonBuilder()
               .setLabel(showSlash ? client.translate(guildData.language, `${this.LANG_KEY}.buttons.showSlash`) : client.translate(guildData.language, `${this.LANG_KEY}.buttons.showPrefix`, {prefix: guildData.prefix}))
               .setStyle(ButtonStyle.Primary)
               .setCustomId('toggle-slash'),

            new ButtonBuilder()
               .setLabel(showKeys ? client.translate(guildData.language, `${this.LANG_KEY}.buttons.fullFormat`) : client.translate(guildData.language, `${this.LANG_KEY}.buttons.shortFormat`))
               .setStyle(ButtonStyle.Primary)
               .setCustomId('toggle-format')
               .setDisabled(!showSlash),
         ]);
      };

      interaction.message.components[0].components[0].data.custom_id = 'MenuCollector-Category';
      const NOMBRE_CATEGORIA = interaction.values[0];
      const categoria = client.categories.find((CATEGORIA) => CATEGORIA.DEFAULT_NAME === NOMBRE_CATEGORIA)!;
      const categoryEmbeds = buildCategoryEmbeds(client, interaction, categoria, prefix, guildData);
      const updatedMsg = await interaction.update({
         embeds: [
            categoryEmbeds[0].setFooter({
               text: client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.message.embed.footer', {
                  page: 1,
                  pages: categoryEmbeds.length,
               }),
            }),
         ],
         components: [
            interaction.message.components[0],
            getPaginationRow(categoryEmbeds.length),
            getButtonRow(!isShowingSlash, !areKeysShown),
         ],
         ephemeral: true,
         fetchReply: true,
      });

      const collector = await updatedMsg.createMessageComponentCollector({
         filter: (i) => (i.isButton() || i.isStringSelectMenu()) && i.user && i.message.author.id == client.user!.id,
         time: 1 * 60 * 1000,
      });

      let collectorIsShowingSlash = isShowingSlash;
      let collectorAreKeysShown = areKeysShown;
      let collectorCategory: Category | SubCategory = categoria;
      let collectorPage = 0;
      let collectorEmbeds = categoryEmbeds;

      collector.on('collect', async (i) => {
         if (i?.user?.id !== executorId) return help.execute!(client, i, [], prefix, guildData);
         if (i?.customId == 'back-home') return collector.stop();
         collector.resetTimer();
         if (i?.isButton()) {
            switch (i?.customId) {
               case 'Atrás':
                  {
                     // Resetemamos el tiempo del collector
                     collector.resetTimer();
                     // Si la pagina a retroceder no es igual a la primera pagina entonces retrocedemos
                     if (collectorPage !== 0) {
                        // Resetemamos el valor de pagina actual -1
                        collectorPage -= 1;
                        // Editamos el embeds
                        await i
                           ?.update({
                              embeds: [
                                 collectorEmbeds[collectorPage].setFooter({
                                    text: client.translate(
                                       guildData.language,
                                       'UTILS.MESSAGE.PAGINATION.message.embed.footer',
                                       {
                                          page: collectorPage + 1,
                                          pages: collectorEmbeds.length,
                                       },
                                    ),
                                 }),
                              ],
                              components: i.message.components,
                           })
                           .catch(() => {});
                     } else {
                        // Reseteamos al cantidad de embeds - 1
                        collectorPage = collectorEmbeds.length - 1;
                        // Editamos el embeds
                        await i
                           ?.update({
                              embeds: [
                                 collectorEmbeds[collectorPage].setFooter({
                                    text: client.translate(
                                       guildData.language,
                                       'UTILS.MESSAGE.PAGINATION.message.embed.footer',
                                       {
                                          page: collectorPage + 1,
                                          pages: collectorEmbeds.length,
                                       },
                                    ),
                                 }),
                              ],
                              components: i.message.components,
                           })
                           .catch(() => {});
                     }
                  }
                  break;

               case 'Inicio':
                  {
                     // Resetemamos el tiempo del collector
                     collector.resetTimer();
                     // Si la pagina a retroceder no es igual a la primera pagina entonces retrocedemos
                     collectorPage = 0;
                     await i
                        ?.update({
                           embeds: [
                              collectorEmbeds[collectorPage].setFooter({
                                 text: client.translate(
                                    guildData.language,
                                    'UTILS.MESSAGE.PAGINATION.message.embed.footer',
                                    {
                                       page: collectorPage + 1,
                                       pages: collectorEmbeds.length,
                                    },
                                 ),
                              }),
                           ],
                           components: i.message.components,
                        })
                        .catch(() => {});
                  }
                  break;

               case 'Avanzar':
                  {
                     // Resetemamos el tiempo del collector
                     collector.resetTimer();
                     // Si la pagina a avanzar no es la ultima, entonces avanzamos una página
                     if (collectorPage < collectorEmbeds.length - 1) {
                        // Aumentamos el valor de pagina actual +1
                        collectorPage++;
                        // Editamos el embeds
                        await i
                           ?.update({
                              embeds: [
                                 collectorEmbeds[collectorPage].setFooter({
                                    text: client.translate(
                                       guildData.language,
                                       'UTILS.MESSAGE.PAGINATION.message.embed.footer',
                                       {
                                          page: collectorPage + 1,
                                          pages: collectorEmbeds.length,
                                       },
                                    ),
                                 }),
                              ],
                              components: i.message.components,
                           })
                           .catch(() => {});
                        // En caso de que sea la ultima, volvemos a la primera
                     } else {
                        // Reseteamos al cantidad de embeds - 1
                        collectorPage = 0;
                        // Editamos el embeds
                        await i
                           ?.update({
                              embeds: [
                                 collectorEmbeds[collectorPage].setFooter({
                                    text: client.translate(
                                       guildData.language,
                                       'UTILS.MESSAGE.PAGINATION.message.embed.footer',
                                       {
                                          page: collectorPage + 1,
                                          pages: collectorEmbeds.length,
                                       },
                                    ),
                                 }),
                              ],
                              components: i.message.components,
                           })
                           .catch(() => {});
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
                        .setLabel(
                           client.translate(
                              guildData.language,
                              'UTILS.MESSAGE.PAGINATION.message.modal.options.modalPage.label',
                           ),
                        )
                        .setRequired(true)
                        .setPlaceholder(`1 - ${collectorEmbeds.length}`)
                        .setStyle(TextInputStyle.Short);

                     const MODAL_ROW = new ActionRowBuilder().addComponents(MODAL_PAGE_OPTION);
                     // @ts-ignore
                     MODAL.addComponents(MODAL_ROW);
                     await i?.showModal(MODAL);
                     await i
                        ?.awaitModalSubmit({
                           time: 180e3,
                           filter: (i) => i.user.id === interaction.user.id,
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
                           collectorPage = Number(page - 1);
                           if (page > collectorEmbeds.length - 1) collectorPage = collectorEmbeds.length - 1;
                           if (page < 1) collectorPage = 0;
                           // Editamos el embed
                           await modal
                              ?.update({
                                 embeds: [
                                    collectorEmbeds[collectorPage].setFooter({
                                       text: client.translate(
                                          guildData.language,
                                          'UTILS.MESSAGE.PAGINATION.message.embed.footer',
                                          {
                                             page: collectorPage + 1,
                                             pages: collectorEmbeds.length,
                                          },
                                       ),
                                    }),
                                 ],
                                 components: i.message.components,
                              })
                              .catch(() => {});
                        })
                        .catch(() => {});
                  }
                  break;

               case 'toggle-slash':
                  {
                     collectorIsShowingSlash = !collectorIsShowingSlash;
                     const categoryEmbeds = buildCategoryEmbeds(
                        client,
                        interaction,
                        collectorCategory,
                        collectorIsShowingSlash ? '/' : guildData.prefix,
                        guildData,
                        collectorAreKeysShown,
                     );
                     collectorEmbeds = categoryEmbeds;
                     await i.update({
                        embeds: [
                           collectorEmbeds[collectorPage].setFooter({
                              text: client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.message.embed.footer', {
                                 page: collectorPage + 1,
                                 pages: collectorEmbeds.length,
                              }),
                           }),
                        ],
                        components: [
                           i.message.components[0],
                           i.message.components[1],
                           getButtonRow(!collectorIsShowingSlash, !collectorAreKeysShown),
                        ],
                        ephemeral: true,
                        fetchReply: true,
                     });
                  }
                  break;

               case 'toggle-format':
                  {
                     collectorAreKeysShown = !collectorAreKeysShown;
                     const categoryEmbeds = buildCategoryEmbeds(
                        client,
                        interaction,
                        collectorCategory,
                        collectorIsShowingSlash ? '/' : guildData.prefix,
                        guildData,
                        collectorAreKeysShown,
                     );
                     collectorEmbeds = categoryEmbeds;
                     await i.update({
                        embeds: [
                           collectorEmbeds[collectorPage].setFooter({
                              text: client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.message.embed.footer', {
                                 page: collectorPage + 1,
                                 pages: collectorEmbeds.length,
                              }),
                           }),
                        ],
                        components: [
                           i.message.components[0],
                           i.message.components[1],
                           getButtonRow(!collectorIsShowingSlash, !collectorAreKeysShown),
                        ],
                        ephemeral: true,
                        fetchReply: true,
                     });
                  }
                  break;

               default:
                  break;
            }
         }

         if (i?.isStringSelectMenu()) {
            collectorCategory = client.categories.find((c) => c.DEFAULT_NAME === i.values[0])!;
            const categoryEmbeds = buildCategoryEmbeds(
               client,
               interaction,
               collectorCategory,
               collectorIsShowingSlash ? '/' : guildData.prefix,
               guildData,
               collectorAreKeysShown,
            );
            collectorEmbeds = categoryEmbeds;
            collectorPage = 0;
            await i.update({
               embeds: [
                  categoryEmbeds[0].setFooter({
                     text: client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.message.embed.footer', {
                        page: collectorPage + 1,
                        pages: collectorEmbeds.length,
                     }),
                  }),
               ],
               components: [
                  interaction.message.components[0],
                  getPaginationRow(categoryEmbeds.length),
                  getButtonRow(!collectorIsShowingSlash, !collectorAreKeysShown),
               ],
               ephemeral: true,
               fetchReply: true,
            });
         }
      });

      collector.on('end', () => {
         return client.utils.message.edit(interaction, interaction.message, getHelpMessage(client, interaction, guildData, prefix));
      });
   },
} as Component;
