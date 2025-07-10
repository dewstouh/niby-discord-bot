import { Schema, model, Document } from 'mongoose';

export type Punishment = 'Warn';
export interface IPunishment {
   guildId: string;
   userId: string;
   type: Punishment;
   authorId: string;
   reason: string;
   createdAt: Date;
   createdTimestamp: number;
}

export interface IPlaylist {
   name: string;
   songs: string[];
}

export type ClaimType = 'daily' | 'monthly' | 'work';

export interface IUser extends Document {
   userId: string;
   premium: number;
   noPrefixMode: boolean;
   favSongs: string[];
   playlists: IPlaylist[];
   coins: number;
   daily: string;
   monthly: string;
   work: string;
   xp: number;
   level: number;
   inventory: Map<string, number>;
   punishments: IPunishment[];
   isPremium: boolean;
   setPremium(msDate: number): Promise<void>;
   addPremium(msDate: number): Promise<void>;
   setCoins(amount: number): Promise<void>;
   addCoins(amount: number): Promise<void>;
   removeCoins(amount: number): Promise<void>;
   addXp(xp: number): Promise<boolean>;
   setXp(xp: number): Promise<void>;
   removeXp(xp: number): Promise<void>;
   addLevel(level: number): Promise<void>;
   setLevel(level: number): Promise<void>;
   removeLevel(level: number): Promise<void>;
   getNeededXp(level?: number): number;
   claimTemporalReward(claimType: ClaimType, reward: number, cooldown: number): Promise<number | false>;
}

const schema = new Schema<IUser>({
   userId: {
      type: String,
      required: true,
      unique: true,
   },
   premium: {
      type: Number,
      default: 0,
   },
   noPrefixMode: {
      type: Boolean,
      default: false,
   },
   favSongs: {
      type: [String],
      default: [],
   },
   playlists: {
      type: [
         {
            name: String,
            songs: [String],
         },
      ],
      default: [],
   },
   coins: {
      type: Number,
      default: 2500,
      required: true,
   },
   daily: {
      type: String,
      default: '0',
      required: true,
   },
   monthly: {
      type: String,
      default: '0',
      required: true,
   },
   work: {
      type: String,
      default: '0',
      required: true,
   },
   xp: {
      type: Number,
      default: 0 * 100 * 100,
   },
   level: {
      type: Number,
      default: 0,
   },
   inventory: {
      type: Map,
      of: Number,
      default: new Map<string, number>([['Gemas', 0]]),
      required: true,
   },
   punishments: {
      type: [Object],
      default: [],
   },
});

schema.virtual('isPremium').get(function () {
   return this.premium > Date.now();
});

schema.methods = {
   setPremium(msDate: number /* en ms */) {
      return this.updateOne({
         premium: msDate,
      });
   },

   addPremium(amount: number /* en ms */) {
      if (this.isPremium) {
         return this.updateOne({ $inc: { premium: amount } });
      }
      return this.updateOne({ premium: Date.now() + amount });
   },

   setCoins(amount: number) {
      if (amount < 0) throw new TypeError('An amount of coins to remove was not provided/was invalid.');
      return this.updateOne({
         coins: amount < 0 ? 0 : amount,
      });
   },

   addCoins(amount: number) {
      if (amount < 0) throw new TypeError('An amount of coins to remove was not provided/was invalid.');
      return this.updateOne({
         coins: amount,
      });
   },

   removeCoins(amount: number) {
      if (amount < 0) throw new TypeError('An amount of coins to remove was not provided/was invalid.');
      const newCoins = this.coins - amount < 0 ? 0 : this.coins - amount;
      return this.updateOne({
         coins: newCoins,
      });
   },

   async addXp(xp: number) {
      if (xp <= 0) throw new TypeError('An amount of xp was not provided/was invalid.');

      const newXp = this.xp + xp;
      const newLevel = Math.floor(0.1 * Math.sqrt(newXp));

      // Guardamos los cambios en la base de datos
      await this.updateOne({
         xp: newXp,
         level: newLevel,
      });

      return newLevel > this.level;
   },
   setXp(xp: number) {
      if (xp <= 0) throw new TypeError('An amount of xp was not provided/was invalid.');

      const newLevel = Math.floor(0.1 * Math.sqrt(xp));

      return this.updateOne({
         xp: xp < 0 ? 0 : xp,
         level: newLevel,
      });
   },
   removeXp(xp: number) {
      if (xp <= 0) throw new TypeError('An amount of xp was not provided/was invalid.');

      const newXp = this.xp - xp;
      const newLevel = Math.floor(0.1 * Math.sqrt(newXp));

      return this.updateOne({
         xp: newXp < 0 ? 0 : newXp,
         level: newLevel,
      });
   },
   addLevel(level: number) {
      if (level <= 0) throw new TypeError('An amount of level was not provided/was invalid.');

      const newLevel = this.level + level;
      const newXp = newLevel * newLevel * 100;

      return this.updateOne({
         level: newLevel,
         xp: newXp,
      });
   },
   setLevel(level: number) {
      if (level <= 0) throw new TypeError('An amount of level was not provided/was invalid.');

      const newLevel = level;
      const newXp = newLevel * newLevel * 100;

      return this.updateOne({
         level: newLevel < 0 ? 0 : newLevel,
         xp: newXp,
      });
   },
   removeLevel(level: number) {
      if (level <= 0) throw new TypeError('An amount of level was not provided/was invalid.');

      const newLevel = this.level - level;
      const newXp = newLevel * newLevel * 100;

      return this.updateOne({
         level: newLevel < 0 ? 0 : newLevel,
         xp: newXp,
      });
   },

   // Obtener la cantidad de xp necesaria para el siguiente nivel
   getNeededXp(level?: number) {
      if (!level) level = this.level + 1;
      return 100 * (level! * level!);
   },

   claimTemporalReward(claimType, reward, cooldown) {
      return new Promise((res, rej) => {
         reward = this.isPremium ? reward * 2 : reward;
         return this[claimType] > Date.now()
            ? res(false)
            : this.updateOne({
                 $inc: {
                    coins: reward,
                 },
                 [`${claimType}`]: Date.now() + cooldown,
              })
                 .then(() => res(reward))
                 .catch((e) => {
                    console.error(e);
                    return rej(e);
                 });
      });
   },
};

export default model<IUser>('users', schema);
