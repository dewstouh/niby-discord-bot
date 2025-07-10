import { PermissionResolvable } from 'discord.js';
import { CommandCooldown, isNsfwCategory, isPrivateCategory, isPremiumCategory } from '../typings/command';
import { Locale } from '../typings/locales';
import Client from './Client';
import categories from '../config/categories';
import { SubCategory } from './SubCategory';
import LocaleUtils from './utils/LocaleUtils';
import EmojiList from '../config/EmojiList';
interface Options {
   name: string;
   langKey?: string;
}

export class Category {
   COOLDOWN?: CommandCooldown | number;
   GUILD_ONLY?: boolean;
   NAME: string;
   PERMISSIONS?: PermissionResolvable[];
   BOT_PERMISSIONS?: PermissionResolvable[];
   DESCRIPTION: string;
   ALIASES?: string[];
   OWNER: boolean;
   NSFW: boolean;
   PREMIUM: boolean;
   LANG_KEY: string;
   DEFAULT_NAME: string;
   EMOJI: string;
   SUB_CATEGORIES: SubCategory[] = [];
   PARENT_CATEGORY?: Category;
   DEFAULT_KEY: string;
   KEY: string;
   LangKeys: string[] | undefined;
   LangKeysMap: Map<string, string[]> = new Map();
   AllKeys: string[] | undefined;

   constructor(client: Client, options: Options) {
      const { name, langKey } = options;

      this.DEFAULT_NAME = name;
      this.LANG_KEY = langKey || `CATEGORIES.${this.DEFAULT_NAME}`;
      this.NAME = client.translate(process.env.LANGUAGE as Locale, `${this.LANG_KEY}.NAME`);
      this.DEFAULT_KEY = name;
      this.KEY = this.NAME;
      this.DESCRIPTION = client.translate(process.env.LANGUAGE as Locale, `${this.LANG_KEY}.DESCRIPTION`);
      this.OWNER = isPrivateCategory(name);
      this.NSFW = isNsfwCategory(name);
      this.PREMIUM = isPremiumCategory(name);
      this.AllKeys = this.getAllKeys();
      this.LangKeys = this.AllKeys ? this.getLangKeys() : undefined;

      // Memory friendly method

      if (this.getCategoryDefaultSetting('ALIASES')) this.ALIASES = this.getCategoryDefaultSetting('ALIASES');
      if (this.getCategoryDefaultSetting('BOT_PERMISSIONS')) this.BOT_PERMISSIONS = this.getCategoryDefaultSetting('BOT_PERMISSIONS');
      if (this.getCategoryDefaultSetting('PERMISSIONS')) this.PERMISSIONS = this.getCategoryDefaultSetting('PERMISSIONS');
      this.EMOJI = this.getCategoryDefaultSetting('EMOJI') || EmojiList.question;
      if (this.getCategoryDefaultSetting('COOLDOWN')) this.COOLDOWN = this.getCategoryDefaultSetting('COOLDOWN');
      if (this.getCategoryDefaultSetting('GUILD_ONLY')) this.GUILD_ONLY = this.getCategoryDefaultSetting('GUILD_ONLY');
   }

   private getCategoryDefaultSetting(setting: string) {
      if (
         categories[this.DEFAULT_NAME] &&
         categories[this.DEFAULT_NAME][setting] &&
         typeof categories[this.DEFAULT_NAME][setting] !== 'undefined'
      )
         return categories[this.DEFAULT_NAME][setting];
      return false;
   }

   addSubCategory(subCategory: SubCategory): void {
      this.SUB_CATEGORIES.push(subCategory);
   }

   getSubCategory(name): SubCategory | undefined {
      return this.SUB_CATEGORIES.find((subCategory) => subCategory.DEFAULT_NAME === name);
   }

   getName(language: Locale = process.env.LANGUAGE) {
      return LocaleUtils.inlineLocale(language, `${this.LANG_KEY}.NAME`);
   }

   getKey(language: Locale = process.env.LANGUAGE) {
      return LocaleUtils.inlineLocale(language, `${this.LANG_KEY}.NAME`);
   }

   getDescription(language: Locale = process.env.LANGUAGE) {
      return LocaleUtils.inlineLocale(language, `${this.LANG_KEY}.DESCRIPTION`);
   }

   getAllKeys() {
      const AllKeys = LocaleUtils.getLocales().map((language) => {
         const noParentKeys: string[] = [];
         const parentKeys: string[] = [];

         const ORIGINAL_CATEGORY_KEY = this.DEFAULT_KEY.toLowerCase();
         const TRANSLATED_CATEGORY_KEY = this.getKey(language).toLowerCase();
         const NORMALIZED_CATEGORY_KEY = this.getKey(language)
            .toLowerCase()
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '');

         const CAT_ALIASES = this.ALIASES || [];

         const CAT_ALIAS_LOWER = CAT_ALIASES.map((alias) => alias.toLowerCase());
         const CAT_ALIASES_KEYS = CAT_ALIAS_LOWER.map((catAlias) => `${catAlias}`.toLowerCase());

         noParentKeys.push(
            `${ORIGINAL_CATEGORY_KEY}`,
            `${TRANSLATED_CATEGORY_KEY}`,
            `${NORMALIZED_CATEGORY_KEY}`,
            ...CAT_ALIASES_KEYS,
         );

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
      const catAliases = this.ALIASES || [];
      return [this.NAME.toLowerCase(), ...catAliases.map((a) => a.toLowerCase()), ...langKeys];
   }
}
