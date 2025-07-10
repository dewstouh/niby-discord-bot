/* eslint-disable @typescript-eslint/no-unused-vars */

// @ts-nocheck
// @ts-ignore
import fetch from 'node-fetch';
import {Cache,  RedisCache } from '../Cache';

const SearchType = {
   PAGE: 'dapi',
   POST: 'post',
   INDEX: 'index',
   PID: 0,
   LIMIT: 100,
   SHOW_UNAVAILABLE: false,
   MIN_SCORE: 5,
};

export type BooruTypes = "rule34" | "realbooru" | "konachan"

const apiUrls = {
   "rule34": "https://rule34.xxx/index.php",
   "realbooru": "https://realbooru.com/index.php"
}

const cacheDuration = 2 * 60 * 60 * 1000; // 2 horas de duracion cache

interface WrapperOptions {
   cache:RedisCache | Cache,
   token?:string,
}

export default class Booru {
   constructor(options:WrapperOptions) {
      this.cache = options.cache; // En el mismo cache, añadir links.[tag] y requests-id.tag
   }

   async getCacheData(cacheId) {
      return (
         await this.cache.get(cacheId) || {
            index: SearchType.PID,
            watched: [],
            to_watch: [],
         }
      );
   }

   async getCachedResults(cached, tags, limit, cacheId, type) {
      const cacheKey = `${cacheId}-${type}-[${tags}]`;
      // SI EL USUARIO YA HA VISTO ALGO, SACAMOS LOS VISTOS DE LA CACHÉ Y EMPUJAMOS LOS NUEVOS DE POR VER DE LOS SACADOS + RESULTS
      const resulted = [];
      const watched = cached.to_watch.splice(0, limit);
      const newToWatch = [...new Set([...cached.to_watch])];

      cached.to_watch = newToWatch;
      cached.watched.push(...watched);
      resulted.push(...watched);

      cached.index += 1;
      await this.cache.set(cacheKey, cached, cacheDuration);

      return resulted;
   }

   async getResultsAndCache(results, cached, tags, limit, cacheId, type) {
      const cacheKey = `${cacheId}-${type}-[${tags}]`;
      const requesterCacheData = cached;
      const resulted = [];
      results = results.map(r => type === "rule34" ? r.file_url : `${apiUrls.realbooru.replace("index.php", "")}/images/${r.directory}/${r.image}`); // GUARDAR SOLO LA URL DE LA IMAGEN

      // NI LO TOCO PORQUE DA MIEDO XD
      // / SI EL USUARIO NO HA BUSCAOD NADA DE ESO, DE LOS RESULTADOS, EXTRAEMOS LIMITE CANTIDAD, EL RESTO SON POR VER, LOS EMPUJAMOS
      if (requesterCacheData.index === 0) {
         const watched = results.splice(0, limit);
         const toWatch = results;
         requesterCacheData.to_watch.push(...toWatch);
         requesterCacheData.watched.push(...watched);
         resulted.push(...watched);
      } else {
         // SI EL USUARIO YA HA VISTO ALGO, SACAMOS LOS VISTOS DE LA CACHÉ Y EMPUJAMOS LOS NUEVOS DE POR VER DE LOS SACADOS + RESULTS
         const watched = requesterCacheData.to_watch.splice(0, limit);
         const toWatch = [...new Set([...requesterCacheData.to_watch, ...results])];

         requesterCacheData.to_watch = toWatch;
         requesterCacheData.watched.push(...watched);
         resulted.push(...watched);
      }

      // AUMENTAMOS +1 LA PAGINA (O COLUMNA)
      if (resulted.length === 0) {
         requesterCacheData.index = 0;
         resulted.push(requesterCacheData?.watched?.random());
      }
      requesterCacheData.index++;

      await this.cache.set(cacheKey, requesterCacheData, cacheDuration);
      return resulted;
   }

   async search(
      tags = [],
      options = {
         limit: 1,
         random: true,
         showUnavailable: SearchType.SHOW_UNAVAILABLE,
         cacheId: null,
         minScore: SearchType.MIN_SCORE,
         type: "rule34",
      },
   ) {
      // eslint-disable-next-line prefer-const, no-unused-vars
      let { limit, random, showUnavailable, cacheId, minScore, type } = options;
      if (limit > SearchType.LIMIT) limit = SearchType.LIMIT;

      if (typeof tags === 'string') tags = tags.split(' ').filter((t) => t !== '');
      if (parseInt(minScore)) tags.push(`score:>=${minScore}`);

      const foundApiUrl = apiUrls[type];
      if(!foundApiUrl) throw new Error(`[BOORU WRAPPER] NO API URL FOUND FOR ${type}`);


      // Obtener la caché de páginas del usuario
      const requesterCacheData = await this.getCacheData(`${cacheId}-${type}-[${tags}]`);
      const { to_watch, index } = requesterCacheData;

      if (to_watch.length > 10 && index > 0) return this.getCachedResults(requesterCacheData, tags, limit, cacheId, type);
      const params = new URLSearchParams({
         page: SearchType.PAGE,
         pid: index,
         s: SearchType.POST,
         q: SearchType.INDEX,
         tags: tags.join(' '),
         json: '1',
         limit: SearchType.LIMIT,
         deleted: showUnavailable,
      });

      const apiUrl = `${foundApiUrl}?${params}`;

      try {
         const response = await fetch(apiUrl);
         const data = await response.json();
         const results = data.shuffle();
         if (cacheId) return this.getResultsAndCache(results, requesterCacheData, tags, limit, cacheId, type);
         return results;
      } catch (e) {
         console.log('Error 404 - Not Found');
         return null
      }
   }
}
