import { Command } from '../../structures/Command';
import Client from '../../structures/Client';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import { TextChannel } from 'discord.js';

export default {
   ALIASES: ['channelinfo', 'infochannel'],
   OPTIONS: [
      {
         CHANNEL: {
            REQUIRED: true,
         },
      },
   ],
   USAGE: "<Canal>",
   async execute(client: Client, message, args, prefix, guildData) {
      const channel:TextChannel = ((await client.utils.general.getMember(message, args[0])) || message.channel);

      if(!channel) return message.reply({
         embeds: [
            new ErrorEmbed()
            .addField(
               client.translate(guildData.language, `${this.LANG_KEY}.notfound.name`),
               client.translate(guildData.language, `${this.LANG_KEY}.notfound.value`, {prefix, cmdName: this.NAME})
            ),
         ]
      });
      return message.reply({
         embeds: [
            new Embed()
               .addField(`${client.allemojis.builder} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.channel`)}`, `>>> \`${channel.name}\`\n\`\`\`${channel.name}\`\`\``, true)
               .addField(`${client.allemojis.info} Id`, `>>> <#${channel.id}>\n\`\`\`${channel.id}\`\`\``, true)
               .addField(
                  `${client.allemojis.clock} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.dates`)}`,
                  `>>> **${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.creation`)}** <t:${client.utils.general.toUnixTimestamp(
                     channel.createdTimestamp,
                  )}> | <t:${client.utils.general.toUnixTimestamp(
                     channel.createdTimestamp,
                  )}:R>`,
                  false,
               )
               .addField(
                  `${client.allemojis.question} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.position`)}`,
                  `>>> \`${channel.rawPosition}\``,
                  true,
               )
               .addField(
                  `${client.allemojis.channel} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.parent`)}`,
                  `>>> ${channel.parent || "`❌`"}`,
                  true,
               )
               .addField(
                  `${client.allemojis.role} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.membersWhoSeeIt`)}`,
                  `>>> \`${channel.members.size}\``,
                  true,
               )
               .addField(
                  `${client.allemojis.favourite} ${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.extras.name`)}`,
                  [
                     `>>> **${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.extras.type`)}:** \`${client.translate(guildData.language, `CHANNEL.TYPES.${channel.type}`)}\``,
                     `**${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.extras.deletable`)}:** ${channel.deletable ? "`✅`" :  "`❌`"}`,
                     `**${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.extras.viewable`)}:** ${channel.viewable ? "`✅`" :  "`❌`"}`,
                     `**${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.extras.manageable`)}:** ${channel.manageable ? "`✅`" :  "`❌`"}`,
                     `**${client.translate(guildData.language, `${this.LANG_KEY}.embed.field.extras.nsfw`)}:** ${channel.nsfw ? "`✅`" :  "`❌`"}`,
                  ].join("\n"),
                  true,
               )
         ],
      });
   },
} as Command;
