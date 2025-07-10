/* eslint-disable @typescript-eslint/no-unused-vars */
import { QueueChangesWatcher } from "lavalink-client";
import Client from "../Client";

export default class CustomWatcher implements QueueChangesWatcher {
   private client:Client;
   constructor(client:Client) {
       this.client = client;
   }
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   shuffled(guildId, oldStoredQueue, newStoredQueue) {
    //    console.log(`${this.client.guilds.cache.get(guildId)?.name || guildId}: Queue got shuffled`)
   }
   tracksAdd(guildId, tracks, position, oldStoredQueue, newStoredQueue) {
    //    console.log(`${this.client.guilds.cache.get(guildId)?.name || guildId}: ${tracks.length} Tracks got added into the Queue at position #${position}`);
   }
   tracksRemoved(guildId, tracks, position, oldStoredQueue, newStoredQueue) {
    //    console.log(`${this.client.guilds.cache.get(guildId)?.name || guildId}: ${tracks.length} Tracks got removed from the Queue at position #${position}`);
   }
}
