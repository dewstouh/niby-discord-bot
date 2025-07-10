import { ClaimType, IUser } from '../../database/schemas/UserSchema';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import Client from '../../structures/Client';
import { Command } from '../../structures/Command';

export default {
   DESCRIPTION: 'Reclama tu recompensa de monedas diarias',
   ALIASES: ['diario'],
   execute(client: Client, message, args, prefix, guildData, userData: IUser) {
      const amount = Math.floor(Math.random() * 250) + 50;
      const cooldown = 24 * 60 * 60 * 1000; // 1 day

      userData
         .claimTemporalReward(this.NAME as ClaimType, amount, cooldown)
         .then((claimed) => {
            if (!claimed) return message.reply({
                  embeds: [
                     new ErrorEmbed().addField(
                        client.translate(guildData.language, `${this.LANG_KEY}.cooldown.name`),
                        client.translate(guildData.language, `${this.LANG_KEY}.cooldown.value`, {
                           cooldown: `<t:${client.utils.general.toUnixTimestamp(userData[this.NAME])}:R>`,
                        }),
                     ),
                  ],
               });

            return message.reply({
               embeds: [
                  new Embed().addField(
                     client.translate(guildData.language, `${this.LANG_KEY}.success.name`),
                     `${client.translate(guildData.language, `${this.LANG_KEY}.success.value`, { claimed })}${
                        userData.isPremium ? '\n' + client.translate(guildData.language, `COMMON.TEXTS.economyPremiumBoost`) : ''
                     }`,
                  ),
               ],
               ephemeral: true,
            });
         })
         .catch((e) => {
            console.error(e);
            return message.reply({
               embeds: [
                  new ErrorEmbed().addField(
                     client.translate(guildData.language, `${this.LANG_KEY}.error.name`),
                     client.translate(guildData.language, `${this.LANG_KEY}.error.value`),
                  ),
               ],
               ephemeral: true,
            });
         });
   },
} as Command;
