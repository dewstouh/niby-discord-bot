import {
   ClusterManager as DefaultClusterManager,
   ClusterManagerMode,
   ClusterManagerOptions,
   HeartbeatManager,
} from 'discord-hybrid-sharding';
import { Collection } from 'discord.js';

const mode: ClusterManagerMode =
   process.env.SHARDING_MODE === 'worker' || process.env.SHARDING_MODE === 'process' ? process.env.SHARDING_MODE : 'worker';

const DefaultClusterOptions: ClusterManagerOptions = {
   totalShards: Number(process.env.TOTAL_SHARDS) || 'auto',
   shardsPerClusters: Number(process.env.SHARDS_PER_CLUSTER) || 1,
   mode,
   token: process.env.BOT_TOKEN,
   respawn: true,
};

// Ahora puedes usar parentDir en tu ruta
export default class ClusterManager extends DefaultClusterManager {
   events: Collection<string, Event> = new Collection();
   constructor(path: string, options: ClusterManagerOptions = DefaultClusterOptions) {
      super(path, options);
      this.start();
   }

   start() {
      this.loadEvents();
      this.spawn({ timeout: -1 });
      this.extend(new HeartbeatManager({ interval: 2000, maxMissedHeartbeats: 5 }));
   }

   loadEvents() {
      this.on('clusterCreate', (cluster) => {
         console.log(`[Cluster #${cluster.id}] Iniciado`.magenta);

         cluster.on('error', (err) => {
            return console.error(`[CLUSTER #${cluster.id}] ERROR`, err, {
               sendWebhook: true,
            });
         });

         cluster.on('death', () => {
            return console.error(`[CLUSTER #${cluster.id}] CRASH`, {
               sendWebhook: true,
            });
         });

      });
   }
}
