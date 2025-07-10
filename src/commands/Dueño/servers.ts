import Client from '../../structures/Client';
import { Command } from '../../structures/Command';

export default {
   ALIASES: ['serverlist', 'listguilds', 'guilds', 'guildlist'],
   execute(client: Client, message, args, prefix, guildData) {
      const guildsIn = client.guilds.cache
         .sort((a, b) => b?.memberCount - a.memberCount)
         .map(
            (guild) =>
               `\`${guild.name} (${guild.id})\`\n > **${client.translate(guildData.language, `${this.LANG_KEY}.membersText`)}: \`${
                  guild.memberCount
               } ${client.translate(guildData.language, `${this.LANG_KEY}.membersText`).toLowerCase()}\`**\n> **${client.translate(
                  guildData.language,
                  `${this.LANG_KEY}.ownerText`,
               )}: <@${guild.ownerId}> | \`${guild.ownerId}\`**\n> **${client.translate(
                  guildData.language,
                  `${this.LANG_KEY}.createdAtText`,
               )}: <t:${client.utils.general.toUnixTimestamp(guild.createdAt)}>**\n\n`,
         );
      client.utils.message.pagination(
         message,
         guildData.language,
         guildsIn,
         client.translate(guildData.language, `${this.LANG_KEY}.pagination.title`, {name: client.user!.username, size: guildsIn.length}),
         5,
      );
   },
} as Command;

/*
╔═════════════════════════════════════════════════════╗
║    || - || Desarollado por dewstouh#1088 || - ||    ║
║    ----------| discord.gg/MBPsvcphGf |----------    ║
╚═════════════════════════════════════════════════════╝
*/
