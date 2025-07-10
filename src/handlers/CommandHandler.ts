import {
   PermissionFlagsBits,
   PermissionsBitField,
   Collection,
   ChatInputCommandInteraction,
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle,
   Locale,
} from 'discord.js';
import { ErrorEmbed, Embed } from '../extenders/discord/Embed';
import {
   cooldownCategoriesHigh,
   cooldownCommandsHigh,
   defaultCooldownMsHigh,
   cooldownCategories,
   cooldownCommands,
   defaultCooldownMs,
   maximumCoolDownCommands,
} from '../config/Cooldowns';
import CategorySettings from '../config/categories';
import Client from '../structures/Client';
import { Command } from '../structures/Command';
import { Component } from '../typings/component';
import { isCommand } from '../typings/command';
import { buildCategoryEmbeds } from '../commands/Info/Bot/help';

const type = 'COMMANDS';

export async function SlashCMDHandler(client: Client, interaction: ChatInputCommandInteraction) {
   const GUILD_DATA = await client.db.getGuildData(interaction.guild!.id);
   const USER_DATA = await client.db.getUserData(interaction.user.id);
   const PLAYER = client.lavalink.getPlayer(interaction.guildId!);

   if (!client.utils.perms.checkPerms(interaction.channel, [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel])) {
      return interaction.reply({
         embeds: [
            new ErrorEmbed().addField(
               client.translate(GUILD_DATA.language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.noSendMsgPerms.name`),
               client.translate(GUILD_DATA.language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.noSendMsgPerms.value`),
            ),
         ],
         ephemeral: true,
      });
   }

   const slashCmd =
      client.commands.get(interaction.commandName) ||
      client.commands.get(interaction.commandName + interaction?.options?.getSubcommand()) ||
      client.commands.get(interaction.commandName + interaction?.options?.getSubcommandGroup() + interaction?.options?.getSubcommand());

   if (!client.utils.perms.checkPerms(interaction.channel, [PermissionFlagsBits.EmbedLinks])) {
      return interaction.reply({
         embeds: [
            new ErrorEmbed().addField(
               client.translate(GUILD_DATA.language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.noEmbedPerms.name`),
               client.translate(GUILD_DATA.language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.noEmbedPerms.value`),
            ),
         ],
         ephemeral: true,
      });
   }

   if (slashCmd) {
      try {
         if (
            !isAllowedToExecute(client, slashCmd, type, interaction, GUILD_DATA.language, {
               userLevel: USER_DATA.level,
               isUserPremium: USER_DATA.isPremium,
               isGuildPremium: GUILD_DATA.isPremium,
            })
         )
            return;

         const args: string[] = [];

         for (const option of interaction.options.data) {
            if (option?.options) {
               option.options?.forEach((x) => {
                  if (x.options) {
                     x.options?.forEach((o) => {
                        args.push(o.value as string);
                     });
                  }
                  if (x.value) args.push(x.value as string);
               });
            } else if (option.value) args.push(option.value as string);
         }

         return slashCmd.execute!(client, interaction, args, '/', GUILD_DATA, USER_DATA, PLAYER);
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
         console.error(e);
         if (interaction?.replied) {
            return interaction.channel && 'send' in interaction.channel ? interaction.
               channel.send({
                  embeds: [
                     new ErrorEmbed().addField(
                        client.translate(GUILD_DATA.language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.cmdError.name`, {
                           cmdName: slashCmd?.NAME || '???',
                        }),
                        `>>> \`\`\`\n${String(e?.message ?? e).substring(0, 500)}\n\`\`\``.substring(0, 1000),
                     ),
                  ],
               })
               .catch(() => null) : null;
         }
         return (
            interaction
               .reply({
                  embeds: [
                     new ErrorEmbed().addField(
                        client.translate(GUILD_DATA.language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.cmdError.name`, {
                           cmdName: slashCmd?.NAME || '???',
                        }),
                        `>>> \`\`\`\n${String(e?.message ?? e).substring(0, 500)}\n\`\`\``.substring(0, 1000),
                     ),
                  ],
                  ephemeral: true,
               })
               // eslint-disable-next-line require-await
               .catch(async () => {
                  return interaction.channel && 'send' in interaction.channel ? interaction.channel.send({
                     embeds: [
                        new ErrorEmbed().addField(
                           client.translate(GUILD_DATA.language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.cmdError.name`, {
                              cmdName: slashCmd?.NAME || '???',
                           }),
                           `>>> \`\`\`\n${String(e?.message ?? e).substring(0, 500)}\n\`\`\``.substring(0, 1000),
                        ),
                     ],
                  }) : null;
               })
         );
      }
   }
}

export async function MessageCMDHandler(client: Client, message) {
   const GUILD_DATA = await client.db.getGuildData(message.guild.id);
   const USER_DATA = await client.db.getUserData(message.author.id);
   const PLAYER = client.lavalink.getPlayer(message.guild.id);
   const PREFIX = GUILD_DATA.prefix;
   const prefixRegex = new RegExp(
      `^(<@!?${
         client.user!.id
      }>|${PREFIX.escape()}|${client.user!.username.escape()}|${client.user!.username.toLowerCase()}|${client.user!.tag.escape()}|${client.user!.tag.toLowerCase()}|${
         client.user!.id
      }${
         (process.env.OWNER_IDS.split(' ').includes(message.author.id) && USER_DATA.noPrefixMode) ||
         (USER_DATA.isPremium && USER_DATA.noPrefixMode)
            ? `|${''}`
            : ''
      })\\s*`,
   );
   if (!prefixRegex.test(message.content)) return;
   const [, matchedPrefix] = message.content.match(prefixRegex);

   const ARGS = message.content.slice(matchedPrefix.length).trim().split(/ +/);
   const CMD = ARGS?.shift()?.toLowerCase();

   if (CMD.length === 0) {
      const helpCmdMention = client.commands.get('infobothelp')?.MENTION;
      if (matchedPrefix.includes(client.user!.id))
         return message
            .reply({
               embeds: [
                  new Embed().addField(
                     client.translate(GUILD_DATA.language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.botMention.name`, {
                        botName: client.user!.username,
                     }),
                     client.translate(GUILD_DATA.language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.botMention.value`, {
                        prefix: PREFIX,
                        helpCmdMention: helpCmdMention?.includes('commandId') ? `\`/info bot help\`` : helpCmdMention,
                     }),
                  ),
               ],
            })
            .catch(() => {});
      return;
   }

   // console.log(`Search - ${Date.now()}`);

   // BEST. WAY. EVER
   const COMANDO = client.commands.find((c) => {
      const C_LANG_KEYS = c.getLangKeys(GUILD_DATA.language);
      const findByNoCategory = C_LANG_KEYS.includes(CMD?.toLowerCase());
      const findByCategory = C_LANG_KEYS.includes(`${CMD?.toLowerCase()} ${ARGS?.[0]?.toLowerCase()}`);
      const findBySubCategory = C_LANG_KEYS.includes(`${CMD?.toLowerCase()} ${ARGS?.[0]?.toLowerCase()} ${ARGS?.[1]?.toLowerCase()}`);

      if (findByNoCategory) return true;
      if (findByCategory) return (ARGS?.shift(), true);
      if (findBySubCategory) return (ARGS?.splice(0, 2), true);
   });

   if (COMANDO) {
      // console.log(`Found - ${Date.now()}`);
      try {
         if (
            !isAllowedToExecute(client, COMANDO, type, message, GUILD_DATA.language, {
               userLevel: USER_DATA.level,
               isUserPremium: USER_DATA.isPremium,
               isGuildPremium: GUILD_DATA.isPremium,
            })
         )
            return;

         // console.log(`Execute - ${Date.now()}\n\n\n`);
         return COMANDO.execute!(client, message, ARGS, PREFIX, GUILD_DATA, USER_DATA, PLAYER);
         // OP METHOD TO GET FASTER REPONSES ON NON-ASYNC CMDS
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
         console.error(e);
         if (message?.replied) {
            return message.channel
               .send({
                  embeds: [
                     new ErrorEmbed().addField(
                        client.translate(GUILD_DATA.language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.cmdError.name`, {
                           cmdName: COMANDO?.NAME || '???',
                        }),
                        `>>> \`\`\`\n${String(e?.message ?? e).substring(0, 500)}\n\`\`\``.substring(0, 1000),
                     ),
                  ],
                  ephemeral: true,
               })
               .catch(() => null);
         }
         return message
            .reply({
               embeds: [
                  new ErrorEmbed().addField(
                     client.translate(GUILD_DATA.language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.cmdError.name`, {
                        cmdName: COMANDO?.NAME || '???',
                     }),
                     `>>> \`\`\`\n${String(e?.message ?? e).substring(0, 500)}\n\`\`\``.substring(0, 1000),
                  ),
               ],
               ephemeral: true,
            })
            .catch(() => {
               return message.channel && 'send' in message.channel ? message.channel
                  .send({
                     embeds: [
                        new ErrorEmbed().addField(
                           client.translate(GUILD_DATA.language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.cmdError.name`, {
                              cmdName: COMANDO?.NAME || '???',
                           }),
                           `>>> \`\`\`\n${String(e?.message ?? e).substring(0, 500)}\n\`\`\``.substring(0, 1000),
                        ),
                     ],
                     ephemeral: true,
                  })
                  .catch(() => null) : null;
            });
      }
   }

   const CATEGORY = client.categories.find((c) => {
      return c.getLangKeys(GUILD_DATA.language).includes(`${CMD?.toLowerCase()}`);
   });

   if (CATEGORY) {
      const latestArg = ARGS?.[1] || ARGS?.[0];
      const closestCmdString = client.utils.general.findClosestMatch(latestArg, client.commands.map(c => c.NAME));
      const closestCmd = client.commands.find(c => c.NAME === closestCmdString)!;
      const closestCmdMention = closestCmd?.MENTION?.includes?.("commandId") ? `\`${closestCmd.KEY}\`` : closestCmd.MENTION;
      const categoryEmbeds = buildCategoryEmbeds(client, message, CATEGORY, PREFIX, GUILD_DATA);
      return client.utils.message.paginateEmbeds(message, GUILD_DATA.language, categoryEmbeds, {content: client.translate(GUILD_DATA.language, `COMMON.COMMAND.notFound`, {closestCmd: `\`${closestCmd.NAME}\` - ${closestCmdMention}`, categoryName: `\`${CATEGORY.getKey(GUILD_DATA.language)}\``, mentionedCmd: `\`${latestArg?.toLowerCase()}\``}) });
   }


}

export function isAllowedToExecute(client: Client, command: Command | Component, type, ctx, language, extras) {
   // Si NO cumple con los ajustes de la categoría, return.
   if (isCommand(command) && !checkCategory(client, command, ctx, language, extras)) return false;

   const commandName = command?.NAME;

   // Si NO cumple con los requisitos básicos para ejecutar el comando, return.
   if (
      !hasPassedChecks(ctx, type, command, language, client, commandName, {
         userLevel: extras.userLevel,
         isUserPremium: extras.isUserPremium,
         isGuildPremium: extras.isGuildPremium,
      })
   )
      return false;

   // Si el comando contiene cooldown y el usuario todavía NO ha cumplido con la espera, return.
   if (isOnCooldown(client, command, ctx, type, language, { ...extras })) return false;

   return true;
}

export function isOnCooldown(client: Client, command, ctx, type, language, extras) {
   if (extras.isGuildPremium || extras.isUserPremium) return; // Sin cooldown para usuarios premium
   const [userId, guildId] = [ctx.user.id, ctx.guild.id];
   // Ensuring things
   if (!client.cooldowns.user.has(userId)) client.cooldowns.user.set(userId, new Collection());
   if (!client.cooldowns.guild.has(guildId)) client.cooldowns.guild.set(guildId, new Collection());
   if (!client.cooldowns.global.has(userId)) client.cooldowns.global.set(userId, []);

   const defaultCooldown =
      cooldownCategoriesHigh.includes(command.CATEGORY_NAME) || cooldownCommandsHigh.includes(command.NAME)
         ? defaultCooldownMsHigh
         : cooldownCategories.includes(command.CATEGORY_NAME) || cooldownCommands.includes(command.NAME)
         ? defaultCooldownMs
         : 0;

   // COOLDOWN USUARIO
   if (command.COOLDOWN?.user) {
      const userCooldowns = client.cooldowns.user.get(userId);
      const commandCooldown = userCooldowns!.get(command.NAME) || 0;
      if (commandCooldown > Date.now()) {
         return (
            ctx
               .reply({
                  ephemeral: true,
                  embeds: [
                     new Embed().setColor(process.env.COOLDOWN_COLOR).addField(
                        client.translate(language, `${type.toUpperCase()}.COOLDOWN.user.name`),
                        client.translate(language, `${type.toUpperCase()}.COOLDOWN.user.value`, {
                           timestamp: `<t:${Math.round(commandCooldown / 1000)}:R>`,
                        }),
                     ),
                  ],
               })
               .catch(() => null),
            true
         );
      }
      userCooldowns!.set(command.NAME, Date.now() + (command.COOLDOWN?.user || 0));
      client.cooldowns.user.set(guildId, userCooldowns!);
   }
   // COOLDOWN SERVIDOR
   if (command.COOLDOWN?.guild ?? defaultCooldown) {
      const guildCooldowns = client.cooldowns.guild.get(guildId);
      const commandCooldown = guildCooldowns!.get(command.NAME) || 0;
      if (commandCooldown > Date.now()) {
         return (
            ctx
               .reply({
                  ephemeral: true,
                  embeds: [
                     new Embed().setColor(process.env.COOLDOWN_COLOR).addField(
                        client.translate(language, `${type.toUpperCase()}.COOLDOWN.guild.name`),
                        client.translate(language, `${type.toUpperCase()}.COOLDOWN.guild.value`, {
                           timestamp: `<t:${Math.round(commandCooldown / 1000)}:R>`,
                        }),
                     ),
                  ],
               })
               .catch(() => null),
            true
         );
      }
      guildCooldowns!.set(command.NAME, Date.now() + (command.COOLDOWN?.guild ?? defaultCooldown));
      client.cooldowns.guild.set(guildId, guildCooldowns!);
   }
   // COOLDOWN GLOBAL (X COMANDOS CADA X TIEMPO)
   const globalCooldowns = client.cooldowns.global.get(userId);
   const allCools = [...(<[]>globalCooldowns), Date.now()].filter((x) => Date.now() - x <= maximumCoolDownCommands.time);
   if (allCools.length > maximumCoolDownCommands.amount) {
      const remainingMs = allCools[0] + maximumCoolDownCommands.time - Date.now();
      return (
         ctx
            .reply({
               ephemeral: true,
               embeds: [
                  new Embed().setColor(process.env.COOLDOWN_COLOR).addField(
                     client.translate(language, `${type.toUpperCase()}.COOLDOWN.global.name`),
                     client.translate(language, `${type.toUpperCase()}.COOLDOWN.global.value`, {
                        maxCommands: maximumCoolDownCommands.amount,
                        cooldown: client.utils.general
                           .duration(maximumCoolDownCommands.time, language)
                           .map((d) => d)
                           .join(', '),
                        remaining: client.utils.general
                           .duration(remainingMs, language, true)
                           .map((d) => `\`${d}\``)
                           .join(', '),
                     }),
                  ),
               ],
            })
            .catch(() => null),
         true
      );
   }
   client.cooldowns.global.set(userId, allCools);

   return false;
}

export function checkCategory(
   client: Client,
   command: Command,
   ctx,
   language: Locale,
   extras: { userLevel: number; isUserPremium: boolean; isGuildPremium: boolean },
) {
   const type = 'CATEGORIES';
   const KEY_SPLITTED = command?.KEY?.replace('/', '').split(' ');
   const KEY_CAT = KEY_SPLITTED?.length >= 2 ? `${KEY_SPLITTED[0].capitalizeFirstChar()}` : '';
   const KEY_CAT_SUB = KEY_SPLITTED?.length >= 3 ? `${KEY_SPLITTED[0].capitalizeFirstChar()} ${KEY_SPLITTED[1].capitalizeFirstChar()}` : '';

   const targetKey = KEY_CAT_SUB || KEY_CAT;
   // Si hay settings de la sub cat, entonces se aplican los de la sub cat, si no, los normales
   const categorySettings = CategorySettings[KEY_CAT_SUB] || CategorySettings[KEY_CAT];

   if (categorySettings && !hasPassedChecks(ctx, type, categorySettings, language, client, targetKey, extras)) return false;
   return true;
}

function hasPassedChecks(
   ctx,
   type,
   settings,
   language,
   client: Client,
   executionName,
   extras: { userLevel: number; isUserPremium: boolean; isGuildPremium: boolean },
) {
   if (
      // Si el comando es solo del servidor y NO estamos en un servidor, return.
      isGuildOnly(ctx, type, settings?.GUILD_ONLY, language, client, executionName) ||
      // Si el comando contiene permisos y el usuario NO los cumple, return.
      !hasPermissions(ctx, type, settings?.PERMISSIONS, language, client, executionName) ||
      // Si el comando contiene bot-permisos y el bot NO los cumple, return.
      !hasPermissionsBot(ctx, type, settings?.BOT_PERMISSIONS, language, client, executionName) ||
      // Si el comando es NSFW y no estamos en un canal NSFW, return.
      isNSFW(ctx, type, settings?.NSFW, language, client, executionName) ||
      // Si el comando es premium y el usuario NO es premium, return.
      isPremium(
         ctx,
         type,
         settings?.PREMIUM,
         settings?.USER_PREMIUM,
         settings?.GUILD_PREMIUM,
         extras.isUserPremium,
         extras.isGuildPremium,
         language,
         client,
      ) ||
      // Si el comando tiene un nivel requerido y el usuario NO lo cumple, return.
      !hasRequiredLevel(ctx, type, settings?.LEVEL, extras.userLevel, language, client, executionName) ||
      // Si el comando es solo para dueños y el usuario NO es un dueño del bot, return.
      !isOwner(ctx, type, settings?.OWNER, ctx?.user?.id, language, client, executionName)
   )
      return false;

   return true;
}

/*


Check Command | Component | Category - Settings.


*/

function isGuildOnly(ctx, type, isGuildOnly, language, client: Client, executionName) {
   if (isGuildOnly && !ctx.guild) {
      return (
         ctx
            .reply({
               ephemeral: true,
               embeds: [
                  new ErrorEmbed().addField(
                     client.translate(language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.guildOnly.name`, { executionName }),
                     client.translate(language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.guildOnly.value`, { executionName }),
                  ),
               ],
            })
            .catch(() => null),
         true
      );
   }
   return false;
}

function hasPermissions(ctx, type, permissions, language, client: Client, executionName) {
   if (permissions?.length) {
      if (
         ctx.user.id !== ctx.guild?.ownerId &&
         !ctx?.member?.permissions?.has?.(PermissionFlagsBits.Administrator) &&
         permissions.some((x) => !ctx?.member?.permissions?.has?.(x))
      ) {
         return (
            ctx
               .reply({
                  ephemeral: true,
                  embeds: [
                     new ErrorEmbed().addField(
                        client.translate(language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.CATEGORY.noUserPerms.name`, {
                           executionName,
                        }),
                        `>>> ${new PermissionsBitField(permissions)
                           .toArray()
                           .map((x) => `\`${client.translate(language, `PERMISSIONS.${x}`)}\``)
                           .join(', ')}`,
                     ),
                  ],
               })
               .catch(() => null),
            false
         );
      }
      return true;
   }
   return true;
}

function hasPermissionsBot(ctx, type, permissions, language, client: Client, executionName) {
   if (permissions?.length) {
      if (
         !ctx?.guild?.members?.me?.permissions?.has?.(PermissionFlagsBits.Administrator) &&
         permissions.some((x) => !ctx?.guild?.members?.me?.permissions?.has?.(x))
      ) {
         return (
            ctx
               .reply({
                  ephemeral: true,
                  embeds: [
                     new ErrorEmbed().addField(
                        client.translate(language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.CATEGORY.noBotPerms.name`, {
                           executionName,
                        }),
                        `>>> ${new PermissionsBitField(permissions)
                           .toArray()
                           .map((x) => `\`${client.translate(language, `PERMISSIONS.${x}`)}\``)
                           .join(', ')}`,
                     ),
                  ],
               })
               .catch(() => null),
            false
         );
      }
      return true;
   }
   return true;
}

function isNSFW(ctx, type, isNsfw, language, client: Client, executionName) {
   if (isNsfw && !ctx?.channel?.nsfw) {
      return (
         ctx
            .reply({
               ephemeral: true,
               embeds: [
                  new ErrorEmbed().addField(
                     client.translate(language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.nsfw.name`, { executionName }),
                     client.translate(language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.nsfw.value`, { executionName }),
                  ),
               ],
            })
            .catch(() => null),
         true
      );
   }
   return false;
}

function isPremium(ctx, type, isCTXPremium, isCTXUserPremium, isCTXGuildPremium, userPremium, guildPremium, language, client: Client) {
   if (isCTXUserPremium && !userPremium) {
      return (
         ctx
            .reply({
               ephemeral: true,
               embeds: [
                  new Embed()
                     .setColor('Aqua')
                     .addField(
                        client.translate(language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.userPremium.name`),
                        client.translate(language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.userPremium.value`),
                     ),
               ],
               components: [
                  new ActionRowBuilder().addComponents(
                     new ButtonBuilder()
                        .setLabel(client.translate(language, 'COMPONENTS.BUTTONS.PREMIUM.label'))
                        .setStyle(ButtonStyle.Link)
                        .setEmoji(client.allemojis.favourite)
                        .setURL(`https://${process.env.WEB_DOMAIN}/premium`),
                  ),
               ],
            })
            .catch(() => null),
         true
      );
   }

   if (isCTXGuildPremium && !guildPremium) {
      return (
         ctx
            .reply({
               ephemeral: true,
               embeds: [
                  new Embed()
                     .setColor('Aqua')
                     .addField(
                        client.translate(language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.guildPremium.name`),
                        client.translate(language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.guildPremium.value`),
                     ),
               ],
               components: [
                  new ActionRowBuilder().addComponents(
                     new ButtonBuilder()
                        .setLabel(client.translate(language, 'COMPONENTS.BUTTONS.PREMIUM.label'))
                        .setStyle(ButtonStyle.Link)
                        .setEmoji(client.allemojis.favourite)
                        .setURL(`https://${process.env.WEB_DOMAIN}/premium`),
                  ),
               ],
            })
            .catch(() => null),
         true
      );
   }

   if (isCTXPremium && !userPremium && !guildPremium) {
      return (
         ctx
            .reply({
               ephemeral: true,
               embeds: [
                  new Embed()
                     .setColor('Aqua')
                     .addField(
                        client.translate(language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.premium.name`),
                        client.translate(language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.premium.value`),
                     ),
               ],
               components: [
                  new ActionRowBuilder().addComponents(
                     new ButtonBuilder()
                        .setLabel(client.translate(language, 'COMPONENTS.BUTTONS.PREMIUM.label'))
                        .setStyle(ButtonStyle.Link)
                        .setEmoji(client.allemojis.favourite)
                        .setURL(`https://${process.env.WEB_DOMAIN}/premium`),
                  ),
               ],
            })
            .catch(() => null),
         true
      );
   }
   return false;
}

function hasRequiredLevel(ctx, type, requiredLevel, userLevel, language, client: Client, executionName) {
   if (requiredLevel) {
      const LEVEL = requiredLevel;
      if (userLevel < LEVEL) {
         return (
            ctx
               .reply({
                  ephemeral: true,
                  embeds: [
                     new ErrorEmbed().addField(
                        client.translate(language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.level.name`, {
                           executionName,
                           level: LEVEL,
                           userLevel: userLevel,
                        }),
                        client.translate(language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.level.value`, {
                           executionName,
                           level: LEVEL,
                           userLevel: userLevel,
                        }),
                     ),
                  ],
               })
               .catch(() => null),
            false
         );
      }
   }
   return true;
}

function isOwner(ctx, type, isOwner, userId, language, client: Client, executionName) {
   if (isOwner && !process.env.OWNER_IDS.split(' ').includes(userId)) {
      return (
         ctx
            .reply({
               ephemeral: true,
               embeds: [
                  new ErrorEmbed().addField(
                     client.translate(language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.ownerOnly.name`, {
                        executionName,
                        owners: process.env.OWNER_IDS.split(' ')
                           .map((x) => `<@${x}>`)
                           .join(', '),
                     }),
                     client.translate(language, `${type.toUpperCase()}.PERMISSIONS.HANDLER.ownerOnly.value`, {
                        executionName,
                        owners: process.env.OWNER_IDS.split(' ')
                           .map((x) => `<@${x}>`)
                           .join(', '),
                     }),
                  ),
               ],
            })
            .catch(() => null),
         false
      );
   }
   return true;
}
