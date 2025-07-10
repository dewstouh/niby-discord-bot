import { IGuild } from '../../database/schemas/GuildSchema';
import { IUser } from '../../database/schemas/UserSchema';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import Client from '../../structures/Client';
import { Command } from '../../structures/Command';

export default {
   DESCRIPTION: 'Apuesta una cantidad de monedas',
   ALIASES: ['apostar'],
   OPTIONS: [
      {
         NUMBER: {
            REQUIRED: true,
         },
      },
   ],
   USAGE: '<Cantidad>',
   execute(client: Client, message, args, prefix, guildData:IGuild, userData:IUser) {
      let amount = args[0];
      if (!amount)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.noargs.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.noargs.value`, {
                     prefix, cmdName: this.NAME, cmdUsage: this.USAGE
                  }),
               ),
            ],
            ephemeral: true,
         });

      if (['todo', 'all-in', 'all'].includes(args[0])) {
         amount = userData.coins;
      } else {
         if (isNaN(parseInt(amount)) || parseInt(amount) % 1 != 0 || parseInt(amount) < 0)
            return message.reply({
               embeds: [
                  new ErrorEmbed().addField(
                     client.translate(guildData.language, `${this.LANG_KEY}.error.invalid.name`),
                     client.translate(guildData.language, `${this.LANG_KEY}.error.invalid.value`, {
                        prefix, cmdName: this.NAME, cmdUsage: this.USAGE
                     }),
                  ),
               ],
               ephemeral: true,
            });

         if (parseInt(amount) > userData.coins)
            return message.reply({
               embeds: [
                  new ErrorEmbed().addField(
                     client.translate(guildData.language, `${this.LANG_KEY}.error.notenough.name`),
                     client.translate(guildData.language, `${this.LANG_KEY}.error.notenough.value`, {
                        prefix, cmdName: this.NAME, cmdUsage: this.USAGE
                     }),
                  ),
               ],
               ephemeral: true,
            });
      }

      const posibildades = ['ganar', 'perder'];
      const resultado = posibildades.random();

      if (resultado === 'ganar') {
         const reward = userData.coins + parseInt(amount);
         return userData
            .updateOne({
               coins: reward,
            })
            .then(() => {
               return message.reply({
                  embeds: [
                     new Embed().addField(
                        client.translate(guildData.language, `${this.LANG_KEY}.win.success.name`), // '😎 Has ganado la apuesta!'
                        client.translate(guildData.language, `${this.LANG_KEY}.win.success.value`, { amount })
                     ),
                  ],
                  ephemeral: true,
               });
            })
            .catch(() => {
               return message.reply({
                  embeds: [
                     new Embed().addField(
                        client.translate(guildData.language, `${this.LANG_KEY}.win.error.name`), // '😎 Has ganado la apuesta!'
                        client.translate(guildData.language, `${this.LANG_KEY}.win.error.value`, { amount }), // `>>> **Has conseguido ${client.allemojis.coin} \`${amount} monedas\`!**`,
                     ),
                  ],
                  ephemeral: true,
               });
            });
      }
      return userData
         .updateOne({
            coins: userData.coins - parseInt(amount),
         })
         .then(() => {
            return message.reply({
               embeds: [
                  new ErrorEmbed().addField(
                     client.translate(guildData.language, `${this.LANG_KEY}.lose.success.name`), // '😎 Has ganado la apuesta!'
                     client.translate(guildData.language, `${this.LANG_KEY}.lose.success.value`, {amount}), // `>>> **Has conseguido ${client.allemojis.coin} \`${amount} monedas\`!**`,
                  ),
               ],
               ephemeral: true,
            });
         })
         .catch(() => {
            return message.reply({
               embeds: [
                  new Embed().addField(
                     client.translate(guildData.language, `${this.LANG_KEY}.lose.error.name`), // '😭 Has perdido la apuesta!'
                     client.translate(guildData.language, `${this.LANG_KEY}.lose.error.value`, { amount }), // `>>> **Has perdido ${client.allemojis.coin} \`${amount} monedas\`!**`,
                  ),
                  ,
               ],
               ephemeral: true,
            });
         });
   },
} as Command;
