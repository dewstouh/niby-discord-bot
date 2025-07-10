const baseUrl = `${process.cwd()}/src/dashboard/views/`;
import express from 'express';
import Client from '../../structures/Client';
const router = express.Router();

router.get('/', async (req, res) => {
   if(!res.locals.bot.released) return res.redirect("/");
   try {
      const client = res.locals.bot;
      const totalData = await getBotStats(client);
      // Renderizar la página de status usando una plantilla (ejs, pug, etc.)
      res.render(baseUrl + 'status', { totalData });
   } catch (error) {
      console.error(error);
      res.status(500).send('Error al obtener el estado del bot');
   }
});

export default router;

export async function getBotStats(client:Client){
   const thisStats = await client.utils.general.receiveBotInfo();
   const totalData = (await client.cluster
      .broadcastEval('this.utils.general.receiveBotInfo()', {
         timeout: 10000,
      })
      .catch((e) => console.error(e))) || [thisStats];

   return totalData;
}
