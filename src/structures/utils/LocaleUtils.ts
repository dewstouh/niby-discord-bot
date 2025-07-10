import i18n from 'i18n';
import { Locale as DiscordLocaleList } from 'discord.js';
import LocaleList from '../../config/LocaleEmojis';
import EmojiList from '../../config/EmojiList';
import { Locale } from '../../typings/locales';

interface EmojiLocale {
   [key: string]: string;
}

const emojiLocale: EmojiLocale = Object.entries(EmojiList).reduce((acc, [key, value]) => {
   // para acceder a todos los emojis sin añadirlos en los locales
   acc[`${key}Emoji`] = value;
   return acc;
}, {});

class LocaleUtils {
   constructor() {
      this.load();
   }

   getPercentageTranslated(locale: Locale|string):string{
      const originalLocaleValues = getAllStrings(i18n.getCatalog(i18n.getLocale()));
      const localeValues = getAllStrings(i18n.getCatalog(locale));
      const totalTranslatedTexts:number = originalLocaleValues.length;
      const completedTranslations:number = locale == i18n.getLocale() 
      ? totalTranslatedTexts
      : originalLocaleValues.length == localeValues.length ? localeValues.length : localeValues.filter((value) => !originalLocaleValues.includes(value)).length;

      return `${(completedTranslations / totalTranslatedTexts * 100).toFixed(2)}%`;

   }

   inlineLocalization(locale: Locale, name: string, desc: string) {
      const language = (Object.keys(DiscordLocaleList).find((key) => DiscordLocaleList[key] === locale) || process.env.LANGUAGE) as Locale;
      return {
         name: [locale, name],
         description: [locale, this.inlineLocale(language, desc)],
      };
   }

   inlineLocale(locale: Locale, text: string, ...params: object[]) {
      i18n.setLocale(locale);
      return i18n.__(text, { ...params[0], ...emojiLocale });
   }

   inlineChoicesLocale(text: string) {
      const o: Record<string, string> = {};
      i18n.getLocales().forEach((locale: string) => {
         o[DiscordLocaleList[locale] || locale] = this.inlineLocale(locale as Locale, text);
      });
      return o;
   }

   inlineDescriptionLocalization(name: string, text: string) {
      return i18n.getLocales().map((locale) => this.inlineLocalization(DiscordLocaleList[locale] || locale, name, text));
   }

   getLocales(): Locale[] {
      return i18n.getLocales() as Locale[];
   }

   load() {
      console.info('Cargando i18n...');
      i18n.configure({
         locales: Object.keys(DiscordLocaleList).filter((locale) => Object.keys(LocaleList).includes(locale)),
         defaultLocale: process.env.LANGUAGE,
         directory: `${process.cwd()}/locales`,
         retryInDefaultLocale: true,
         objectNotation: true,
         register: global,
         autoReload: true,
         logWarnFn: function (msg: string) {
            console.warn(msg);
         },
         logErrorFn: function (msg: string) {
            console.error(msg);
         },
         missingKeyFn: function (locale: string, value: string) {
            return value;
         },
         mustacheConfig: {
            tags: ['{{', '}}'],
            disable: false,
         },
      });
      console.success(`Cargados ${Object.keys(LocaleList).length} idiomas!`);
   }
}

function getAllStrings(obj) {
   const strings:string[] = [];

   function extractStrings(value) {
      if (typeof value === 'string') {
         strings.push(value);
      } else if (Array.isArray(value)) {
         value.forEach((item) => extractStrings(item)); // Llamada recursiva para cada elemento del array
      } else if (typeof value === 'object' && value !== null) {
         for (const key in value) {
            extractStrings(value[key]); // Llamada recursiva para objetos anidados
         }
      }
   }

   extractStrings(obj);
   return strings;
}

export default new LocaleUtils();
