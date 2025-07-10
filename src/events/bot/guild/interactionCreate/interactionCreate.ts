import { Collection } from 'discord.js';
import { SlashCMDHandler } from '../../../../handlers/CommandHandler';
import Client from '../../../../structures/Client';
import { ComponentHandler } from '../../../../handlers/ComponentHandler';

export default async (client: Client, interaction) => {
   if (interaction.guildId && !interaction.guild) return;

   interaction.author = interaction.user ?? (await client.users.fetch(interaction.userId).catch(() => null));
   interaction.user = interaction.author;
   interaction.member ??= await interaction.guild.members.fetch(interaction.user.id).catch(() => null);

   interaction.attachments = new Collection();
   interaction.mentions = new Collection();
   // TODO: interaction.mentions OBLIGATORIO

   // Interaction.guildLocale = client.getGuildLocale(interaction.guildId);
   // here we can execute messageCreate functions...
   if (interaction.isCommand()) return SlashCMDHandler(client, interaction);
   if (
      interaction.isButton() ||
      interaction.isUserContextMenuCommand() ||
      interaction.isMessageContextMenuCommand() ||
      interaction.isAnySelectMenu() ||
      interaction.isModalSubmit()
   )
      return ComponentHandler(client, interaction);
};
