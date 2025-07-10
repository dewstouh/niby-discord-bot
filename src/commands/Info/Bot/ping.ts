import { ChatInputCommandInteraction, Message } from "discord.js";
import { Embed } from "../../../extenders/discord/Embed";
import Client from "../../../structures/Client";
import { Command } from "../../../structures/Command";

export default {
   ALIASES: ['latency', 'ms'],
   async execute(client:Client, message:Message | ChatInputCommandInteraction, args, prefix:string, guildData) {
      const dbLatency = await client.db.getLatency(message.guild!.id);
      const dbPing = await client.db.getPing();
      message.reply({
         embeds: [
            new Embed()
               .addFields([
                  {
                     name: client.translate(guildData.language, `${this.LANG_KEY}.embed.field1.name`, {
                        emoji: client.allemojis.discord,
                     }),
                     value: `> \`${Math.abs(client.ws.ping)}ms\``,
                     inline: true,
                  },
                  {
                     name: client.translate(guildData.language, `${this.LANG_KEY}.embed.field2.name`, {
                        emoji: client.allemojis.wait,
                     }),
                     value: `> \`${Math.abs(dbLatency)}ms\``,
                     inline: true,
                  },
                  {
                     name: client.translate(guildData.language, `${this.LANG_KEY}.embed.field3.name`, {
                        emoji: client.allemojis.online,
                     }),
                     value: `> \`${Math.abs(dbPing)}ms\``,
                     inline: true,
                  },
               ])
               .setFooter({
                  text: client.translate(guildData.language, `${this.LANG_KEY}.embed.footer`),
               }),
            // .setFooter({ text: `Estos tiempos de respuesta son aproximados` })
         ],
         ephemeral: true,
      });
   },
} as Command;
