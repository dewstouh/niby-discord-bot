import { Document, Schema, model } from 'mongoose';
import music from '../../config/music';
import EmojiList from '../../config/EmojiList';
import { ColorResolvable } from 'discord.js';
import { Locale } from '../../typings/locales';
import { SearchPlatform } from 'lavalink-client';

export interface IEmbedSettings {
   color: string | ColorResolvable;
}

export interface IGiveawaySettings {
   emoji: string;
   color: string | ColorResolvable;
}

export interface IMusicSettings {
   leaveTimeout: number;
   autoplay: boolean;
   djmode:IDJSettings
   playingMessage: boolean;
   searchPlatform: SearchPlatform;
   volume: number;
}

export interface IDJSettings {
   enabled:boolean,
   roles: string[],
   cmds: string[]
}

export interface IGuild extends Document {
   guildId: string;
   prefix: string;
   embed: IEmbedSettings;
   language: Locale;
   giveaway: IGiveawaySettings
   music: IMusicSettings;
   disabledCommands: string[];
   disabledCategories: string[];
   disabledMessage: boolean;
   premium: number;
   isPremium: boolean;
   setPremium(msDate: number): Promise<void>;
   addPremium(msDate: number): Promise<void>;
}

const schema = new Schema<IGuild>({
   guildId: { type: String, required: true, unique: true },
   prefix: {
      type: String,
      default: process.env.PREFIX,
   },
   premium: {
      type: Number,
      default: 0,
   },
   embed: {
      type: Object,
      default: {
         color: process.env.DEFAULT_COLOR,
      },
   },
   language: {
      type: String,
      default: process.env.LANGUAGE,
   },
   giveaway: {
      type: Object,
      default: {
         emoji: EmojiList.giveaway,
         color: process.env.DEFAULT_COLOR,
      },
   },
   music: {
      type: Object,
      default: {
         leaveTimeout: music.defaultLeaveTimeout,
         autoplay: music.defaultAutoplay,
         djmode: {
            enabled: false,
            roles: [],
            cmds: [],
         },
         playingMessage: music.defaultPlayingMessage,
         searchPlatform: music.defaultSearchPlatform as SearchPlatform,
         volume: music.defaultVolume,
      },
   },
   disabledCommands: {
      type: [String],
      default: [],
   },
   disabledCategories: {
      type: [String],
      default: [],
   },
   disabledMessage: {
      type: Boolean,
      default: false,
   },
});

schema.virtual('isPremium').get(function () {
   return this.premium > Date.now();
});

schema.methods = {
   setPremium(msDate: number /* en ms */) {
      return this.updateOne({
         premium: Date.now() + msDate,
      });
   },

   addPremium(amount: number /* en ms */) {
      if(this.isPremium){
         return this.updateOne({$inc: {premium: amount}})
      }
      return this.updateOne({premium: Date.now() + amount});
   },
}

export default model<IGuild>('guilds', schema);
