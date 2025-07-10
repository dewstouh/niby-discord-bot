import { PermissionFlagsBits } from 'discord.js';
import EmojiList from './EmojiList';

export default {
   Admin: {
      PERMISSIONS: [PermissionFlagsBits.ManageGuild],
      EMOJI: EmojiList.role,
      GUILD_ONLY: true
   },
   Ajustes: {
      PERMISSIONS: [PermissionFlagsBits.ManageGuild],
      EMOJI: EmojiList.gear,
      GUILD_ONLY: true
   },
   Diversion: {
      EMOJI: EmojiList.controller,
   },
   Moderacion: {
      EMOJI: EmojiList.builder,
      GUILD_ONLY: true
   },
   Dueño: {
      EMOJI: EmojiList.crown,
      OWNER: true,
      GUILD_ONLY: true
   },
   Economia: {
      EMOJI: EmojiList.money,
      ALIASES: ["eco"],
   },
   Info: {
      EMOJI: EmojiList.info,
   },
   Musica: {
      EMOJI: EmojiList.notes,
      GUILD_ONLY: true
   },
   Nsfw: {
      EMOJI: EmojiList.nsfw,
      NSFW: true
   },
   Sorteos: {
      EMOJI: EmojiList.giveaway,
      PERMISSIONS: [PermissionFlagsBits.ManageGuild],
      GUILD_ONLY: true
   },
   Sistemas: {
      EMOJI: EmojiList.builder,
      PERMISSIONS: [PermissionFlagsBits.Administrator],
      GUILD_ONLY: true
   },
   Utilidad: {
      EMOJI: EmojiList.mouse,
   },
   'Sin categoría': {
      EMOJI: EmojiList.question,
   },
};
