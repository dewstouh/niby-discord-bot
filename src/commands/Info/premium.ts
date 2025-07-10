import { Command } from '../../structures/Command';
import Client from '../../structures/Client';
import { Embed } from '../../extenders/discord/Embed';
import { ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';

export default {
   execute(client: Client, message, args, prefix, guildData, userData) {
      const embed = new Embed()
      .setThumbnail(client.user!.displayAvatarURL());

      if(guildData.isPremium){
         embed
         .addField(
            client.translate(guildData.language, `${this.LANG_KEY}.fields.guild.premium.name`),
            client.translate(guildData.language, `${this.LANG_KEY}.fields.guild.premium.value`, {
               expiration: client.utils.general.toUnixTimestamp(guildData.premium)
            }),
         )
      } else {
         embed
         .addField(
            client.translate(guildData.language, `${this.LANG_KEY}.fields.guild.notPremium.name`),
            client.translate(guildData.language, `${this.LANG_KEY}.fields.guild.notPremium.value`)
         )
      }


      if(userData.isPremium){
         embed
         .addField(
            client.translate(guildData.language, `${this.LANG_KEY}.fields.user.premium.name`),
            client.translate(guildData.language, `${this.LANG_KEY}.fields.user.premium.value`, {
               expiration: client.utils.general.toUnixTimestamp(userData.premium)
            }),
         )
      } else {
         embed
         .addField(
            client.translate(guildData.language, `${this.LANG_KEY}.fields.user.notPremium.name`),
            client.translate(guildData.language, `${this.LANG_KEY}.fields.user.notPremium.value`)
         )
      }


      return message.reply({
         embeds: [embed],
         components: [
            new ActionRowBuilder()
            .addComponents([
               new ButtonBuilder()
               .setStyle(ButtonStyle.Link)
               .setLabel(client.translate(guildData.language, `${this.LANG_KEY}.button.getPremium`))
               .setURL(`https://${process.env.WEB_DOMAIN}/premium`)
               .setEmoji(client.allemojis.favourite)
            ])
         ]
      })
   },
} as Command;
