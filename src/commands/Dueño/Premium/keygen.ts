import { Command } from '../../../structures/Command';
import Client from '../../../structures/Client';
import { Embed, ErrorEmbed } from '../../../extenders/discord/Embed';
import PremiumKeySchema from '../../../database/schemas/PremiumKeySchema';
import ms from 'ms';

export default {
   OPTIONS: [
      {
         STRING: {
            REQUIRED: true,
         },
      },
      {
         STRING_CHOICES: {
            REQUIRED: false,
            CHOICES: ['guild', 'user'],
         },
      },
   ],
   USAGE: '<Duración> <Tipo?>',
   execute(client: Client, message, args, prefix, guildData) {
      const duration = args[0];
      if (!duration)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.noargs.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.noargs.usage`, {
                     prefix,
                     cmdName: this.NAME,
                  }),
               ),
            ],
         });
      const msTime = parseInt(ms(duration));
      if (!msTime)
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.invalidDuration.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.error.invalidDuration.value`, {
                     prefix,
                     cmdName: this.NAME,
                  }),
               ),
            ],
         });

      const type = args[1]?.toLowerCase() || "user";
      // @ts-ignore

      const translatedObject = client.translate(guildData.language, `${this.LANG_PATH}.OPTIONS.1STRING_CHOICES.CHOICES`); // {off: "Desactivar", track: "Pista", queue: "Cola"};
      const keyTypes = Object.keys(translatedObject) as string[];
      const translatedKeyTypes = Object.values(translatedObject) as string[]; // ["Desactivar", "Pista", "Cola"]
      const translatedKeyTypesLowerCase = Object.values(translatedObject).map((e) => e.toLowerCase()) as string[]; // ["Desactivar", "Pista", "Cola"]

      if (![...keyTypes, ...translatedKeyTypes].map((m) => m?.toLowerCase?.()).includes(type))
         return message.reply({
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.invalidType.name`),
                  client.translate(guildData.language, `${this.LANG_KEY}.invalidType.value`, {
                     prefix,
                     cmdName: this.NAME,
                     cmdUsage: this.USAGE,
                     loopModes: translatedKeyTypes.map((m) => `- \`${m}\``).join('\n'),
                  }),
               ),
            ],
         });

      const selectedType = (keyTypes[translatedKeyTypesLowerCase.indexOf(type)] || type);

      const key = generateRandomKey();

      new PremiumKeySchema({
         key,
         expiration: msTime,
         type: selectedType,
      }).save();

      return message.author
         .send({
            content: client.translate(guildData.language, `${this.LANG_KEY}.success.content`),
            embeds: [
               new Embed()
                  .addField(client.translate(guildData.language, `${this.LANG_KEY}.success.copy.name`), `>>> \`\`\`yml\n${key}\`\`\``)
                  .addField(
                     client.translate(guildData.language, `${this.LANG_KEY}.success.duration.name`),
                     `>>> **${client.utils.general
                        .duration(msTime, guildData.language)
                        .map((d) => `\`${d}\``)
                        .join(', ')}**`,
                  )
                  .addField(
                     client.translate(guildData.language, `${this.LANG_KEY}.success.type.name`),
                     `>>> \`${client.translate(guildData.language, `${this.LANG_PATH}.OPTIONS.1STRING_CHOICES.CHOICES.${selectedType}`)}\``,
                  ),
            ],
         })
         .then(() => (message.token ? message.reply({ content: client.allemojis.yes }) : message.react(client.allemojis.yes)))
         .catch(() => (message.token ? message.reply({ content: client.allemojis.no }) : message.react(client.allemojis.no)));
   },
} as Command;

function generateRandomKey() {
   // CLAVE: XXXX-XXXX-XXXX-XXXX
   const posiblidades = 'ABCDEFGHIJLKMNOPQRSTUVWXYZ0123456789';
   let parte1 = '';
   let parte2 = '';
   let parte3 = '';
   let parte4 = '';
   for (let i = 0; i < 4; i++) {
      parte1 += posiblidades.charAt(Math.floor(Math.random() * posiblidades.length));
      parte2 += posiblidades.charAt(Math.floor(Math.random() * posiblidades.length));
      parte3 += posiblidades.charAt(Math.floor(Math.random() * posiblidades.length));
      parte4 += posiblidades.charAt(Math.floor(Math.random() * posiblidades.length));
   }
   // devolvemos la clave generada, por ej: ABJS-X252-GASH-6T1S
   return `${parte1}-${parte2}-${parte3}-${parte4}`;
}
