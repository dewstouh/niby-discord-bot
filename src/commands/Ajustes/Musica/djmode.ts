import {
   ActionRowBuilder,
   AnyComponentBuilder,
   ButtonBuilder,
   ButtonStyle,
   PermissionFlagsBits,
   RoleSelectMenuBuilder,
   StringSelectMenuBuilder,
   StringSelectMenuOptionBuilder,
} from 'discord.js';
import { Embed, ErrorEmbed } from '../../../extenders/discord/Embed';
import Client from '../../../structures/Client';
import { Command } from '../../../structures/Command';
export default {
   PERMISSIONS: ['ManageGuild'],
   BOT_PERMISSIONS: ['ManageGuild'],
   ALIASES: ["dj", "djsettings", "djrole", "djroles", "djcmds"],
   async execute(client: Client, message, args, prefix, guildData) {
      let DJ_SETTINGS = guildData.music.djmode;
      const hasManageGuildPermission = message.member.permissions.has(PermissionFlagsBits.ManageGuild);
      const musicCmds = client.commands.filter((cmd) => cmd.CATEGORY_NAME === 'Musica' && cmd.CATEGORY?.DEFAULT_KEY !== 'Musica Info');

      const getConfigurationMessage = (DJ_SETTINGS) => {
         const optionCmds = musicCmds
            .map((cmd) => {
               return new StringSelectMenuOptionBuilder()
                  .setLabel(`${cmd.CATEGORY?.getKey(guildData.language).toLowerCase()} ${cmd.NAME}`)
                  .setValue(cmd.NAME)
                  .setDefault(DJ_SETTINGS?.cmds?.includes(cmd.NAME));
            })
            .reverse();
         const musicCmdsRows: ActionRowBuilder<AnyComponentBuilder>[] = [];

         for (let i = 0; i < optionCmds.length; i += 25) {
            const rowOptions = optionCmds.slice(i, i + 25);
            musicCmdsRows.push(
               new ActionRowBuilder().addComponents(
                  new StringSelectMenuBuilder()
                     .setCustomId(`djmode-cmds${i}`)
                     // .setPlaceholder(`Añade / Elimina Comandos de DJ`)
                     .setPlaceholder(client.translate(guildData.language, `${this.LANG_KEY}.rows.cmd.placeholder`))
                     .setMaxValues(rowOptions.length)
                     .setMinValues(0)
                     .addOptions(rowOptions),
               ),
            );
         }
         return {
            embeds: [
               new Embed()
                  .addField(
                     client.translate(guildData.language, `${this.LANG_KEY}.embed.enabled`),
                     `>>> \`${DJ_SETTINGS?.enabled ? '✅' : '❌'}\``,
                  )
                  // .addField(
                  //    `${client.allemojis.role} Roles de DJ`,
                  //    `>>> ${
                  //       DJ_SETTINGS?.roles?.length >= 1 ? DJ_SETTINGS?.roles.filter((rId) => message.guild.roles.cache.has(rId))?.map((rId) => `<@&${rId}>`).join(', ') : 'No hay roles de DJ'
                  //    }`,
                  // )
                  .addField(
                     client.translate(guildData.language, `${this.LANG_KEY}.embed.djRoles`),
                     `>>> ${
                        DJ_SETTINGS?.roles?.length >= 1
                           ? DJ_SETTINGS?.roles
                                .filter((rId) => message.guild.roles.cache.has(rId))
                                ?.map((rId) => `<@&${rId}>`)
                                .join(', ')
                           : client.translate(guildData.language, `${this.LANG_KEY}.embed.noDjRoles`)
                     }`,
                  )
                  .addField(
                     client.translate(guildData.language, `${this.LANG_KEY}.embed.djCmds`),
                     `>>> ${
                        DJ_SETTINGS?.cmds?.length >= 1
                           ? DJ_SETTINGS?.cmds?.map((cmdName) => `\`${cmdName}\``).join(', ')
                           : client.translate(guildData.language, `${this.LANG_KEY}.embed.noDjCmds`)
                     }`,
                  ),
               // .addField(
               //    `${client.allemojis.command} Comandos de DJ`,
               //    `>>> ${
               //       DJ_SETTINGS?.cmds?.length >= 1
               //          ? DJ_SETTINGS?.cmds?.map((cmdName) => `\`${cmdName}\``).join(', ')
               //          : 'No hay comandos de DJ'
               //    }`,
               // ),

            ],
            components: hasManageGuildPermission
               ? [
                    new ActionRowBuilder().addComponents([
                       new ButtonBuilder()
                          .setLabel(DJ_SETTINGS?.enabled ? client.translate(guildData.language, `COMMON.TEXTS.disable`) :  client.translate(guildData.language, `COMMON.TEXTS.enable`))
                          .setCustomId(`djmode-${DJ_SETTINGS?.enabled ? 'disable' : 'enable'}`)
                          .setStyle(DJ_SETTINGS?.enabled ? ButtonStyle.Danger : ButtonStyle.Success)
                          .setEmoji('🎧'),
                    ]),
                    new ActionRowBuilder().addComponents([
                       new RoleSelectMenuBuilder()
                          .setCustomId('djmode-roles')
                          .setMaxValues(25)
                          .setMinValues(1)
                          .setPlaceholder(client.translate(guildData.language, `${this.LANG_KEY}.rows.role.placeholder`)),
                       // .setPlaceholder(`Añade / Elimina Roles de DJ`),
                    ]),
                    ...musicCmdsRows.slice(0, 3),
                 ]
               : [],
         };
      };
      const configurationPanel = await message.reply(getConfigurationMessage(DJ_SETTINGS));

      const collector = configurationPanel.createMessageComponentCollector({
         filter: (i) => (i.isButton() || i.isAnySelectMenu()) && i.user && i.message.author.id == client.user!.id,
         time: 1 * 60 * 1000,
      });

      collector.on('collect', async (i) => {
         // Si el usuario que hace clic a el botón no es el mismo que ha escrito el comando, le respondemos que solo la persona que ha escrito >>queue puede cambiar de páginas
         if (i?.user.id !== message.user.id)
            return i?.reply({
               content: client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.collector.wrongUser'),
            });

         collector.resetTimer();

         if (i.isButton()) {
            switch (i.customId) {
               case 'djmode-enable':
                  {
                     await guildData
                        .updateOne({
                           'music.djmode.enabled': true,
                        })
                        .then(() => {
                           return i.reply({
                              embeds: [
                                 new Embed()
                                 // .addField(
                                 //    `${client.allemojis.yes} | Se ha activado el modo DJ!`,
                                 //    `>>> **Ahora se utilizarán las limitaciones establecidas para gestionar la reproducción en el servidor!**`,
                                 // ),
                                 .addField(
                                    client.translate(guildData.language, `${this.LANG_KEY}.djMode.enable.name`),
                                    client.translate(guildData.language, `${this.LANG_KEY}.djMode.enable.value`),
                                 ),
                              ],
                           });
                        })
                        .catch(() => {
                           return i.reply({
                              embeds: [
                                 new Embed().addField(
                                    client.translate(guildData.language, `COMMON.TEXTS.error.name`),
                                    client.translate(guildData.language, `COMMON.TEXTS.error.value`),
                                 ),
                              ],
                           });
                        });
                  }
                  break;

               case 'djmode-disable':
                  {
                     await guildData
                        .updateOne({
                           'music.djmode.enabled': false,
                        })
                        .then(() => {
                           return i.reply({
                              embeds: [
                                 new Embed().addField(
                                    client.translate(guildData.language, `${this.LANG_KEY}.djMode.disable.name`),
                                    client.translate(guildData.language, `${this.LANG_KEY}.djMode.disable.value`),
                                 ),
                              ],
                           });
                        })
                        .catch(() => {
                           return i.reply({
                              embeds: [
                                 new Embed().addField(
                                    client.translate(guildData.language, `COMMON.TEXTS.error.name`),
                                    client.translate(guildData.language, `COMMON.TEXTS.error.value`),
                                 ),
                              ],
                           });
                        });
                  }
                  break;

               default:
                  break;
            }
         }
         if (i.isAnySelectMenu()) {
            // DJ MODE - CMDS
            if (i.customId.startsWith('djmode-cmds')) {
               const selectedCmds = i.values;
               const rowCmds: ActionRowBuilder<StringSelectMenuBuilder> = i.message.components.find(
                  (row) => row.components[0].customId === i.customId,
               )!;
               const rowComponents = rowCmds.components[0].options;

               const toAdd = rowComponents
               // @ts-expect-error
                  .filter((option) => selectedCmds.includes(option.value) && !DJ_SETTINGS.cmds.includes(option.value))
               // @ts-expect-error
                  .map((o) => o.value);

               const toRemove = rowComponents
               // @ts-expect-error
                  .filter((option) => !selectedCmds.includes(option.value) && DJ_SETTINGS.cmds.includes(option.value))
               // @ts-expect-error
                  .map((o) => o.value);

               // IM GOD
               const toSet = [...DJ_SETTINGS.cmds.filter((c) => !toRemove.includes(c)), ...toAdd]; // Filter out the ROW UNSELECTED WHILE KEEPING THE SAVED PLUS ADDING THE ROW SELECTED (EZ AF)
               await guildData
                  .updateOne({
                     'music.djmode.cmds': toSet,
                  })
                  .then(() => {
                     return i.reply({
                        embeds: [
                           new Embed()
                           // .addField(
                           //    `${client.allemojis.yes} | Se han añadido ${toAdd.length} comandos y eliminado ${toRemove.length} comandos de DJ!`,
                           //    [
                           //       toAdd.length >= 1 ? `> **Añadido: ${toAdd.map((c) => `\`${c}\``).join(', ')}**` : undefined,
                           //       toRemove.length >= 1 ? `> **Removido: ${toRemove.map((c) => `\`${c}\``).join(', ')}**` : undefined,
                           //    ]
                           //       .filter(Boolean)
                           //       .join('\n'),
                           // ),
                           .addField(
                              client.translate(guildData.language, `${this.LANG_KEY}.djCmds.success`, {addedCmds: toAdd.length, removedCmds: toRemove.length}),
                              [
                                 toAdd.length >= 1 ? client.translate(guildData.language, `${this.LANG_KEY}.djCmds.added`, {addedCmds: toAdd.map((c) => `\`${c}\``).join(', ') }) : undefined,
                                 toRemove.length >= 1 ? client.translate(guildData.language, `${this.LANG_KEY}.djCmds.removed`, {removedCmds: toRemove.map((c) => `\`${c}\``).join(', ')}) : undefined,
                              ]
                                 .filter(Boolean)
                                 .join('\n'),
                           ),
                        ],
                     });
                  })
                  .catch(() => {
                     return i.reply({
                        embeds: [
                           new Embed().addField(
                              client.translate(guildData.language, `COMMON.TEXTS.error.name`),
                              client.translate(guildData.language, `COMMON.TEXTS.error.value`),
                           ),
                        ],
                     });
                  });
            }

            switch (i.customId) {
               case 'djmode-roles':
                  {
                     const selectedCmds = i.values;
                     const toRemove = selectedCmds.filter((c) => DJ_SETTINGS?.roles?.includes(c));
                     const toAdd = selectedCmds.filter((c) => !DJ_SETTINGS?.roles?.includes(c));
                     const toSet = [...DJ_SETTINGS.roles, ...toAdd].filter((rId) => !toRemove.includes(rId) && i.guild.roles.cache.has(rId));

                     if(toSet.length >= 25) return i.reply({
                        embeds: [
                           new ErrorEmbed()
                           // .addField(
                           //    `${client.allemojis.no} | No puedes añadir más de 25 roles de DJ`,
                           //    DJ_SETTINGS?.roles?.length >= 1 ? `>>> **Roles de DJ actuales:** ${DJ_SETTINGS.roles.map((rId) => `<@&${rId}>`).join(", ")}` : `No hay roles de DJ actuales`
                           // )
                           .addField(
                              client.translate(guildData.language, `${this.LANG_KEY}.djRoles.limitExceded`),
                              DJ_SETTINGS?.roles?.length >= 1 ? client.translate(guildData.language, `${this.LANG_KEY}.djRoles.currentDjRoles`, {roles: DJ_SETTINGS.roles.filter((rId) => i.guild.roles.cache.has(rId)).map((rId) => `<@&${rId}>`).join(", ")}) : client.translate(guildData.language, `${this.LANG_KEY}.djRoles.noDjRoles`)
                           )
                        ]
                     })

                     await guildData
                        .updateOne({
                           'music.djmode.roles': toSet,
                        })
                        .then(() => {
                           return i.reply({
                              embeds: [
                                 new Embed()
                                 // .addField(
                                 //    `${client.allemojis.yes} | Se han añadido ${toAdd.length} roles y removido ${toRemove.length} roles de DJ!`,
                                 //    [
                                 //       toAdd.length >= 1 ? `> **Añadido: ${toAdd.map((c) => `<@&${c}>`).join(', ')}**` : undefined,
                                 //       toRemove.length >= 1 ? `> **Removido: ${toRemove.map((c) => `<@&${c}>`).join(', ')}**` : undefined,
                                 //    ]
                                 //       .filter(Boolean)
                                 //       .join('\n'),
                                 // ),
                                 .addField(
                                    client.translate(guildData.language, `${this.LANG_KEY}.djRoles.success`, {addedRoles: toAdd.length, removedRoles: toRemove.length}),
                                       [
                                          toAdd.length >= 1 ? client.translate(guildData.language, `${this.LANG_KEY}.djRoles.added`, {addedRoles: toAdd.map((c) => `<@&${c}>`).join(', ')}): undefined,
                                          toRemove.length >= 1 ? client.translate(guildData.language, `${this.LANG_KEY}.djRoles.removed`, {removedRoles: toRemove.map((c) => `<@&${c}>`).join(', ')}) : undefined,
                                       ]
                                          .filter(Boolean)
                                          .join('\n'),
                                    ),
                              ],
                           });
                        })
                        .catch(() => {
                           return i.reply({
                              embeds: [
                                 new Embed().addField(
                                    client.translate(guildData.language, `COMMON.TEXTS.error.name`),
                                    client.translate(guildData.language, `COMMON.TEXTS.error.value`),
                                 ),
                              ],
                           });
                        });
                  }
                  break;

               default:
                  break;
            }
         }
         guildData = await client.db.getGuildData(message.guild.id);
         DJ_SETTINGS = guildData.music.djmode;
         configurationPanel.edit(getConfigurationMessage(guildData.music.djmode)).catch(() => {});
      });

      collector.on('end', () => {
         // Desactivamos los botones y editamos el mensaje
         return client.utils.message
            .edit(message, configurationPanel, {
               content: client.translate(guildData.language, 'UTILS.MESSAGE.PAGINATION.collector.expire'),
               components: client.utils.message.disableComponents(configurationPanel),
               embeds: configurationPanel.embeds,
            })
            .catch(() => {});
      });
   },
} as Command;
