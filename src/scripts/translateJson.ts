// import * as translator from '@parvineyvazov/json-translator';
// import {Locale as DiscordLocaleList} from 'discord.js'
// import LocaleList from '../config/LocaleEmojis';

import mainLang from '../../locales/SpanishES.json'
import secondLang from '../../locales/Dutch.json'
import util from 'util';

console.log(util.inspect(getDifferences(mainLang, secondLang), {showHidden: false, depth: null, colors: true}))
    

    function getDifferences(objetoA: any, objetoB: any): Record<string, any> {
        const diferencias: Record<string, any> = {};
     
        for (const [key] of Object.entries(objetoA)) {
           if (objetoA.hasOwnProperty(key)) {
              if (typeof objetoA[key] === 'object' && typeof objetoB[key] === 'object') {
                 const subDiferencias = getDifferences(objetoA[key], objetoB[key]);
                 if (Object.keys(subDiferencias).length > 0) {
                    diferencias[key] = subDiferencias;
                 }
              } else if (objetoB[key] !== undefined && objetoA[key] !== objetoB[key]) {
                 diferencias[key] = objetoA[key];
              }
           }
        }
     
        return diferencias;
     }