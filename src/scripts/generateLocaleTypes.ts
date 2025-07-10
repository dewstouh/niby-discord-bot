import fs from 'fs';
import LocaleData from '../config/LocaleEmojis.json';

const typeDeclarations = Object.entries(LocaleData).map(([key]) => `"${key}"`).join(" | ");

const typesContent = `
export type Locale = ${typeDeclarations};
`;

fs.writeFileSync(`${process.cwd()}/src/typings/locales.d.ts`, typesContent); // Escribe los tipos en un archivo .d.ts
console.log('Types de LOCALES generados correctamente!');
