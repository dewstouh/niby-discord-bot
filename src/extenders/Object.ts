import addProperties from '../utils/addProperties';

addProperties(Object.prototype, {
   isValid: function (this:object): boolean {
      return typeof this === 'object' && this !== null && Object.keys(this).length > 0;
   },

   isEqual: function (this:object, otherObject:object): boolean {
      return JSON.stringify(this) === JSON.stringify(otherObject);
   },
});
