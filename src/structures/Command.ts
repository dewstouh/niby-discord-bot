import { PermissionResolvable } from 'discord.js';
import {
   CommandCooldown,
   isNsfwCategory,
   isPrivateCategory,
   isPremiumCategory,
   isUserPremiumCategory,
   isGuildPremiumCategory,
} from '../typings/command';
import { execute } from '../typings/execute';
import { Locale } from '../typings/locales';
import Client from './Client';
import { Category } from './Category';
import { SubCategory } from './SubCategory';
import LocaleUtils from './utils/LocaleUtils';

interface Options {
   command: any;
   name: string;
   dir?: string | undefined;
   subdir?: string | undefined;
   category?: Category | SubCategory;
}

export class Command {
   private isGroup?: boolean;
   private isSubGroup?: boolean;
   private dir?: string | undefined; // Agrega las propiedades dir y subdir
   private subdir?: string | undefined;
   private name?: string;

   COOLDOWN?: CommandCooldown | number | object;
   GUILD_ONLY?: boolean;
   NAME: string;
   USAGE?: string;
   OPTIONS?: object[];
   PERMISSIONS?: PermissionResolvable[];
   BOT_PERMISSIONS?: PermissionResolvable[];
   DESCRIPTION: string;
   ALIASES?: string[];
   SLASH: string | string[];
   SLASH_ALIASES?: string[];
   OWNER: boolean;
   NSFW: boolean;
   PREMIUM?: boolean;
   USER_PREMIUM?: boolean;
   GUILD_PREMIUM?: boolean;
   CATEGORY_NAME: string;
   ID: string;
   KEY: string;
   LANG_KEY: string;
   MENTION: string;
   LEVEL?: number;
   execute?: execute;
   LANG_PATH: string;
   LOCALIZATIONS: { name: string[]; description: string[] }[];
   CATEGORY?: Category | SubCategory;
   AllKeys: string[] | undefined;
   LangKeys: string[] | undefined;
   LangKeysMap: Map<string, string[]> = new Map();

   constructor(client: Client, options: Options) {
      const { command, dir, subdir, name, category } = options;

      if (dir) this.dir = options.dir; // Asigna las propiedades dir y subdir
      if (subdir) this.subdir = options.subdir;
      if (name) this.name = options.name;
      if (category) this.CATEGORY = category;

      this.isGroup = dir !== undefined;
      this.isSubGroup = subdir !== undefined;

      this.SLASH = this.getSlash();
      this.SLASH_ALIASES = this.getSlashAliases(command);
      this.LANG_PATH = this.getLangKey();
      this.ID = client.cache.get('fetchedApplication')?.find?.((c) => c?.name == dir)?.permissions?.commandId ?? 'commandId';
      this.NAME = name;
      if (command.USAGE) this.USAGE = client.translate(process.env.LANGUAGE as Locale, `${this.LANG_PATH}.USAGE`);
      this.DESCRIPTION = client.translate(process.env.LANGUAGE as Locale, `${this.LANG_PATH}.DESCRIPTION`);
      this.OWNER = dir && isPrivateCategory(dir) ? true : command.OWNER;
      this.NSFW = dir && isNsfwCategory(dir) ? true : command.NSFW;
      this.PREMIUM = dir && isPremiumCategory(dir) ? true : command.PREMIUM;
      this.USER_PREMIUM = dir && isUserPremiumCategory(dir) ? true : command.USER_PREMIUM;
      this.GUILD_PREMIUM = dir && isGuildPremiumCategory(dir) ? true : command.GUILD_PREMIUM;
      this.CATEGORY_NAME = dir?.capitalizeFirstChar() || 'Sin categoría';
      this.KEY = Array.isArray(this.SLASH) ? `/${this.SLASH[0]}` : `/${this.SLASH}`;
      this.LANG_KEY = `${this.LANG_PATH}.execute`;
      this.LOCALIZATIONS = client.utils.locale.inlineDescriptionLocalization(name, `${this.LANG_PATH}.DESCRIPTION`);
      this.MENTION = `</${Array.isArray(this.SLASH) ? this.SLASH[0] : this.SLASH}:${this.ID}>`;
      this.ALIASES = command.ALIASES || [];

      this.AllKeys = this.CATEGORY ? this.getAllKeys() : undefined;
      this.LangKeys = this.CATEGORY && this.AllKeys ? this.getLangKeys() : undefined;

      for (const prop in command) {
         if (!this[prop]) this[prop] = command[prop];
      }
   }

   private getLangKey = () => {
      if (this.isSubGroup) {
         return `COMMANDS.${this.dir!.toUpperCase()}.${this.subdir!.toUpperCase()}.${this.name}`;
      } else if (this.isGroup) {
         return `COMMANDS.${this.dir!.toUpperCase()}.${this.name}`;
      }
      return `COMMANDS.${this.name}`;
   };

   private getSlash = () => {
      if (this.isSubGroup) {
         return [`${this.dir} ${this.subdir} ${this.name}`, `${this.dir} ${this.name}`];
      } else if (this.isGroup) {
         return `${this.dir} ${this.name}`;
      }
      return `${this.name}`;
   };

   private getSlashAliases = (command) => {
      if (this.isSubGroup) {
         if (command.ALIASES && command.ALIASES.length >= 1) {
            return command.ALIASES.flatMap((ALIAS) => {
               const aliases = [`${this.dir} ${this.subdir} ${ALIAS}`];
               return aliases.map((alias) => alias.toLowerCase());
            });
         }
      } else if (this.isGroup) {
         if (command.ALIASES && command.ALIASES.length >= 1) {
            return command.ALIASES.flatMap((ALIAS) => {
               const aliases = [`${this.dir} ${ALIAS}`];
               return aliases.map((alias) => alias.toLowerCase());
            });
         }
      }
   };

   getUsage(language: Locale = process.env.LANGUAGE) {
      return LocaleUtils.inlineLocale(language, `${this.LANG_PATH}.USAGE`);
   }

   getDescription(language: Locale = process.env.LANGUAGE) {
      return LocaleUtils.inlineLocale(language, `${this.LANG_PATH}.DESCRIPTION`);
   }

   getAllKeys() {
      if (!this.CATEGORY) return;
      const AllKeys = LocaleUtils.getLocales().map((language) => {
         const PARENT_CATEGORY = this.CATEGORY?.PARENT_CATEGORY;
         const CATEGORY = (PARENT_CATEGORY || this.CATEGORY)!;
         const noParentKeys: string[] = [];
         const parentKeys: string[] = [];

         const ORIGINAL_CATEGORY_KEY = CATEGORY.DEFAULT_KEY.toLowerCase();
         const TRANSLATED_CATEGORY_KEY = CATEGORY.getKey(language).toLowerCase();
         const NORMALIZED_CATEGORY_KEY = CATEGORY.getKey(language)
            .toLowerCase()
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '');

         const ALIASES = this.ALIASES || [];
         const CAT_ALIASES = CATEGORY.ALIASES || [];

         const ALIAS_LOWER = ALIASES.map((alias) => alias.toLowerCase());
         const CAT_ALIAS_LOWER = CAT_ALIASES.map((alias) => alias.toLowerCase());
         const CAT_ALIASES_KEYS = CAT_ALIAS_LOWER.map((catAlias) => `${catAlias} ${this.NAME}`.toLowerCase());

         noParentKeys.push(
            `${ORIGINAL_CATEGORY_KEY} ${this.NAME}`,
            `${TRANSLATED_CATEGORY_KEY} ${this.NAME}`,
            `${NORMALIZED_CATEGORY_KEY} ${this.NAME}`,
            ...ALIAS_LOWER.map((alias) => `${ORIGINAL_CATEGORY_KEY} ${alias}`),
            ...ALIAS_LOWER.map((alias) => `${TRANSLATED_CATEGORY_KEY} ${alias}`),
            ...ALIAS_LOWER.map((alias) => `${NORMALIZED_CATEGORY_KEY} ${alias}`),
            ...CAT_ALIASES_KEYS,
            ...(this.ALIASES ? CAT_ALIAS_LOWER.flatMap((catAlias) => ALIAS_LOWER.map((alias) => `${catAlias} ${alias}`)) : []),
         );

         if (PARENT_CATEGORY) {
            const CATEGORY = this.CATEGORY!;
            const PARENT_CATEGORY = CATEGORY.PARENT_CATEGORY!;
            const ORIGINAL_CATEGORY_KEY = CATEGORY.DEFAULT_KEY.toLowerCase();
            const TRANSLATED_CATEGORY_KEY = CATEGORY.getKey(language).toLowerCase();
            const NORMALIZED_CATEGORY_KEY = CATEGORY.getKey(language)
               .toLowerCase()
               .normalize('NFKD')
               .replace(/[\u0300-\u036f]/g, '');
            const ALIASES = this.ALIASES || [];
            const CAT_ALIASES = CATEGORY.ALIASES || [];
            const CAT_PARENT_ALIASES = PARENT_CATEGORY.ALIASES || [];
            const COMMAND_NAME = this.NAME.toLowerCase();

            const originalAliases = ALIASES.map((alias) => `${ORIGINAL_CATEGORY_KEY} ${alias}`.toLowerCase());
            const translatedAliases = ALIASES.map((alias) => `${TRANSLATED_CATEGORY_KEY} ${alias}`.toLowerCase());
            const normalizedAliases = ALIASES.map((alias) => `${NORMALIZED_CATEGORY_KEY} ${alias}`.toLowerCase());
            const categoryAliasesKeys = CAT_ALIASES.map((catAlias) => `${catAlias} ${COMMAND_NAME}`.toLowerCase());
            const categoryAliasesCommand = CAT_ALIASES.flatMap((category) => ALIASES.map((alias) => `${category} ${alias}`));
            const parentCategoryAliasesCommand = CAT_PARENT_ALIASES.flatMap((category) => ALIASES.map((alias) => `${category} ${alias}`));
            const combinedAliases = [PARENT_CATEGORY.DEFAULT_KEY, PARENT_CATEGORY.getName(language), ...CAT_PARENT_ALIASES].flatMap(
               (parentAlias) =>
                  [CATEGORY.DEFAULT_KEY.split(' ')[1], CATEGORY.getName(language), ...CAT_ALIASES].flatMap((categoryAlias) =>
                     [COMMAND_NAME, ...ALIASES].map((commandAlias) => `${parentAlias} ${categoryAlias} ${commandAlias}`.toLowerCase()),
                  ),
            );

            parentKeys.push(
               `${ORIGINAL_CATEGORY_KEY} ${COMMAND_NAME}`,
               `${TRANSLATED_CATEGORY_KEY} ${COMMAND_NAME}`,
               `${NORMALIZED_CATEGORY_KEY} ${COMMAND_NAME}`,
               ...categoryAliasesCommand,
               ...categoryAliasesKeys,
               ...normalizedAliases,
               ...originalAliases,
               ...translatedAliases,
               ...parentCategoryAliasesCommand,
               ...combinedAliases,
            );
         }

         const langKeys = [...noParentKeys, ...parentKeys];

         const removedDupedLangKeys = [...new Set(langKeys)];
         this.LangKeysMap.set(`${this.NAME}-${language}`, removedDupedLangKeys);
         return removedDupedLangKeys;
      });

      const removedDupedKeys = [...new Set(...AllKeys)];
      return removedDupedKeys;
   }

   getLangKeys(language = process.env.LANGUAGE): string[] {
      const langKeys = this.LangKeysMap.get(`${this.NAME}-${language}`) || [];
      return [this.NAME.toLowerCase(), ...this.ALIASES!.map((a) => a.toLowerCase()), ...langKeys];
   }

   hasLangKey(cmdName, language = process.env.LANGUAGE) {
      return this.LangKeysMap.has(`${cmdName}-${language}`) || [];
   }
}
