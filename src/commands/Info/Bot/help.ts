import { Embed, ErrorEmbed } from '../../../extenders/discord/Embed';
import { ActionRowBuilder, Collection, StringSelectMenuBuilder } from 'discord.js';
import Client from '../../../structures/Client';
import { Command } from '../../../structures/Command';
import { Category } from '../../../structures/Category';
import { SubCategory } from '../../../structures/SubCategory';
import EmojiList from '../../../config/EmojiList';
// @ts-ignore
import {version} from '../../../../package.json'
export default {
   ALIASES: ['h', 'ayuda', 'bothelp'],
   OPTIONS: [
      {
         STRING: {
            REQUIRED: false,
         },
      },
   ],
   USAGE: '<Comando/Categoría>',
   execute(client: Client, message, args, prefix: string, guildData) {
      const { commands, categories } = getCommandsAndCategories(client, message);

      if (args[0]) {

         const COMANDO = commands.find((c) => {
            const C_LANG_KEYS = c.getLangKeys(guildData.language);
            const findByNoCategory = C_LANG_KEYS.includes(args[0]?.toLowerCase());
            const findByCategory = C_LANG_KEYS.includes(`${args[0]?.toLowerCase()?.toLowerCase()} ${args?.[1]?.toLowerCase()}`)
            const findBySubCategory = C_LANG_KEYS.includes(`${args[0]?.toLowerCase()?.toLowerCase()} ${args?.[1]?.toLowerCase()} ${args?.[2]?.toLowerCase()}`);

            return findByNoCategory || findByCategory || findBySubCategory;
         });

         const CATEGORIA = categories.find((CATEGORIA) => CATEGORIA.getName(guildData.language).toLowerCase().endsWith(args[0].toLowerCase()) || CATEGORIA.DEFAULT_NAME.toLowerCase().endsWith(args[0].toLowerCase()));
         if (COMANDO) {
            const embed = new Embed();

            let description = '';
            const splittedCmdMention = getCmdMention(COMANDO.KEY, COMANDO, guildData.language, prefix, true).split("<")[0].trim();
            const cmdName = splittedCmdMention.endsWith("`") ? splittedCmdMention : `${splittedCmdMention}\``;

            // Nombre del comando y contenido
            description += `### ${client.translate(guildData.language, `${this.LANG_KEY}.command.name`)}\n`;
            description += `> - ${cmdName}\n> - ${COMANDO.MENTION}\n`;

            // Uso del comando
            if (COMANDO.USAGE) {
               description += `### ${client.translate(guildData.language, `${this.LANG_KEY}.command.usage`)}\n`;
               description += `> - ${getCmdMention(COMANDO.KEY, COMANDO, guildData.language, prefix, true)}\n`;
            }

            // Aliases
            if (COMANDO.ALIASES && COMANDO.ALIASES.length >= 1) {
               description += `### ${client.translate(guildData.language, `${this.LANG_KEY}.command.alias`)}\n`;
               description += `${COMANDO.ALIASES.map(
                  (ALIAS) => `> - ${cmdName.slice(0, -1)} ${ALIAS}\``,
               ).join('\n')}\n`;
            }

            // Permisos de usuario
            if (COMANDO.PERMISSIONS && COMANDO.PERMISSIONS.length >= 1) {
               description += `### ${client.translate(guildData.language, `${this.LANG_KEY}.command.userPermissions`)}\n`;
               description += `${COMANDO.PERMISSIONS.map(
                  (PERMISO) => `> - \`${client.translate(guildData.language, `PERMISSIONS.${PERMISO}`)}\``,
               ).join('\n')}\n`;
            }

            // Permisos del bot
            if (COMANDO.BOT_PERMISSIONS && COMANDO.BOT_PERMISSIONS.length >= 1) {
               description += `### ${client.translate(guildData.language, `${this.LANG_KEY}.command.botPermissions`)}\n`;
               description += `${COMANDO.BOT_PERMISSIONS.map(
                  (PERMISO) => `> - \`${client.translate(guildData.language, `PERMISSIONS.${PERMISO}`)}\``,
               ).join('\n')}\n`;
            }

            // Descripción del comando
            if (COMANDO.DESCRIPTION) {
               description += `### ${client.translate(guildData.language, `${this.LANG_KEY}.command.description`, {
                  commandName: COMANDO.NAME,
               })}\n`;
               description += `> *${client.translate(
                  guildData.language,
                  `${COMANDO.LANG_KEY.replace('.execute', '.DESCRIPTION')}`,
               )}*\n`;
            }

            embed.setDescription(description);
            return message.reply({ embeds: [embed] });
         } else if (CATEGORIA) {
            const categoryEmbeds = buildCategoryEmbeds(client, message, CATEGORIA, prefix, guildData);
            return client.utils.message.paginateEmbeds(message, guildData.language, categoryEmbeds)
         }
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.command.notfound.name`, {
                     noEmoji: client.allemojis.no,
                  }),
                  client.translate(guildData.language, `${this.LANG_KEY}.command.notfound.value`, {
                     prefix,
                  }),
               ), // `> Usa \`${prefix}help\` para ver los comandos y categorías!`)
            ],
            ephemeral: true,
         });
      }
      return message.reply(getHelpMessage(client, message, guildData, prefix));
   },
} as Command;

export function buildCategoryEmbeds(
   this: any,
   client: Client,
   message,
   category: SubCategory | Category,
   prefix: string,
   guildData,
   showKeys = true,
): Embed[] {
   type TextOptions = {
      title:string,
      description:string,
      isParent:boolean
   }

   const { commands } = getCommandsAndCategories(client, message);

   const CATEGORIAS = [...category.SUB_CATEGORIES, category];
   const ALL_CATEGORY_COMMANDS = commands.filter(c => c.CATEGORY_NAME === category.DEFAULT_NAME);
   const maxCommandsPerEmbed = 10;

   const embeds: Embed[] = [];

   const texts:TextOptions[] = CATEGORIAS.map((CATEGORIA) => {
      // @ts-ignore
      const COMANDOS_CATEGORIA = commands.filter((c) => c.CATEGORY?.DEFAULT_NAME == CATEGORIA.DEFAULT_NAME);

      const PARENT_CATEGORY = CATEGORIA.PARENT_CATEGORY;
      const CATEGORY_NAME = PARENT_CATEGORY ? `${PARENT_CATEGORY.getName(guildData.language)} - ${CATEGORIA.getName(guildData.language)}` : CATEGORIA.getName(guildData.language);
      const CATEGORY_TITLE = PARENT_CATEGORY ? `[\`${ALL_CATEGORY_COMMANDS.size}\`] - ${PARENT_CATEGORY.EMOJI} ${PARENT_CATEGORY.getName(guildData.language)} ${PARENT_CATEGORY.EMOJI}` : `[\`${ALL_CATEGORY_COMMANDS.size}\`] - ${CATEGORIA.EMOJI} ${CATEGORIA.getName(guildData.language)} ${CATEGORIA.EMOJI}`;
      const CATEGORY_DESCRIPTION = COMANDOS_CATEGORIA.size >= 1 ? `${PARENT_CATEGORY ? client.allemojis.flechalonger+client.allemojis.flechalongerder : client.allemojis.flechaderlong} **${CATEGORY_NAME}**\n${COMANDOS_CATEGORIA.map(
         (cmd) => `- ${getCmdMention(cmd.KEY, cmd, guildData.language, prefix, showKeys)}`,
      ).join('\n')}\n\n` : `${PARENT_CATEGORY ? client.allemojis.flechalonger+client.allemojis.flechalongerder : client.allemojis.flechaderlong} **${CATEGORY_NAME}**\n${client.translate(guildData.language, `COMMANDS.INFO.BOT.help.execute.catEmbed.nocmds`)}\n\n`;

      return ({
         title: CATEGORY_TITLE,
         description: CATEGORY_DESCRIPTION,
         isParent: !!PARENT_CATEGORY
      });
   }).sort((a, b) => b.isParent ? -1 : 1); // Primero los CMDS sin SUB

   for (let i = 0; i < texts.length; i++) {
      const embed = new Embed()
      .setTitle(texts[i].title)
      .setDescription(`${texts[i].description}`)

      while (embed.data.description!.split("\n").length < maxCommandsPerEmbed && texts[i + 1]) {
         embed.data.description += `${texts[i+1].description}`;
         texts.splice(i + 1, 1);
      }

      embeds.push(embed);
   }

   return embeds;
}

export function getHelpMessage(client: Client, message, guildData, prefix: string) {
   const { commands, categories } = getCommandsAndCategories(client, message);
   const LANG_KEY = commands.get('infobothelp')!.LANG_KEY;
   const ayudaEmbed = new Embed()
      .setTitle(client.translate(guildData.language, `${LANG_KEY}.helpEmbed.title`)) // Menú de Ayuda
      .setDescription(
         client.translate(guildData.language, `${LANG_KEY}.helpEmbed.description`, {
            flechaEmoji: client.allemojis.flechader,
            prefix,
         }),
      )
      .addFields([
         {
            name: client.translate(guildData.language, `${LANG_KEY}.helpEmbed.field1.name`, {
               emoji: client.allemojis.command,
            }),
            value: client.translate(guildData.language, `${LANG_KEY}.helpEmbed.field1.value`, {
               commandCount: client.commands.size,
            }),
            inline: true,
         },

         {
            name: client.translate(guildData.language, `${LANG_KEY}.helpEmbed.field2.name`),
            value: `> \`${Math.abs(client.ws.ping)}ms\``,
            inline: true,
         },
         {
            name: client.translate(guildData.language, `${LANG_KEY}.helpEmbed.field3.name`),
            value: `> \`${version}\``,
            inline: true,
         },
         {
            name: client.translate(guildData.language, `${LANG_KEY}.helpEmbed.field4.name`),
            value: `>>> ${categories.map((CATEGORIA) => `${CATEGORIA.EMOJI} ${CATEGORIA.getName(guildData.language)}`).join('\n')}`,
            inline: true,
         },
      ])
      .setThumbnail(client.user!.displayAvatarURL())
      .setFooter({
         text: `Cluster #${client.cluster.id} | Shard #${message.guild.shardId}`,
         iconURL: client.user!.displayAvatarURL(),
      });

   // Definimos la selección de categoría
   const menuRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
         .setCustomId(`help-category-{${message.user.id}}-{${prefix}}`)
         .setMaxValues(1)
         .setMinValues(1)
         .addOptions(
            categories.map((CATEGORIA) => {
               // Definimos el objeto, que será una opción a elegir
               const objeto = {
                  label: CATEGORIA.getName(guildData.language).substring(0, 50),
                  value: CATEGORIA.DEFAULT_NAME.substring(0, 50),
                  description: client.translate(guildData.language, `${LANG_KEY}.menu.category.description`, {amount: commands.filter((c) => c.CATEGORY_NAME === CATEGORIA.DEFAULT_NAME).size, category: CATEGORIA.getName(guildData.language)}).substring(0, 100),
                  emoji: CATEGORIA.EMOJI,
               };
               // Devolvemos el objeto creado y lo añadimos como una opción más
               return objeto;
            }),
         ),
   );
   const helpMenuObject = { embeds: [ayudaEmbed], components: [menuRow], fetchReply: true };
   return helpMenuObject;
}

export function cmdNameOrMention(COMANDO): string {
   if (COMANDO.MENTION.includes('commandId')) return `\`${COMANDO.KEY}\``;
   return `${COMANDO.MENTION}`;
}

function getCmdMention(KEY, COMANDO:Command, language, prefix, showKeys): string {
   const premiumEmoji = (COMANDO.PREMIUM || COMANDO.GUILD_PREMIUM || COMANDO.USER_PREMIUM) ? EmojiList.favourite : "";
   if (!COMANDO) return `\`${KEY}\``.toLowerCase();
   const CMDNAME_LOWER = COMANDO.NAME.toLowerCase();
   if (prefix == '/') {
      if (COMANDO.MENTION.includes('commandId'))
         return (COMANDO.CATEGORY ? `${premiumEmoji} \`${prefix}${COMANDO.CATEGORY?.getKey(language)?.toLowerCase()} ${CMDNAME_LOWER}${COMANDO.USAGE ? ` ${COMANDO.getUsage(language)}\`` : '`'}` : `${premiumEmoji} \`${prefix}${CMDNAME_LOWER}${COMANDO.USAGE ? ` ${COMANDO.getUsage(language)}\`` : '`'}`);
      return `${premiumEmoji} ${COMANDO.MENTION}${COMANDO.USAGE ? ` \`${COMANDO.getUsage(language)}\`` : ''}`;
   }
   return (showKeys && COMANDO.CATEGORY
      ? `${premiumEmoji} \`${prefix}${COMANDO.CATEGORY?.getKey(language)?.toLowerCase()} ${CMDNAME_LOWER}${COMANDO.USAGE ? ` ${COMANDO.getUsage(language)}\`` : '`'}`
      : `${premiumEmoji} \`${prefix}${CMDNAME_LOWER}${COMANDO.USAGE ? ` ${COMANDO.getUsage(language)}\`` : '`'}`);
}

function getCommandsAndCategories(
   client: Client,
   message,
): { commands: Collection<string, Command>; categories: Collection<string, Category | SubCategory> } {
   const ownerIds = process.env.OWNER_IDS.split(' ');
   const userIsOwner = ownerIds.includes(message.author.id);
   const channelIsNSFW = message.channel.nsfw;

   const allowedCommands = client.commands.filter((command) => (!command.OWNER || userIsOwner) && (!command.NSFW || channelIsNSFW));

   const allowedCategories = client.categories.filter((category) => (!category.OWNER || userIsOwner) && (!category.NSFW || channelIsNSFW));

   return { commands: allowedCommands, categories: allowedCategories };
}
