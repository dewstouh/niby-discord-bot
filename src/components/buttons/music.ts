import { Player } from 'lavalink-client';
import Client from '../../structures/Client';
import { Component } from '../../typings/component';
import { Embed } from '../../extenders/discord/Embed';
import { TextInputBuilder, TextInputStyle, ModalBuilder, ActionRowBuilder } from 'discord.js';

export default {
   async execute(client: Client, interaction, args, guildData, userData, player: Player) {
      const action = args[0];

      if (!client.utils.music.isPlaying(interaction, player, guildData.prefix, guildData.language)) return;

      // Not allowed? return
      if (!client.utils.music.isAllowedToAction(interaction, "", guildData)) return;

      switch (action) {
         case 'STOP_SONG':
            {
               if(!client.utils.music.hasDJRole(interaction, "stop", interaction.member, guildData.language, guildData.music.djmode)) return;
               await client.utils.music.stopPlayer(interaction, player, guildData.language);
            }
            break;

         case 'SKIP_SONG':
            {
               if(!client.utils.music.hasDJRole(interaction, "skip", interaction.member, guildData.language, guildData.music.djmode)) return;
               await client.utils.music.skipSong(interaction, player, guildData.language);
            }
            break;

         case 'PAUSERESUME_SONG':
            if(!client.utils.music.hasDJRole(interaction, "pause", interaction.member, guildData.language, guildData.music.djmode)) return;
            {
               await (player.paused
                  ? client.utils.music.resumePlayer(interaction, player, guildData.language)
                  : client.utils.music.pausePlayer(interaction, player, guildData.language));
            }
            break;

         case 'AUTO_SONG':
            if(!client.utils.music.hasDJRole(interaction, "autoplay", interaction.member, guildData.language, guildData.music.djmode)) return;
            {
               await client.utils.music.toggleAutoplay(interaction, player, guildData.language);
            }
            break;

         case 'LOOP_SONG':
            if(!client.utils.music.hasDJRole(interaction, "loop", interaction.member, guildData.language, guildData.music.djmode)) return;
            {
               await client.utils.music.toggleLoop(interaction, player, guildData.language);
            }
            break;

         case 'FORWARD_SONG':
            if(!client.utils.music.hasDJRole(interaction, "forward", interaction.member, guildData.language, guildData.music.djmode)) return;
            {
               await client.utils.music.forwardPlayer(interaction, player, guildData.language);
            }
            break;

         case 'BACKWARD_SONG':
            if(!client.utils.music.hasDJRole(interaction, "rewind", interaction.member, guildData.language, guildData.music.djmode)) return;
            {
               await client.utils.music.rewindPlayer(interaction, player, guildData.language);
            }
            break;

         case 'FAV_SONG':
            {
               const song = player.queue.current!;
               if (userData.favSongs.includes(song.info.uri)) {
                  userData.favSongs.splice(userData.favSongs.indexOf(song.info.uri), 1);
                  await userData.save();

                  return interaction.reply({
                     embeds: [new Embed().setDescription(client.translate(guildData.language, `${this.LANG_KEY}.favSong.delete`))],
                     ephemeral: true,
                  });
               }
               userData.favSongs.push(song.info.uri);
               await userData.save();

               await interaction.reply({
                  embeds: [new Embed().setDescription(client.translate(guildData.language, `${this.LANG_KEY}.favSong.add`))],
                  ephemeral: true,
               });
            }
            break;

         case 'SEARCH_SONG':
            {
               const MODAL_PAGE_OPTION = new TextInputBuilder()
                  .setCustomId('songName')
                  .setLabel(client.translate(guildData.language, `${this.LANG_KEY}.searchSong.modal.inputLabel`))
                  .setRequired(true)
                  .setPlaceholder(`Never Gonna Give You Up - Rick Astley`)
                  .setStyle(TextInputStyle.Short);

               const MODAL = new ModalBuilder()
                  .setCustomId('searchSong')
                  .setTitle(client.translate(guildData.language, `${this.LANG_KEY}.searchSong.modal.title`))
                  // @ts-ignore
                  .addComponents(new ActionRowBuilder().addComponents(MODAL_PAGE_OPTION));

               await interaction?.showModal(MODAL);
               await interaction
                  ?.awaitModalSubmit({
                     time: 180e3,
                     filter: (m) => m.user.id === interaction.user.id,
                  })
                  .then(async (modal) => {
                     const songName = modal.fields.getTextInputValue('songName');
                     if(!songName) modal.deferReply();
                     await client.utils.music.playSong(modal, songName, { guildData });
                  })
                  .catch(() => {});
            }
            break;

         case 'VOL_SONG':
            if(!client.utils.music.hasDJRole(interaction, "volume", interaction.member, guildData.language, guildData.music.djmode)) return;
            {
               const MODAL_PAGE_OPTION = new TextInputBuilder()
                  .setCustomId('volume')
                  .setLabel(client.translate(guildData.language, `${this.LANG_KEY}.volume.modal.label`))
                  .setRequired(true)
                  .setPlaceholder(`${player.volume}`)
                  .setStyle(TextInputStyle.Short);

               const MODAL = new ModalBuilder()
                  .setCustomId('vol_song')
                  .setTitle(client.translate(guildData.language, `${this.LANG_KEY}.volume.modal.title`))
                  // @ts-ignore
                  .addComponents(new ActionRowBuilder().addComponents(MODAL_PAGE_OPTION));

               await interaction?.showModal(MODAL);
               await interaction
                  ?.awaitModalSubmit({
                     time: 180e3,
                     filter: (m) => m.user.id === interaction.user.id,
                  })
                  .then((modal) => {
                     const volume = parseInt(modal.fields.getTextInputValue('volume'));
                     if(!volume) return modal.deferReply();
                     return client.utils.music.setVolume(modal, player, guildData, volume);
                  })
                  .catch(() => {});
            }
            break;

         default:
            break;
      }
   },
} as Component;
