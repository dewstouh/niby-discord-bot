import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import GiveawaySchema from '../../database/schemas/GiveawaySchema';
import { GiveawayData } from 'discord-giveaways';
import Client from '../../structures/Client';
import { Command } from '../../structures/Command';
export default {
   OPTIONS: [
      {
         STRING: {
            REQUIRED: false,
         },
      },
   ],
   COOLDOWN: {
      guild: 5 * 1000,
   },
   USAGE: "<IdSorteo?>",
   async execute(client: Client, message, args, prefix, guildData) {
      let giveawayData = {} as GiveawayData;
      if (args[0]) {
         giveawayData = await GiveawaySchema.findOne({ guildId: message.guild.id, messageId: args[0] });
      } else {
         giveawayData = await GiveawaySchema.find({ guildId: message.guild.id, channelId: message.channel.id, ended: false }).sort({
            _id: -1,
         });
         giveawayData = giveawayData[0];
      }

      if (!giveawayData && !args[0])
         return await message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.noargs.name`, { noEmoji: client.allemojis.no }),
                  client.translate(guildData.language, `${this.LANG_KEY}.noargs.value`, { prefix }),
               ),
            ],
            ephemeral: true,
         });

      if (!giveawayData && args[0])
         return await message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.nogiveaway.name`, {
                     noEmoji: client.allemojis.no,
                  }),
                  client.translate(guildData.language, `${this.LANG_KEY}.nogiveaway.value`, { prefix }),
               ),
            ],
            ephemeral: true,
         });

      const LOADING_MSG = await message.reply({
         embeds: [
            new Embed().setDescription(client.translate(guildData.language, `${this.LANG_KEY}.loading`)),
            // .setDescription(`>>> ${client.allemojis.loading} **Pausando sorteo...**`)
         ],
         ephemeral: true,
      });

      client.giveawaysManager
         .reroll(giveawayData.messageId, {
            messages: {
               congrat: {
                  content: `**${
                     giveawayData.winnerCount == 1
                        ? client.translate(
                             guildData.language,
                             `${this.LANG_KEY}.giveawaysManager.messages.congrat.content.singular`,
                          )
                        : client.translate(
                             guildData.language,
                             `${this.LANG_KEY}.giveawaysManager.messages.congrat.content.plural`,
                          )
                  }\n> {winners}**`,
                  embed: new Embed().setDescription(`> ${giveawayData.prize}`).setColor(guildData.giveaway.color),
                  components: [
                     new ActionRowBuilder().addComponents([
                        new ButtonBuilder()
                           .setStyle(ButtonStyle.Link)
                           .setURL(
                              `https://discord.com/channels/${message.guild.id}/${giveawayData.channelId}/${giveawayData.messageId}`,
                           )
                           .setLabel(
                              `{this.entriesAmount} {this.entriesAmount == 1 ? this.client.translate("${guildData.language}", "${this.LANG_KEY}.giveawaysManager.messages.entrants.singular") : this.client.translate("${guildData.language}", "${this.LANG_KEY}.giveawaysManager.messages.entrants.plural")}`,
                           )
                           .setEmoji(guildData.giveaway.emoji),
                     ]),
                  ],
                  // @ts-ignore
                  allowedMentions: { parse: ['users'] },
                  replyToGiveaway: true,
               },
               error: {
                  content: client.translate(guildData.language, `${this.LANG_KEY}.giveawaysManager.messages.error.content`),
                  embed: new Embed().setDescription(`> ${giveawayData.prize}`).setColor(guildData.giveaway.color),
                  components: [
                     new ActionRowBuilder().addComponents([
                        new ButtonBuilder()
                           .setStyle(ButtonStyle.Link)
                           .setURL(
                              `https://discord.com/channels/${message.guild.id}/${giveawayData.channelId}/${giveawayData.messageId}`,
                           )
                           .setLabel(`{this.client.utils.general.getEntrantsLang(this, "${guildData.language}")}`)
                           .setEmoji(guildData.giveaway.emoji),
                     ]),
                  ],
                  // @ts-ignore
                  allowedMentions: { parse: ['users'] },
                  replyToGiveaway: true,
               },
            },
         })
         .then(async () => {
            await client.utils.message.edit(message, LOADING_MSG, {
               embeds: [
                  new Embed().addField(
                     client.translate(guildData.language, `${this.LANG_KEY}.success.name`),
                     client.translate(guildData.language, `${this.LANG_KEY}.success.value`, {
                        giveawayUrl: `https://discord.com/channels/${message.guild.id}/${giveawayData.channelId}/${giveawayData.messageId}`,
                     }),
                  ),
               ],
               components: [
                  new ActionRowBuilder().addComponents([
                     new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.com/channels/${message.guild.id}/${giveawayData.channelId}/${giveawayData.messageId}`)
                        .setLabel(client.translate(guildData.language, `${this.LANG_KEY}.giveaway.goto`))
                        // .setLabel(`Ir al sorteo`)
                        .setEmoji(guildData.giveaway.emoji),
                  ]),
               ],
               ephemeral: true,
            });
         })
         .catch(async () => {
            await client.utils.message.edit(message, LOADING_MSG, {
               embeds: [
                  new Embed().addField(
                     client.translate(guildData.language, `COMMON.COMMAND.giveaway.error.name`, {
                        noEmoji: client.allemojis.no,
                     }),
                     client.translate(guildData.language, `COMMON.COMMAND.giveaway.error.value`, {
                        clientTag: client.user!.username,
                     }),
                  ),
               ],
               components: [
                  new ActionRowBuilder().addComponents([
                     new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setURL(process.env.DISCORD)
                        .setEmoji(client.allemojis.discord)
                        .setLabel(client.translate(guildData.language, `COMMON.COMMAND.giveaway.support`)),
                     // .setLabel("Soporte"),
                  ]),
               ],
               ephemeral: true,
            });
         });
   },
} as Command;
