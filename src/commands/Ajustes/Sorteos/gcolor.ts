import { Embed, ErrorEmbed } from '../../../extenders/discord/Embed';
import Client from '../../../structures/Client';
import { Command } from '../../../structures/Command';
export default {
   OPTIONS: [
      {
         STRING: {
            REQUIRED: true,
         },
      },
   ],
   USAGE: "<color>",
   execute(client: Client, interaction, args, prefix, guildData) {
      if (!args.length)
         return interaction.reply({
            embeds: [
               new ErrorEmbed().addFields({
                  name: client.translate(guildData.language, `${this.LANG_KEY}.noargs.name`),
                  value: client.translate(guildData.language, `${this.LANG_KEY}.noargs.value`, { prefix, cmdName: this.NAME }),
               }),
            ],
            ephemeral: true,
         });

      if (!isHexColor(args[0]))
         return interaction.reply({
            embeds: [
               new ErrorEmbed().addFields({
                  name: client.translate(guildData.language, `${this.LANG_KEY}.invalidcolor.name`),
                  value: client.translate(guildData.language, `${this.LANG_KEY}.invalidcolor.value`, {
                     prefix,
                     cmdName: this.NAME,
                     color: guildData.giveaway.color,
                  }),
               }),
            ],
            ephemeral: true,
         });

      guildData
         .updateOne({
            'giveaway.color': args[0],
         })
         .then(() => {
            return interaction.reply({
               embeds: [
                  new Embed()
                     .addFields({
                        name: client.translate(guildData.language, `${this.LANG_KEY}.success.name`),
                        value: client.translate(guildData.language, `${this.LANG_KEY}.success.value`, { color: args[0] }),
                     })
                     .setColor(args[0]),
               ],
               ephemeral: true,
            });
         })
         .catch(() => {
            return interaction.reply({
               embeds: [
                  new ErrorEmbed()
                     .addFields({
                        name: client.translate(guildData.language, `${this.LANG_KEY}.error.name`),
                        value: client.translate(guildData.language, `${this.LANG_KEY}.error.value`, { color: args[0] }),
                     })
                     .setColor(args[0]),
               ],
               ephemeral: true,
            });
         });
   },
} as Command;

function isHexColor(args): boolean {
   const reg = /^#([0-9a-f]{3}){1,2}$/i;
   return reg.test(args);
}
