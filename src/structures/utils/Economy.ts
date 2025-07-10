import Client from "../Client";

export default class EconomyUtils {
   client: Client;
   constructor(client) {
      this.client = client;
   }

   getRandomLoseCoins(maxLosePercentage, userMoney) {
      // Calculamos el porcentaje aleatorio a perder
      const porcentajeAleatorio = Math.random() * maxLosePercentage;

      // Calculamos la cantidad de monedas a perder en base al porcentaje aleatorio
      const monedasAPerder = Math.floor((porcentajeAleatorio / 100) * userMoney);

      // Aseguramos que la cantidad de monedas a perder no sea mayor que la cantidad actual
      return Math.min(monedasAPerder, userMoney);
   }
}
