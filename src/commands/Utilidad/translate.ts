import { Command } from '../../structures/Command';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import Client from '../../structures/Client';
import translate from '@iamtraction/google-translate';

const languages = [
   { code: 'af', name: 'Afrikaans' },
   { code: 'ak', name: 'Akan' },
   { code: 'sq', name: 'Albanian' },
   { code: 'am', name: 'Amharic' },
   { code: 'ar', name: 'Arabic' },
   { code: 'an', name: 'Aragonese' },
   { code: 'hy', name: 'Armenian' },
   { code: 'as', name: 'Assamese' },
   { code: 'az', name: 'Azerbaijani' },
   { code: 'eu', name: 'Basque' },
   { code: 'be', name: 'Belarusian' },
   { code: 'bn', name: 'Bengali' },
   { code: 'bs', name: 'Bosnian' },
   { code: 'bg', name: 'Bulgarian' },
   { code: 'my', name: 'Burmese' },
   { code: 'ca', name: 'Catalan, Valencian' },
   { code: 'km', name: 'Central Khmer' },
   { code: 'ny', name: 'Chichewa, Chewa, Nyanja' },
   { code: 'co', name: 'Corsican' },
   { code: 'hr', name: 'Croatian' },
   { code: 'cs', name: 'Czech' },
   { code: 'da', name: 'Danish' },
   { code: 'nl', name: 'Dutch, Flemish' },
   { code: 'en', name: 'English' },
   { code: 'eo', name: 'Esperanto' },
   { code: 'et', name: 'Estonian' },
   { code: 'fi', name: 'Finnish' },
   { code: 'fr', name: 'French' },
   { code: 'gd', name: 'Gaelic, Scottish Gaelic' },
   { code: 'gl', name: 'Galician' },
   { code: 'ka', name: 'Georgian' },
   { code: 'de', name: 'German' },
   { code: 'el', name: 'Greek (Modern)' },
   { code: 'gu', name: 'Gujarati' },
   { code: 'ht', name: 'Haitian, Haitian Creole' },
   { code: 'ha', name: 'Hausa' },
   { code: 'hi', name: 'Hindi' },
   { code: 'hu', name: 'Hungarian' },
   { code: 'is', name: 'Icelandic' },
   { code: 'ig', name: 'Igbo' },
   { code: 'id', name: 'Indonesian' },
   { code: 'ga', name: 'Irish' },
   { code: 'it', name: 'Italian' },
   { code: 'ja', name: 'Japanese' },
   { code: 'kn', name: 'Kannada' },
   { code: 'kk', name: 'Kazakh' },
   { code: 'ko', name: 'Korean' },
   { code: 'kj', name: 'Kwanyama, Kuanyama' },
   { code: 'ku', name: 'Kurdish' },
   { code: 'ky', name: 'Kyrgyz' },
   { code: 'lo', name: 'Lao' },
   { code: 'la', name: 'Latin' },
   { code: 'lv', name: 'Latvian' },
   { code: 'lb', name: 'Letzeburgesch, Luxembourgish' },
   { code: 'lt', name: 'Lithuanian' },
   { code: 'lu', name: 'Luba-Katanga' },
   { code: 'mk', name: 'Macedonian' },
   { code: 'mg', name: 'Malagasy' },
   { code: 'ms', name: 'Malay' },
   { code: 'ml', name: 'Malayalam' },
   { code: 'mt', name: 'Maltese' },
   { code: 'mi', name: 'Maori' },
   { code: 'mr', name: 'Marathi' },
   { code: 'ro', name: 'Moldovan, Moldavian, Romanian' },
   { code: 'mn', name: 'Mongolian' },
   { code: 'ne', name: 'Nepali' },
   { code: 'no', name: 'Norwegian' },
   { code: 'pa', name: 'Panjabi, Punjabi' },
   { code: 'ps', name: 'Pashto, Pushto' },
   { code: 'fa', name: 'Persian' },
   { code: 'pl', name: 'Polish' },
   { code: 'pt', name: 'Portuguese' },
   { code: 'ru', name: 'Russian' },
   { code: 'sm', name: 'Samoan' },
   { code: 'sr', name: 'Serbian' },
   { code: 'sn', name: 'Shona' },
   { code: 'sd', name: 'Sindhi' },
   { code: 'si', name: 'Sinhala, Sinhalese' },
   { code: 'sk', name: 'Slovak' },
   { code: 'sl', name: 'Slovenian' },
   { code: 'so', name: 'Somali' },
   { code: 'st', name: 'Sotho, Southern' },
   { code: 'es', name: 'Spanish, Castilian' },
   { code: 'su', name: 'Sundanese' },
   { code: 'sw', name: 'Swahili' },
   { code: 'sv', name: 'Swedish' },
   { code: 'tl', name: 'Tagalog' },
   { code: 'tg', name: 'Tajik' },
   { code: 'ta', name: 'Tamil' },
   { code: 'tt', name: 'Tatar' },
   { code: 'te', name: 'Telugu' },
   { code: 'th', name: 'Thai' },
   { code: 'tr', name: 'Turkish' },
   { code: 'uk', name: 'Ukrainian' },
   { code: 'ur', name: 'Urdu' },
   { code: 'uz', name: 'Uzbek' },
   { code: 'vi', name: 'Vietnamese' },
   { code: 'cy', name: 'Welsh' },
   { code: 'fy', name: 'Western Frisian' },
   { code: 'wo', name: 'Wolof' },
   { code: 'xh', name: 'Xhosa' },
   { code: 'yi', name: 'Yiddish' },
   { code: 'yo', name: 'Yoruba' },
   { code: 'zu', name: 'Zulu' },
];

export default {
   OPTIONS: [
      {
         STRING: {
            REQUIRED: true,
         },
      },
      {
         STRING: {
            REQUIRED: true,
         },
      },
   ],
   USAGE: '<idioma> <texto>',
   execute(client: Client, message, args, prefix, guildData) {
      const language = args[0];
      const textToTranslate = args.slice(1).join(' ');

      if (!language)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.noargs.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.noargs.value`, {
                     prefix, cmdName: this.NAME
                  }),
               ),
            ],
         });

   const foundLanguage = languages.find((l) => l.code === args[0]);

    if(!foundLanguage) return message.reply({
        embeds: [
           new ErrorEmbed().setDescription(
              `### ${client.translate(guildData.language, `${this.LANG_KEY}.error.invalid.name`)}\n>>> ${client.translate(guildData.language, `${this.LANG_KEY}.error.invalid.value`)}\n${languages.map(language => `\`${language.code}\``).join(", ")}`,
           ),
        ],
     });

      if (!textToTranslate)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.notext.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.notext.value`),
               ),
            ],
         });

      translate(textToTranslate, { to: language })
         .then((translated) => {
            return message.reply({
               embeds: [
                  new Embed()
                     .setAuthor({
                        name: `${ client.translate(guildData.language, `${this.LANG_KEY}.success.author`)}: ${foundLanguage.code}`,
                        iconURL:
                           'https://images-ext-1.discordapp.net/external/rYRpLobZaWGO2UA5QujOwKElkUA9izyH5r3rPEycNSY/https/imgur.com/0DQuCgg.png',
                     })
                     .setDescription(`\`\`\`${translated.text}\`\`\``),
               ],
            });
         })
         .catch((err) => {
            console.error(err);
            return message.reply({
               embeds: [
                  new ErrorEmbed().addField(
                     client.translate(guildData.language, `${this.LANG_KEY}.error.name`),
                     client.translate(guildData.language, `${this.LANG_KEY}.error.value`),
                  ),
               ],
            });
         });
   },
} as Command;
