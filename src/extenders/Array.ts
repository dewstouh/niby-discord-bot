import addProperties from '../utils/addProperties';

addProperties(Array.prototype, {
   shuffle: function (this: Array<any>) {
      for (let i = this.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [this[i], this[j]] = [this[j], this[i]];
      }
      return this;
   },

   random: function(this: Array<any>) {
      return this[Math.floor(Math.random() * this.length)]
   },

   move: function<T>(this: T[], srcIndex: number, destinyIndex: number): T[] {
      if (srcIndex < 0 || srcIndex >= this.length || destinyIndex < 0 || destinyIndex >= this.length) {
        throw new Error("invalid move array indexes");
      }
    
      const elemento = this.splice(srcIndex, 1)[0];
      this.splice(destinyIndex, 0, elemento);
      return this;
    }
});
