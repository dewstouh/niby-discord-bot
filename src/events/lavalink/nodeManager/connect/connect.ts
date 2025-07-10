import { ExecuteSystems } from "../../../../handlers/SystemHandler";
import LavalinkManager from "../../../../structures/LavalinkManager";

export default (manager:LavalinkManager, node) => {
   console.success(`Conectado al nodo ${node.id} de LAVALINK!`);

   // @ts-ignore
   const eventName = this.default.NAME;
   return ExecuteSystems(manager.client, eventName, null, null, manager);
};
