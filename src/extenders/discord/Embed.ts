import { APIEmbed, EmbedBuilder, EmbedData } from 'discord.js';


class Embed extends EmbedBuilder {
   constructor(data?: EmbedData | APIEmbed) {
      super(data);
      this.setColor(process.env.DEFAULT_COLOR);
   }
   addField(name: string, value: string, inline?: boolean) {
      return this.addFields({
         name: String(name).substring(0, 256),
         value: String(value).substring(0, 1024),
         inline: !!inline,
      });
   }
}

class ErrorEmbed extends EmbedBuilder {
   constructor(data?: EmbedData | APIEmbed) {
      super(data);
      this.setColor(process.env.ERROR_COLOR);
   }
   addField(name: string, value: string, inline?: boolean) {
      return this.addFields({
         name: String(name).substring(0, 256),
         value: String(value).substring(0, 1024),
         inline: !!inline,
      });
   }
}

EmbedBuilder.prototype.addField = function (name:string, value:string, inline?:boolean) {
   return this.addFields({
      name: String(name).substring(0, 256),
      value: String(value).substring(0, 1024),
      inline: !!inline,
   });
};

export { Embed, ErrorEmbed };
