import { Message } from 'discord.js';
import Client from '../../../../structures/Client';
import { ExecuteSystems } from '../../../../handlers/SystemHandler';
// import { SystemHandler } from "../../../../handlers/SystemHandler";

export default async (client: Client, deletedMessage: Message) => {
   const { guild, author } = deletedMessage;
   const GUILD_DATA = guild ? await client.db.getGuildData(guild.id) : null;
   const USER_DATA = author ? await client.db.getUserData(author.id) : null;

   // @ts-ignore
   const eventName = this.default.NAME;
   return ExecuteSystems(client, eventName, GUILD_DATA, USER_DATA, deletedMessage);
};
