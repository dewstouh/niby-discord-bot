import { Command } from '../../structures/Command';
import Client from '../../structures/Client';
import { IUser } from '../../database/schemas/UserSchema';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';

export default {
   USER_PREMIUM: true,
   execute(client: Client, message, args, prefix, guildData, userData: IUser) {
      const toggledNoPrefixMode = !userData.noPrefixMode;
      userData
         .updateOne({ noPrefixMode: toggledNoPrefixMode })
         .then(() => {
            return toggledNoPrefixMode
               ? message.reply({
                    embeds: [
                       new Embed().addField(
                          client.translate(guildData.language, `${this.LANG_KEY}.enabled.name`),
                          client.translate(guildData.language, `${this.LANG_KEY}.enabled.value`, {
                           prefix
                          }),
                       ),
                    ],
                    ephemeral: true,
                 })
               : message.reply({
                    embeds: [
                       new Embed().addField(
                          client.translate(guildData.language, `${this.LANG_KEY}.disabled.name`),
                          client.translate(guildData.language, `${this.LANG_KEY}.disabled.value`, {
                           prefix
                          })
                       ),
                    ],
                    ephemeral: true,
                 });
         })
         .catch((e) => {
            console.error(e);
            return message.reply({
               embeds: [
                  new ErrorEmbed().addFields({
                     name: client.translate(guildData.language, `${this.LANG_KEY}.error.name`),
                     value: client.translate(guildData.language, `${this.LANG_KEY}.error.value`),
                  }),
               ],
               ephemeral: true,
            });
         });
   },
} as Command;
