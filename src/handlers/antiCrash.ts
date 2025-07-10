import Client from "../structures/Client";

export default (client:Client) => {
   if(client.cache.get("loadedAntiCrash")) return;

   console.log(
`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                            ┃
┃${"       🛡 [:::: ANTICRASH PROTECTION ENABLED ::::] 🛡         ".cyan.bold +"┃"}
┃                                                            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`);
   process.on('unhandledRejection', (reason, p) => {
      console.info(' [ANTICRASH] - unhandledRejection'.grey);
      console.error(reason, p + ''.grey);
   });
   process.on('uncaughtException', (err, origin) => {
      console.info(' [antiCrash] :: uncaughtException'.grey);
      console.error(err, origin + ''.grey);
   });
   process.on('uncaughtExceptionMonitor', (err, origin) => {
      console.info(' [antiCrash] :: uncaughtExceptionMonitor'.grey);
      console.error(err, origin + ''.grey, {sendWebhook: false});
   });

   ['SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM', 'SIGQUIT'].forEach((signal) =>
      process.on(signal, async () => {
         /** Do your logic */
         console.log('El bot ha sido apagado (Salida de proceso)', {
            sendWebhook: true,
         });
         await new Promise((resolve) => {
            setTimeout(resolve, 500); // Suficiente para mostrar el webhook de apagado
         });
         process.exit();
      }),
   );
   client.cache.set("loadedAntiCrash", true);
};
