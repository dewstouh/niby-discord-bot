import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import Client from '../../structures/Client';
import { Command } from '../../structures/Command';
import ms from 'ms';

export default {
   OPTIONS: [
      {
         STRING: {
            REQUIRED: true,
         },
      },
      {
         NUMBER: {
            REQUIRED: true,
         },
      },
      {
         STRING: {
            REQUIRED: true,
         },
      },
      {
         CHANNEL: {
            REQUIRED: false,
            TYPES: ['GuildText'],
         },
      },
      {
         ROLE: {
            REQUIRED: false,
         },
      },
   ],
   COOLDOWN: {
      guild: 15 * 1000,
   },
   USAGE: "<Duración> <Ganadores> <Recompensa> <Canal?> <Rol?>",
   async execute(client: Client, message, args, prefix, guildData) {
      if (!args.length)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.noduration.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.noduration.value`, { prefix, cmdName: this.NAME }),
               ),
            ],
            ephemeral: true,
         });

      let DURATION = args[0];
      if (!ms(DURATION))
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.novalidtime.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.novalidtime.value`, {
                     prefix,
                     cmdName: this.NAME,
                  }),
               ),
            ],
            ephemeral: true,
         });
      DURATION = ms(args[0]);
      const MIN_DURATION = 1000;
      if (DURATION < MIN_DURATION)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.lowtime.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.lowtime.value`, {
                     duration: client.utils.general
                        .duration(MIN_DURATION, guildData.language)
                        .map((d) => d)
                        .join(', '),
                  }),
               ),
            ],
            ephemeral: true,
         });
      const WINNERS = args[1];
      if (!WINNERS)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.nowinners.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.nowinners.value`, {
                     duration: client.utils.general
                        .duration(MIN_DURATION, guildData.language)
                        .map((d) => d)
                        .join(', '),
                  }),
               ),
            ],
            ephemeral: true,
         });

      if (isNaN(WINNERS))
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.novalidwinners.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.novalidwinners.value`, {
                     prefix,
                     cmdName: this.NAME,
                  }),
               ),
            ],
            ephemeral: true,
         });

      if (WINNERS < 1)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.lowwinners.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.lowwinners.value`, { prefix, cmdName: this.NAME }),
               ),
            ],
            ephemeral: true,
         });
      let PRIZE = args.slice(2).join(' ');
      if (!PRIZE || !PRIZE.length)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.noprize.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.noprize.value`, { prefix, cmdName: this.NAME }),
               ),
            ],
            ephemeral: true,
         });

      const CHANNEL = message?.mentions?.channels?.first() || message?.options?.getChannel('canal') || message.channel;
      const ROLE = message?.mentions?.roles?.first() || message?.options?.getRole('rol') || null;

      PRIZE = client.utils.message.truncate(
         PRIZE.replace(CHANNEL, '')
            .replace(ROLE, '')
            .replace(CHANNEL?.id, '')
            .replace(ROLE?.id, '')
            .trim(),
      );

      const LOADING_MSG = await message.reply({
         embeds: [
            new Embed().setDescription(
               client.translate(guildData.language, `${this.LANG_KEY}.loading`, { channel: CHANNEL.toString() }),
            ),
            // .setDescription(`>>> ${client.allemojis.loading} **Iniciando sorteo en ${CHANNEL}**`)
         ],
         ephemeral: true,
      });

      client.giveawaysManager
         .start(CHANNEL, {
            duration: DURATION,
            winnerCount: Number(WINNERS),
            prize: PRIZE,
            exemptMembers: (member) => !member.roles.cache.some((r) => r.id === (ROLE?.id || message.guild.id)),
            hostedBy: message.user,
            embedColor: guildData.giveaway.color,
            reaction: guildData.giveaway.emoji,
            messages: {
               giveaway: `${client.translate(guildData.language, `${this.LANG_KEY}.giveawaysManager.messages.giveaway`, {
                  giveawayEmoji: guildData.giveaway.emoji,
               })}${
                  ROLE ? `${client.translate(guildData.language, `${this.LANG_KEY}.requiredRoles`, { role: ROLE })}` : ''
               }`,
               giveawayEnded: client.translate(
                  guildData.language,
                  `${this.LANG_KEY}.giveawaysManager.messages.giveawayEnded`,
                  { giveawayEmoji: guildData.giveaway.emoji },
               ),
               inviteToParticipate: client.translate(
                  guildData.language,
                  `${this.LANG_KEY}.giveawaysManager.messages.inviteToParticipate`,
                  { giveawayEmoji: guildData.giveaway.emoji },
               ),
               winMessage: {
                  content: `**${
                     WINNERS == 1
                        ? client.translate(
                             guildData.language,
                             `${this.LANG_KEY}.giveawaysManager.messages.winMessage.content.singular`,
                          )
                        : client.translate(
                             guildData.language,
                             `${this.LANG_KEY}.giveawaysManager.messages.winMessage.content.plural`,
                          )
                  }\n> {winners}**`,
                  embed: new Embed().setDescription(`> ${PRIZE}`).setColor(guildData.giveaway.color),
                  components: [
                     new ActionRowBuilder().addComponents([
                        new ButtonBuilder()
                           .setStyle(ButtonStyle.Link)
                           .setURL(`https://discord.com/channels/${message.guild.id}/${CHANNEL.id}/{this.messageId}`)
                           .setLabel(`{this.client.utils.general.getEntrantsLang(this, "${guildData.language}")}`)
                           // .setLabel(`{this.entriesAmount} Participante{this.entriesAmount == 1 ? "" : "s"}`)
                           .setEmoji(guildData.giveaway.emoji),
                     ]),
                  ],
                  // @ts-ignore
                  allowedMentions: { parse: ['users'] },
                  replyToGiveaway: true,
               },
               dropMessage: client.translate(guildData.language, `${this.LANG_KEY}.giveawaysManager.messages.dropMessage`, {
                  giveawayEmoji: guildData.giveaway.emoji,
               }),
               embedFooter: `${WINNERS} ${
                  WINNERS == 1
                     ? client.translate(
                          guildData.language,
                          `${this.LANG_KEY}.giveawaysManager.messages.embedFooter.singular`,
                       )
                     : client.translate(guildData.language, `${this.LANG_KEY}.giveawaysManager.messages.embedFooter.plural`)
               }`,
               winners: `${WINNERS} ${
                  WINNERS == 1
                     ? client.translate(guildData.language, `${this.LANG_KEY}.giveawaysManager.messages.winners.singular`)
                     : client.translate(guildData.language, `${this.LANG_KEY}.giveawaysManager.messages.winners.plural`)
               }`,
               noWinner: client.translate(guildData.language, `${this.LANG_KEY}.giveawaysManager.messages.noWinner`),
               hostedBy: client.translate(guildData.language, `${this.LANG_KEY}.giveawaysManager.messages.hostedBy`),
               endedAt: client.translate(guildData.language, `${this.LANG_KEY}.giveawaysManager.messages.endedAt`),
               drawing: client.translate(guildData.language, `${this.LANG_KEY}.giveawaysManager.messages.drawing`),
            },
            lastChance: {
               enabled: true,
               content: client.translate(guildData.language, `${this.LANG_KEY}.giveawaysManager.lastChance.content`),
               threshold: 5000,
               embedColor: "Orange",
            },
            pauseOptions: {
               isPaused: false,
               content: client.translate(guildData.language, `${this.LANG_KEY}.giveawaysManager.pauseOptions.content`),
               embedColor: process.env.COOLDOWN_COLOR,
               infiniteDurationText: client.translate(
                  guildData.language,
                  `${this.LANG_KEY}.giveawaysManager.pauseOptions.infiniteDurationText`,
               ),
            },
         })
         .then(async (data) => {
            if (CHANNEL?.id == message.channel.id) {
               client.utils.message.delete(message);
            }
            await client.utils.message.edit(message, LOADING_MSG, {
               embeds: [
                  new Embed().addField(
                     client.translate(guildData.language, `${this.LANG_KEY}.success.name`),
                     client.translate(guildData.language, `${this.LANG_KEY}.success.value`, {
                        giveawayUrl: `https://discord.com/channels/${message.guild.id}/${data.channelId}/${data.messageId}`,
                     }),
                  ),
                  // .addField(`${client.allemojis.yes} Sorteo comenzado`, `> **[\`Haz clic para ir al sorteo\`](${data.messageURL})**`)
               ],
               components: [
                  new ActionRowBuilder().addComponents([
                     new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setURL(`${data.messageURL}`)
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
                  new ErrorEmbed().addField(
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
                  ]),
               ],
               ephemeral: true,
            });
         });
   },
} as Command;
