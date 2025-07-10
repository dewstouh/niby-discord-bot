import { PermissionResolvable } from 'discord.js';
import { execute } from './execute';

export enum Components {
   'buttons' = 'btn',
   'menus' = 'menu',
   'modals' = 'modal',
   'contextmenus' = 'ctx',
}

export type ComponentType = "buttons" | "menus" | "contextmenus" | "modals"

export type Component = {
   NAME: string;
   GUILD_ONLY?:boolean;
   USAGE?: string;
   PERMISSIONS?: PermissionResolvable[];
   BOT_PERMISSIONS?: PermissionResolvable[];
   OWNER: boolean;
   NSFW: boolean;
   PREMIUM?: boolean;
   LANG_KEY: string;
   LEVEL?: number;
   execute: execute;
};
