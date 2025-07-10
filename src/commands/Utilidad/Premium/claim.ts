import { Command } from '../../../structures/Command';
import Client from '../../../structures/Client';
import { Embed, ErrorEmbed } from '../../../extenders/discord/Embed';
import PremiumKeySchema from '../../../database/schemas/PremiumKeySchema';

export default {
   OPTIONS: [
      {
         STRING: {
            REQUIRED: true,
         },
      },
   ],
   USAGE: "<clave>",
   async execute(client: Client, message, args, prefix, guildData, userData) {
      const key = args[0];
      if (!key)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.noargs.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.noargs.value`),
               ),
            ],
         });

      const keyData = await PremiumKeySchema.findOne({ key });
      if (!keyData)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.notfound.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.notfound.value`),
               ),
            ],
         });

      keyData.type == 'user' ? await userData.addPremium(keyData.expiration) : await guildData.addPremium(keyData.expiration);

      await keyData.deleteOne();

      return message.reply({
         embeds: [
            new Embed().addField(
               client.translate(guildData.language, `${this.LANG_KEY}.success.name`, {
                  userOrGuild:
                     keyData.type == 'user'
                        ? client.translate(guildData.language, `${this.LANG_KEY}.success.user`)
                        : client.translate(guildData.language, `${this.LANG_KEY}.success.guild`),
               }),
               client.translate(guildData.language, `${this.LANG_KEY}.success.value`, {
                  userOrGuild:
                     keyData.type == 'user'
                        ? client.translate(guildData.language, `${this.LANG_KEY}.success.user`)
                        : client.translate(guildData.language, `${this.LANG_KEY}.success.guild`),
                  expiration: client.utils.general.toUnixTimestamp((keyData.type == 'user' ? userData.premium : guildData.premium) + keyData.expiration),
                  keyDuration: client.utils.general
                     .duration(keyData.expiration, guildData.language)
                     .map((d) => `\`${d}\``)
                     .join(', '),
                  premiumDuration: client.utils.general
                     .duration(( ((keyData.type == 'user' ? userData.premium : guildData.premium) + keyData.expiration) - Date.now()), guildData.language)
                     .map((d) => `\`${d}\``)
                     .join(', '),
               }),
            ),
         ],
      });
   },
} as Command;
