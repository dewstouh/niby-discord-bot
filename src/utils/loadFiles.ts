import fastGlob from 'fast-glob';
import path from 'path';

export default async function loadFiles(
   dirName: string,
   includedExtensions: string[] = ['js', 'json'],
   excludeFiles: string[] | null = null,
   excludeFolders: string[] | null = ["node_modules"],
): Promise<string[]> {
   const distDirName = dirName.replace('src', 'dist');
   const globPattern =
      includedExtensions.length === 1
         ? `${process.cwd().replace(/\\/g, '/')}/${distDirName}/**/*.${includedExtensions[0]}`
         : `${process.cwd().replace(/\\/g, '/')}/${distDirName}/**/*.{${includedExtensions.join(',')}}`;

   let files = await fastGlob(globPattern);

   if (excludeFiles) {
      files = files.filter((path) => !excludeFiles.some((excludedFile) => path.endsWith(excludedFile)));
   }

   if (excludeFolders) {
      files = files.filter((path) => !excludeFolders.some((excludedFolder) => path.includes(excludedFolder)));
   }

   // Eliminar la caché de requerimientos para cada archivo cargado
   files.forEach((filePath) => {
      const fullPath = path.resolve(filePath);
      delete require.cache[fullPath];
   });

   return files;
}
