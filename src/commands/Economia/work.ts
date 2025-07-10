import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import { Command } from '../../structures/Command';
import Client from '../../structures/Client';
import { ClaimType, IUser } from '../../database/schemas/UserSchema';

export default {
   DESCRIPTION: 'Reclama tu recompensa de monedas mensuales',
   ALIASES: ['mensual'],
   execute(client: Client, message, args, prefix, guildData, userData: IUser) {
      const amount = Math.floor(Math.random() * 1000) + 50;
      // Days * hours * minutes * seconds * milis
      const cooldown = 8 * 60 * 60 * 1000; // 8 hrs

      const worked = userData
         .claimTemporalReward(this.NAME as ClaimType, amount, cooldown)
         .then((claimed) => {
            if (!claimed)
               return message.reply({
                  embeds: [
                     new ErrorEmbed().addField(
                        client.translate(guildData.language, `${this.LANG_KEY}.cooldown.name`),
                        client.translate(guildData.language, `${this.LANG_KEY}.cooldown.value`, {
                           cooldown: `<t:${client.utils.general.toUnixTimestamp(userData[this.NAME])}:R>`,
                        }),
                     ),
                  ],
               });

            const empleoAleatorio: string = (
               client.translate(guildData.language, `${this.LANG_KEY}.journeys`) as unknown as string[]
            ).random();
            return message.reply({
               embeds: [
                  new Embed().addField(
                     client.translate(guildData.language, `${this.LANG_KEY}.success.name`, { job: empleoAleatorio }),
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

      // Not yet
      if (!worked)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.cooldown.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.cooldown.value`, {
                     cooldown: `<t:${client.utils.general.toUnixTimestamp(userData[this.NAME])}:R>`,
                  }),
               ),
            ],
         });

      // @ts-ignore
   },
} as Command;
