import { PermissionFlagsBits } from 'discord.js';
import Client from '../structures/Client';
import { ErrorEmbed } from '../extenders/discord/Embed';
import { isAllowedToExecute } from './CommandHandler';
import { ComponentType, Component } from '../typings/component';

export async function ComponentHandler(client: Client, interaction) {
   const GUILD_DATA = await client.db.getGuildData(interaction.guild!.id);
   const USER_DATA = await client.db.getUserData(interaction.user!.id);
   const PLAYER = client.lavalink.getPlayer(interaction.guildId!);

   const type = (() => {
      if(interaction.isButton()) return "buttons";
      if(interaction.isAnySelectMenu()) return "menus";
      if(interaction.isUserContextMenuCommand() || interaction.isMessageContextMenuCommand()) return "contextmenus";
      if(interaction.isModalSubmit()) return "modals";
   })() as ComponentType;

   if (!client.utils.perms.checkPerms(interaction.channel, [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel])) {
      return interaction.reply({
         embeds: [
            new ErrorEmbed().addField(
               client.translate(GUILD_DATA.language, `COMPONENTS.${type.toUpperCase()}.PERMISSIONS.HANDLER.noSendMsgPerms.name`),
               client.translate(GUILD_DATA.language, `COMPONENTS.${type.toUpperCase()}.PERMISSIONS.HANDLER.noSendMsgPerms.value`),
            ),
         ],
         ephemeral: true,
      });
   }

   const componentName = interaction.customId.split('-{')[0];
   const component = (interaction.commandName ? client[type].get(interaction.commandName) : client[type].get(componentName)) as Component;

   if (!client.utils.perms.checkPerms(interaction.channel, [PermissionFlagsBits.EmbedLinks])) {
      return interaction.reply({
         embeds: [
            new ErrorEmbed().addField(
               client.translate(GUILD_DATA.language, `COMPONENTS.${type.toUpperCase()}.PERMISSIONS.HANDLER.noEmbedPerms.name`),
               client.translate(GUILD_DATA.language, `COMPONENTS.${type.toUpperCase()}.PERMISSIONS.HANDLER.noEmbedPerms.value`),
            ),
         ],
         ephemeral: true,
      });
   }

   if (component) {
      try {
         if (
            !isAllowedToExecute(client, component, `COMPONENTS.${type.toUpperCase()}`, interaction, GUILD_DATA.language, {
               userLevel: USER_DATA.level,
               userPremium: USER_DATA.premium,
            })
         )
            return;
         const args = extractStringsInBraces(interaction.customId);
         // OP METHOD TO GET FASTER REPONSES ON NON-ASYNC CMDS
         return component.execute(client, interaction, args, GUILD_DATA, USER_DATA, PLAYER);
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
         console.error(e);
         if (interaction?.replied) {
            return interaction.channel
               .send({
                  embeds: [
                     new ErrorEmbed().addField(
                        client.translate(GUILD_DATA.language, `COMPONENTS.${type.toUpperCase()}.PERMISSIONS.HANDLER.cmdError.name`, {
                           cmdName: component?.NAME || '???',
                        }),
                        `>>> \`\`\`\n${String(e?.message ?? e).substring(0, 500)}\n\`\`\``.substring(0, 1000),
                     ),
                  ],
                  ephemeral: true,
               })
               .catch(() => null);
         }
         return interaction
            .reply({
               embeds: [
                  new ErrorEmbed().addField(
                     client.translate(GUILD_DATA.language, `COMPONENTS.${type.toUpperCase()}.PERMISSIONS.HANDLER.cmdError.name`, {
                        cmdName: component?.NAME || '???',
                     }),
                     `>>> \`\`\`\n${String(e?.message ?? e).substring(0, 500)}\n\`\`\``.substring(0, 1000),
                  ),
               ],
               ephemeral: true,
            })
            .catch(() => {
               return interaction.channel
                  .send({
                     embeds: [
                        new ErrorEmbed().addField(
                           client.translate(GUILD_DATA.language, `COMPONENTS.${type.toUpperCase()}.PERMISSIONS.HANDLER.cmdError.name`, {
                              cmdName: component?.NAME || '???',
                           }),
                           `>>> \`\`\`\n${String(e?.message ?? e).substring(0, 500)}\n\`\`\``.substring(0, 1000),
                        ),
                     ],
                     ephemeral: true,
                  })
                  .catch(() => null);
            });
      }
   }
}

export function extractStringsInBraces(inputString) {
   const matches = inputString.match(/{(.*?)}/g);
   if (!matches) return [];
   return matches.map((match) => match.slice(1, -1));
}
