/* eslint-disable @typescript-eslint/ban-ts-comment */
import mongoose from 'mongoose';

if(process.env.CACHE_DB !== "true"){
   mongoose.Query.prototype.cacheQuery = function() {
      return this.exec();
  };
}

function findOrCreate(condition: object = {}, createWith: object = {}) {
   return new Promise((resolve, reject) => {
      // @ts-ignore
      this.findOne(condition)
         .cacheQuery()
         .then((data) => {
            if (!data) {
               // @ts-ignore
               data = new this(createWith.isValid() ? createWith : condition);
               return data.save();
            }
            return data;
         })
         .then((data) => {
            resolve(data);
         })
         .catch((error) => {
            reject(error);
         });
   });
}

function getRandom(condition: object = {}) {
   return new Promise((resolve, reject) => {
      //@ts-ignore
      this.find(condition)
         .then((data) => {
            resolve(data.random());
         })
         .catch((error) => {
            reject(error);
         });
   });
}

// ASIGNAR AL MODELO O SI NO, NO FUNCIONARÁ

Object.assign(mongoose.Model, {
   findOrCreate,
   getRandom,
});
