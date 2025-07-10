import { GuildMember } from 'discord.js';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import Client from '../../structures/Client';
import { Command } from '../../structures/Command';
export default {
   PERMISSIONS: ['ModerateMembers'],
   BOT_PERMISSIONS: ['ModerateMembers'],
   OPTIONS: [
      {
         USER: {
            REQUIRED: true,
         },
      },
      {
         STRING: {
            REQUIRED: false,
         },
      },
   ],
   USAGE: '<Miembro> <Razón?>',
   async execute(client: Client, message, args, prefix, guildData) {
      if (!args[0])
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `COMMON.TEXTS.noMember.noargs.name`),
                  client.translate(guildData.language, `COMMON.TEXTS.noMember.noargs.value`),
               ),
            ],
         });

      const member = (await client.utils.general.getMember(message, args[0])) as GuildMember;
      if (!member)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `COMMON.TEXTS.noMember.notfound.name`),
                  client.translate(guildData.language, `COMMON.TEXTS.noMember.notfound.value`),
               ),
            ],
         });

      const reason = (args.slice(1).join(" ")?.trim() || client.translate(guildData.language, `COMMON.TEXTS.noReason`)) + ` (- ${message.author.username})`;

      if(!client.utils.general.canModerate(message, member, guildData.language)) return;

      const punishmentData = {
         guildId: message.guild.id,
         userId: member.id,
         type: this.NAME.capitalizeFirstChar(),
         authorId: message.author.id,
         reason,
         createdAt: new Date(),
         createdTimestamp: Date.now(),
      };

      const memberData = await client.db.getUserData(member.id);
      memberData
         .updateOne({ $push: { punishments: punishmentData } })
         .then(() => {
            member
               .send({
                  embeds: [
                     new Embed()
                        .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL() })
                        .addField(
                           client.translate(guildData.language, `${this.LANG_KEY}.dm.success.name`, { name: message.guild.name }),
                           client.translate(guildData.language, `${this.LANG_KEY}.dm.success.value`, {
                              reason,
                              moderator: message.member.displayName,
                              moderatorMention: message.author.toString(),
                           }),
                        )
                        .setFooter({ text: `Id: ${member.user.id} | Id de Castigo: ${memberData.punishments.length + 1}` }),
                  ],
               })
               .catch(() => {});

            return message.reply({
               embeds: [
                  new Embed()
                     .setAuthor({
                        name: client.translate(guildData.language, `${this.LANG_KEY}.author`, { name: member.displayName }),
                        iconURL: member.user.displayAvatarURL(),
                     })
                     .addField(
                        client.translate(guildData.language, `${this.LANG_KEY}.success.name`, { name: member.displayName }),
                        client.translate(guildData.language, `${this.LANG_KEY}.success.value`, {
                           reason,
                           moderator: message.member.displayName,
                           moderatorMention: message.author.toString(),
                        }),
                     )
                     .setFooter({ text: `Id: ${member.user.id} | ${client.translate(guildData.language, `${this.LANG_KEY}.footer`)}: ${memberData.punishments.length + 1}` }),
               ],
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
            });
         });
   },
} as Command;
