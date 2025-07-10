import path from 'path';

export default async function ezLoad(filePath: string): Promise<any> {
   // Obtener la ruta absoluta del archivo actual
   const targetModulePath = path.resolve(`${process.cwd()}/${filePath}`.replace("src", "dist"));

   // Limpiar caché de require
   delete require.cache[targetModulePath];
   const returned = (await require(targetModulePath))
   return returned.default !== undefined ? returned.default : returned;
}
