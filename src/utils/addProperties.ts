export default function addProperties(type: any, properties: object) {
   const entries = Object.entries(properties);
   for(const [key, value] of entries){
      Object.defineProperty(type, key, {value, configurable: true});
   }
}
