import { Command } from '../../../structures/Command';
import { Embed } from '../../../extenders/discord/Embed';
import Client from '../../../structures/Client';
import { GuildMember } from 'discord.js';

export default {
   DESCRIPTION: 'Consulta nuestros stocks',
   ALIASES: ['bal', 'gems', 'wallet', 'money', 'economy', 'coins'],
   OPTIONS: [
      {
         USER: {
            REQUIRED: false,
         },
      },
   ],
   USAGE: "<Usuario?>",
   async execute(client: Client, message, args, prefix, guildData) {
      const member = (await client.utils.general.getMember(message, args[0])) || (message.member as GuildMember);

      const userData = await client.db.getUserData(member.id);
      const xpForNextLevel = userData.getNeededXp();
      const progressBar = client.utils.message.createProgressBar(userData.xp, xpForNextLevel, undefined, ':purple_square:', 7);
      const percentageCompleted = Math.round((userData.xp / xpForNextLevel) * 100);
      return message.reply({
         embeds: [
            new Embed()
               .setAuthor({
                  name: client.translate(guildData.language, `${this.LANG_KEY}.embed.author`, {name: member.displayName}),
                  iconURL: member.user.displayAvatarURL(),
               })
               .addFields([
                  {
                     name: client.translate(guildData.language, `${this.LANG_KEY}.embed.field.gems`),
                     value: client.translate(guildData.language, `${this.LANG_KEY}.embed.value.gems`, {gems: userData.inventory.get('Gemas')}),
                  },
                  {
                     name: client.translate(guildData.language, `${this.LANG_KEY}.embed.field.coins`),
                     value: client.translate(guildData.language, `${this.LANG_KEY}.embed.value.coins`, {coins: userData.coins}),
                  },
                  {
                     name: client.translate(guildData.language, `${this.LANG_KEY}.embed.field.level`),
                     value: client.translate(guildData.language, `${this.LANG_KEY}.embed.value.level`, {level: userData.level, xp: userData.xp, xpForNextLevel}) + `\n${progressBar} **\`${percentageCompleted}%\`**`,
                  },
               ]),
         ],
      });
   },
} as Command;
