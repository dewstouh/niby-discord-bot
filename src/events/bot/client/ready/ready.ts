import { ExecuteSystems } from '../../../../handlers/SystemHandler';
import Client from '../../../../structures/Client';
export default async (client: Client) => {
   console.success(`Sesión iniciada como: ${client.user?.tag} | Cluster #${client.cluster.id}`, {
      sendWebhook: true,
   });

   // Inicializar manager de musica
   await client.lavalink.init({id: client!.user!.id, username: client!.user!.username, shards: client.options.shards});

   // Update status
   client.updateStatus();
   setInterval(() => client.updateStatus(), 30 * 60 * 1000); // 30 mins

   client.setInvite();
   // require the Dashboard
   if (process.env.DASHBOARD == "true") await import('../../../../dashboard/index').then(pull => pull.default(client));

   await client.publishCommands();
   // Wait 1s before releasing
   await client.utils.general.delay(1000);
   await client.prepareCommands();
   
   // @ts-ignore
   const eventName = this.default.NAME;
   return ExecuteSystems(client, eventName, null, null);
};
