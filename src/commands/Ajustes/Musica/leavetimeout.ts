import { Embed, ErrorEmbed } from '../../../extenders/discord/Embed';
import Client from '../../../structures/Client';
import { Command } from '../../../structures/Command';
import ms from 'ms';
export default {
   USAGE: '<Tiempo>',
   PERMISSIONS: ['ManageGuild'],
   BOT_PERMISSIONS: ['ManageGuild'],
   OPTIONS: [
      {
         STRING: {
            REQUIRED: true,
         },
      },
   ],
   execute(client: Client, message, args, prefix, guildData) {
         const time = args[0];
         if(!time) return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                client.translate(guildData.language, `${this.LANG_KEY}.error.noargs.name`),
                client.translate(guildData.language, `${this.LANG_KEY}.error.noargs.value`, {
                  prefix, cmdName: this.NAME, usage: this.USAGE,
               }),
               ),
            ],
         });
   
         let msTime = parseInt(ms(time));
         if(!msTime) return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                client.translate(guildData.language, `${this.LANG_KEY}.error.invalid.name`),
                client.translate(guildData.language, `${this.LANG_KEY}.error.invalid.value`, {
                  prefix, cmdName: this.NAME, usage: this.USAGE,
               }),
               ),
            ],
         });
   
         if(msTime < 0) msTime = 0;
         if(msTime > 2 * 60 * 60 * 1000) return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                client.translate(guildData.language, `${this.LANG_KEY}.error.tooLong.name`),
                client.translate(guildData.language, `${this.LANG_KEY}.error.tooLong.value`, {
                  prefix, cmdName: this.NAME, usage: this.USAGE,
               }),
               ),
            ],
         }); 
   
         const mappedTime = client.utils.general.duration(msTime, guildData.language).map(d => `\`${d}\``).join(", ")

      guildData
         .updateOne({ 'music.leaveTimeout': msTime })
         .then(() => {
            return message.reply({
               embeds: [
                  new Embed()
                  .addField(
                    client.translate(guildData.language, `${this.LANG_KEY}.success.name`, {mappedTime}),
                    client.translate(guildData.language, `${this.LANG_KEY}.success.value`, {mappedTime}),
                  )
               ],
               ephemeral: true,
            });
         })
         .catch(() => {
            return message.reply({
               embeds: [
                  new ErrorEmbed().addFields({
                     name: client.translate(guildData.language, `${this.LANG_KEY}.error.name`),
                     value: client.translate(guildData.language, `${this.LANG_KEY}.error.value`, {
                        prefix, cmdName: this.NAME, usage: this.USAGE,
                     }),
                  }),
               ],
               ephemeral: true,
            });
         });
   },
} as Command;
