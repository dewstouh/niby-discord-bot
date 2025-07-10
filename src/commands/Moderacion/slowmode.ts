import { TextChannel } from 'discord.js';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import Client from '../../structures/Client';
import ms from 'ms';
import { Command } from '../../structures/Command';
export default {
   PERMISSIONS: ['ManageChannels'],
   BOT_PERMISSIONS: ['ManageChannels'],
   OPTIONS: [
      {
         STRING: {
            REQUIRED: true,
         },
      },
      {
         CHANNEL: {
            TYPES: ['GuildText'],
            REQUIRED: false,
         },
      }
   ],
   ALIASES: ['cooldown'],
   USAGE: '<Tiempo> <Canal?>',
   async execute(client: Client, message, args, prefix, guildData) {
      if (!args[0])
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

      const channel = ((await client.utils.general.getChannel(message, args[0])) || message.channel) as TextChannel;

      const time = args.find((arg) => !isNaN(arg[0]));
      if (!time)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.notimeout.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.notimeout.value`),
               ),
            ],
         });

      let msTime = parseInt(ms(time));
      if (isNaN(msTime))
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.invalidtimeout.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.invalidtimeout.value`),
               ),
            ],
         });

      if (msTime < 0) msTime = 0;

      if (msTime > 6 * 60 * 60 * 1000)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.tooHighTimeout.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.tooHighTimeout.value`),
               ),
            ],
         });

      const mappedTime = client.utils.general
         .duration(msTime, guildData.language)
         .map((d) => `\`${d}\``)
         .join(', ');

         const reason = (args.slice(1).join(" ")?.trim() || client.translate(guildData.language, `COMMON.TEXTS.noReason`)) + ` (- ${message.author.username})`;

      channel
         .setRateLimitPerUser(msTime / 1000, reason)
         .then(() => {
            return message.reply({
               embeds: [
                  new Embed()
                     .setAuthor({
                        name: client.translate(guildData.language, `${this.LANG_KEY}.success.author`, { name: channel.name }),
                        iconURL: message.guild.iconURL(),
                     })
                     .addField(
                        client.translate(guildData.language, `${this.LANG_KEY}.success.name`, { channel: channel.toString() }),
                        client.translate(guildData.language, `${this.LANG_KEY}.success.value`, {
                           duration: mappedTime,
                           moderator: message.member.displayName,
                           moderatorMention: message.member.toString(),
                           reason,
                        }),
                     )
                     .setFooter({ text: `Id: ${channel.id}` }),
               ],
            });
         })
         .catch((e) => {
            console.log(e);
            return message.reply({
               embeds: [
                  new ErrorEmbed().addField(
                     client.translate(guildData.language, `${this.LANG_KEY}.error.name`),
                     client.translate(guildData.language, `${this.LANG_KEY}.error.value`),
                  ),
               ],
            });
         });
   },
} as Command;
