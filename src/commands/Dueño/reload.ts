import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import Client from '../../structures/Client';
import { Command } from '../../structures/Command';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
export default {
   OPTIONS: [
      {
         STRING_CHOICES: {
            REQUIRED: false,
            CHOICES: [
               'comandos',
               'menciones',
               'eventos',
               'handlers',
               'clusters',
               'botones',
               'menus',
               'contextmenus',
               'modales',
               'componentes',
            ],
         },
      },
   ],
   USAGE: "<módulo>",
   async execute(client: Client, message, args, prefix, guildData) {
      const FIRST_UPPER = args[0]
         ? args[0][0].toUpperCase() + args[0].substring(1)
         : client.translate(guildData.language, `${this.LANG_KEY}.default`); // "Comandos, Eventos y Handlers";

      const RELOADING_MSG = await message.reply({
         embeds: [
            new Embed().addFields({
               name: client.translate(guildData.language, `${this.LANG_KEY}.loading.name`, {
                  module: FIRST_UPPER,
               }), // `${client.allemojis.loading} Recargando ${FIRST_UPPER}`,
               value: client.translate(guildData.language, `${this.LANG_KEY}.loading.value`), // `>>> Espera unos segundos...`
            }),
         ],
         ephemeral: true,
         fetchReply: true,
      });

      try {
         await execAsync(`npx tsc --project ${process.cwd()}`); // RECOMPILE EVERYTHING AGAIN;
         switch (args[0]?.toLowerCase()) {
            case 'comands':
            case 'comandos':
               {
                  await client.loadCommands();
                  await client.publishCommands();
               }
               break;

            case 'menciones':
               {
                  await client.loadCommands();
                  await client.publishCommands();
                  await client.utils.general.delay(1000);
                  await client.prepareCommands();
               }
               break;

            case 'eventos':
            case 'events':
               {
                  await client.loadEvents();
               }
               break;

            case 'handlers':
               {
                  await client.loadHandlers();
               }
               break;

            case 'clusters':
               {
                  await client.cluster.broadcastEval('this.reloadAll()').then((results) => results);
               }
               break;

            case 'botones':
               {
                  await client.loadComponent("buttons");
               }
               break;

            case 'menus':
               {
                  await client.loadComponent("menus");
               }
               break;

            case 'contextmenus':
               {
                  await client.loadComponent("contextmenus");
               }
               break;
            case 'modales':
               {
                  await client.loadComponent("modals");
               }
               break;

            case 'componentes':
               {
                  await client.loadAllComponents();
               }
               break;

            default:
               {
                  await client.reloadAll();
               }
               break;
         }

         await client.utils.message.edit(message, RELOADING_MSG, {
            embeds: [
               new Embed()
                  .addFields({
                     name: client.translate(guildData.language, `${this.LANG_KEY}.reloaded.name`, {
                        module: FIRST_UPPER,
                     }), // `${client.allemojis.loading} Recargando ${FIRST_UPPER}`,
                     value: client.translate(guildData.language, `${this.LANG_KEY}.reloaded.value`), // `>>> Espera unos segundos...`
                  })
            ],
         });
      } catch (e) {
         console.error(e);
         return await client.utils.message.edit(message, RELOADING_MSG, {
            embeds: [
               new ErrorEmbed().addField(
                  client.translate(guildData.language, `${this.LANG_KEY}.error.name`), // `${client.allemojis.no} Ha ocurrido un error a al recargar el bot!`,
                  client.translate(guildData.language, `${this.LANG_KEY}.error.value`), // `> *Mira la consola para más detalles.*`)
               ),
            ],
            ephemeral: true,
         });
      }
   },
} as Command;
