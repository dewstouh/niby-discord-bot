import { LavalinkManager as DefaultLavalinkManager, DefaultQueueStore, ManagerOptions } from 'lavalink-client';
import Client from './Client';
import RedisStore from './utils/RedisStore';
import RedisWatcher from './utils/CustomWatcher';
import music from '../config/music';
import path from 'path';

export default class LavalinkManager extends DefaultLavalinkManager {
   client: Client;
      constructor(client: Client) {
      const DefaultManagerOptions = {
         nodes: music.nodes,
         sendToShard: (guildId, payload) => client.guilds.cache.get(guildId)?.shard?.send(payload),
         autoSkip: true,
         client: {
            id: "0",
            username: "Bot",
         },
         playerOptions: {
            applyVolumeAsFilter: false,
            clientBasedPositionUpdateInterval: 1000, // in ms to up-calc player.position
            defaultSearchPlatform: music.defaultSearchPlatform,
            volumeDecrementer: 1, // on client 100% == on lavalink 100%
            requesterTransformer: client.utils.music.requesterTransformer,
            onDisconnect: {
               autoReconnect: false, // automatically attempts a reconnect, if the bot disconnects from the voice channel, if it fails, it get's destroyed
               destroyPlayer: false, // overrides autoReconnect and directly destroys the player if the bot disconnects from the vc
            },
            onEmptyQueue: {
               autoPlayFunction: client.utils.music.autoPlayFunction,
            },
            useUnresolvedData: true,
         },
         queueOptions: {
            maxPreviousTracks: 10,
            queueStore: client.redisClient ? new RedisStore(client.redisClient) : new DefaultQueueStore(),
            queueChangesWatcher: client.redisClient ? new RedisWatcher(client) : undefined,
         },
      } as ManagerOptions;

      super(DefaultManagerOptions);
      this.client = client;
      this.load();
   }

   async load(){
      await this.loadEvents();
   }

   async loadEvents(dir: string = '/src/events/lavalink') {
      console.info('(+) Cargando eventos de Lavalink');

      this.removeAllListeners();

      const RUTA_ARCHIVOS = await this.client.utils.general.loadFiles(dir);
      const RUTA_EVENTOS = RUTA_ARCHIVOS.filter((p) => !p.includes('systems'));
      const RUTA_SISTEMAS = RUTA_ARCHIVOS.filter((p) => p.includes('systems'));

      if (RUTA_EVENTOS.length) {
         await Promise.all(
            RUTA_EVENTOS.map(async (ruta) => {
               const PULL = (await import(ruta)).default;
               const PULL_NAME = path.basename(ruta).split('.')[0];
               PULL.NAME = path.basename(ruta).split('.')[0];
               PULL.PATH = ruta;
               PULL.LANG_KEY = `EVENTS.${PULL_NAME}.execute`;
               const EVENT_NAME = PULL_NAME;
               // @ts-ignore
               if (ruta.includes('lavalink') && !ruta.includes('nodeManager')) this.on(PULL_NAME, PULL.bind(null, this));
               // @ts-ignore
               else if (ruta.includes('lavalink') && ruta.includes('nodeManager')) this.nodeManager.on(PULL_NAME, PULL.bind(null, this));

               const eventSystemsPath = RUTA_SISTEMAS.filter((p) => p.includes(PULL_NAME));
               if (eventSystemsPath.length) {
                  eventSystemsPath.map(async (systemPath) => {
                     const PULL = (await import(systemPath)).default;
                     PULL.NAME = path.basename(systemPath).split('.')[0];
                     PULL.PATH = systemPath;
                     PULL.EVENT = EVENT_NAME;
                     PULL.LANG_KEY = `EVENTS.${EVENT_NAME}.SYSTEMS.${PULL.NAME}.execute`;
                     const PULL_NAME = path.basename(systemPath).split('.')[0];
                     this.client.systems.set(PULL_NAME, PULL);
                  });
               }
            }),
         );
      }
      console.success(`(+) ${RUTA_ARCHIVOS.length} ${RUTA_ARCHIVOS.length !== 1 ? 'Eventos de Lavalink Cargados' : 'Evento de Lavalink Cargado'}`);
   }
}
