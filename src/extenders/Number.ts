import addProperties from '../utils/addProperties';

addProperties(Number.prototype, {
   random: function (this: number, minPercentage = 0, maxPercentage = 100) {
      if (maxPercentage < minPercentage) {
         throw new Error('El valor máximo debe ser mayor o igual al valor mínimo.');
      }
      if (minPercentage < 0) throw new TypeError('El valor de porcentaje mínimo debe ser un número entero');
      if (maxPercentage < 0) throw new TypeError('El valor de porcentaje máximo debe ser un número entero');

      const range = ((this as number) * (maxPercentage - minPercentage)) / 100;
      return Math.floor(Math.random() * (range + 1) + minPercentage);
   }
});
