import { TextChannel } from 'discord.js';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import Client from '../../structures/Client';
import { Command } from '../../structures/Command';
export default {
   PERMISSIONS: ['ManageMessages'],
   BOT_PERMISSIONS: ['ManageMessages'],
   OPTIONS: [
      {
         NUMBER: {
            REQUIRED: true,
         },
      },
   ],
   USAGE: '<Cantidad>',
   async execute(client: Client, message, args, prefix, guildData) {
      const amountToDelete = args[0];
      if (!amountToDelete)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `COMMON.TEXTS.noMember.noargs.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.norags.value`, {
                     prefix, cmdName: this.NAME, cmdUsage: this.USAGE,
                  }),
               ),
            ],
         });


      if(isNaN(amountToDelete) || amountToDelete % 1 != 0 || amountToDelete < 1 || amountToDelete > 500){
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.invalid.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.invalid.value`, {
                     prefix, cmdName: this.NAME, cmdUsage: this.USAGE,
                  }),
               ),
            ],
         });
      }

      let toDelete = amountToDelete;
      let deleted = 0;
      const cooldownBetweenBulkDelete = 2500; // 2.5 s between 100 deletes
      const startedDeletion = Date.now();

      while(toDelete > 0){
         const messagesToBulkDelete = Math.min(100, toDelete)
         const messages = await message.channel.messages.fetch({limit: messagesToBulkDelete});
         if (messages.size === 0) break;
         await (message.channel as TextChannel).bulkDelete(messages).catch(() => {});

         toDelete -= messages.size;
         deleted += messages.size;
         if(toDelete >= 100) await client.utils.general.delay(cooldownBetweenBulkDelete);
      }

      const finishedDeletion = Date.now();

      return message.reply({
         embeds: [
            new Embed()
            .setDescription(client.translate(guildData.language, `${this.LANG_KEY}.success.description`, {amount: deleted, duration: `${client.utils.general.duration(finishedDeletion-startedDeletion, guildData.language, true).map(t => `\`${t}\``).join(", ")}`}))
         ]
      })
      .then((msg) => {
         setTimeout(() => {
            return msg.delete();
         }, 5000)
      })
   },
} as Command;
