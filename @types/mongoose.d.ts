/* eslint-disable @typescript-eslint/ban-ts-comment */
export {};
/* eslint-disable @typescript-eslint/no-explicit-any */

// Extendemos el tipo de Model para agregar los métodos
declare module 'mongoose' {
   // @ts-ignore
   interface Model<T extends Document> {
      findOrCreate(condition: object, createWith?: any): Promise<T | null>;
      getRandom(condition: object): Promise<T | null>;
   }
}
