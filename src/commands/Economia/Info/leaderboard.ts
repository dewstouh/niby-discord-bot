import { Command } from '../../../structures/Command';
import { Embed } from '../../../extenders/discord/Embed';
import Client from '../../../structures/Client';
import UserSchema from '../../../database/schemas/UserSchema';
const medallas = {
   1: '🥇',
   2: '🥈',
   3: '🥉',
};

export default {
   DESCRIPTION: 'Consulta el top 10 usuarios más ricos',
   ALIASES: ['lb', 'top10'],
   async execute(client: Client, message, args, prefix, guildData) {
      const lbCacheMap = client.cache.get('coins-lb');

      if (lbCacheMap) return message.reply({
        embeds: [
           new Embed()
           .setDescription(">>> " + lbCacheMap.join(" "))
           .setFooter({text: client.translate(guildData.language, `${this.LANG_KEY}.footer`), iconURL: message.guild.iconURL()})
       ],
     });

      const topUsers = await UserSchema.find()
         .sort({ coins: -1 }) // Ordenar por coins en orden descendente
         .limit(10); // Limitar a los 5 primeros resultados

      const textPromises = await topUsers.map(async (u, i) => {
         return `- ${medallas[i + 1] ?? ''} \`${i + 1}\` - <@${u.userId}> *\`${
            (await client.users.fetch(u.userId)).username
         }\`*\n:coin: **${client.translate(guildData.language, `${this.LANG_KEY}.coins`)}:** \`${u.coins}\`\n\n`;
      });

      const text = await Promise.all(textPromises);

      const cooldownExpire = 2 * 60 * 60 * 1000;
      client.cache.set('coins-lb', text, cooldownExpire);

      return message.reply({
        embeds: [
           new Embed()
           .setDescription(">>> " + text.join(" "))
           .setFooter({text: client.translate(guildData.language, `${this.LANG_KEY}.footer`), iconURL: message.guild.iconURL()})
       ],
     });
   },
} as Command;
