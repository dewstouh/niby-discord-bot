import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import Client from '../../structures/Client';
import { Command } from '../../structures/Command';

export default {
   ALIASES: ['leaveguild', 'guildleave', 'serverleave'],
   OPTIONS: [
      {
         STRING: {
            REQUIRED: true,
         },
      },
   ],
   USAGE: "<idServidor>",
   execute(client: Client, message, args, prefix, guildData) {
      const guildToLeave = client.guilds.cache.get(args[0]);
      if (!guildToLeave)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                client.translate(guildData.language, `${this.LANG_KEY}.error.notfound.name`),
                client.translate(guildData.language, `${this.LANG_KEY}.error.notfound.value`)
               ),
            ],
         });
      guildToLeave
         .leave()
         .then(() => {
            return message.reply({
               embeds: [new Embed().setDescription(client.translate(guildData.language, `${this.LANG_KEY}.description.success`, {
                  guildToLeave: guildToLeave.name
               }))],
            });
         })
         .catch((e) => {
            console.error(e);
            return message.reply({
               embeds: [new Embed().setDescription(client.translate(guildData.language, `${this.LANG_KEY}.description.error`, {
                  guildToLeave: guildToLeave.name
               }))],
            });
         });
   },
} as Command;

/*
╔═════════════════════════════════════════════════════╗
║    || - || Desarollado por dewstouh#1088 || - ||    ║
║    ----------| discord.gg/MBPsvcphGf |----------    ║
╚═════════════════════════════════════════════════════╝
*/
