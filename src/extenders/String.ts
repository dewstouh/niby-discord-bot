import addProperties from '../utils/addProperties';

addProperties(String.prototype, {
   isValidUrl: function (this: string) {
      const regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
      return !!regex.test(this);
   },

   escape: function (this:string) {
      return this.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
   },

   capitalizeFirstChar: function (this:string) {
      return this.charAt(0).toUpperCase() + this.slice(1);
   },

   removeLastChar: function (this:string) {
      return this.charAt(0).toUpperCase() + this.slice(1);
   },

   toCamelCase: function (this:string) {
      const replaced = this.replace(/[-_](.)/g, (match, group1) => {
         return group1.toUpperCase();
      });
      return replaced.charAt(0).toLowerCase() + replaced.slice(1);
   },

   toPascalCase: function (this:string) {
      return this.toLowerCase()
         .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
         .replace(/[_\s]+/g, ''); // Eliminar guiones bajos y espacios
   },

   toSnakeCase: function (this:string) {
      return this.replace(/([a-z])([A-Z])/g, '$1_$2')
         .replace(/[^a-zA-Z0-9_]+/g, '_') // Reemplazar caracteres no alfanuméricos con guiones bajos
         .replace(/^_+|_+$/g, '') // Eliminar guiones bajos al comienzo y final
         .toLowerCase();
   },
});
