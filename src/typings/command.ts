import { Collection } from 'discord.js';
import { Command } from '../structures/Command';
import categories from '../config/categories';

export interface CommandCooldown {
   user: Collection<string, Collection<string, number>>;
   guild: Collection<string, Collection<string, number>>;
   global: Collection<string, number[]>;
}

const NsfwCategories = Object.keys(categories).filter(categoria => categories[categoria].NSFW === true);
const PrivateCategories = Object.keys(categories).filter(categoria => categories[categoria].OWNER === true);
const PremiumCategories = Object.keys(categories).filter(categoria => categories[categoria].PREMIUM === true);
const UserPremiumCategories = Object.keys(categories).filter(categoria => categories[categoria].USER_PREMIUM === true);
const GuildPremiumCategories = Object.keys(categories).filter(categoria => categories[categoria].GUILD_PREMIUM === true);

export function isNsfwCategory(value: string){
   return NsfwCategories.includes(value);
}

export function isPrivateCategory(value: string){
   return PrivateCategories.includes(value);
}

export function isPremiumCategory(value: string){
   return PremiumCategories.includes(value);
}

export function isUserPremiumCategory(value: string){
   return UserPremiumCategories.includes(value);
}

export function isGuildPremiumCategory(value: string){
   return GuildPremiumCategories.includes(value);
}

export function isCommand(value:any): value is Command {
   return value.LOCALIZATIONS !== undefined;
}
