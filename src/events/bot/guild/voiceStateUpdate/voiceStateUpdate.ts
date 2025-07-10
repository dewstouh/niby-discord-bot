import { VoiceState } from 'discord.js';
import Client from '../../../../structures/Client';
import { ExecuteSystems } from '../../../../handlers/SystemHandler';
// import { SystemHandler } from "../../../../handlers/SystemHandler";

export default async (client: Client, oldState:VoiceState, newState:VoiceState) => {
   const { guild, id } = oldState;
   const GUILD_DATA = guild ? await client.db.getGuildData(guild.id) : null;
   const USER_DATA = id ? await client.db.getUserData(id) : null;

   // @ts-ignore
   const eventName = this.default.NAME;
   return ExecuteSystems(client, eventName, GUILD_DATA, USER_DATA, oldState, newState);
};
