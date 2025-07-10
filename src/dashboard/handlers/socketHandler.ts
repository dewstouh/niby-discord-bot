import Client from '../../structures/Client';
import { getBotStats } from '../routes/status';

export default (io, client: Client) => {
   // io.on('connection', (socket) => {
   //    console.log('Cliente conectado:', socket.id);

   //    // Manejo de eventos para este socket
   //    // socket.on('updateStats', (updatedData) => {
   //    //    console.log('UPDATED STATS\n' + updatedData);
   //    // });
   // });

   setInterval(async () => {
      const clusterStats = await getBotStats(client);

      const updatedData = {
         userCount: client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0),
         serverCount: client.guilds.cache.size,
         commandCount: client.commands.size,
         ping: client.ws.ping,
      };

      // Emitir los datos actualizados a los clientes
      io.emit('updateStats', updatedData);
      if (Date.now() > clusterStats[0].validUntil) io.emit('updateShards', clusterStats);
   }, 5000); // 5000 milisegundos = 5 segundos
};
