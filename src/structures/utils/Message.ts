import Client from '../Client';

import {
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle,
   EmbedBuilder,
   Message,
   ModalBuilder,
   TextInputBuilder,
   TextInputStyle,
   parseEmoji,
} from 'discord.js';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';

type PaginationOptions = {
   startFrom?: number;
   extraEmbeds?: Embed[] | ErrorEmbed[] | EmbedBuilder[];
   messageToEdit?: Message;
   content?: string;
};

export default class MessageUtils {
   client: Client;
   constructor(client) {
      this.client = client;
   }

   extractEmojis(stringInput, filterDupes = false) {
      const emojiMatches =
         /(<?(a)?:?(\w{2,32}):(\d{17,19})>?|(?:\ud83d\udc68\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc68\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffc]|\ud83d\udc68\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffd]|\ud83d\udc68\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffe]|\ud83d\udc69\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffc-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffd-\udfff]|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffb|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb\udffc\udffe\udfff]|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb\udffc]|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffd\udfff]|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb-\udffd]|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c[\udffb-\udffe]|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c[\udffb-\udffe]|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffb|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb\udffc]|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udffd]|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udffe]|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c[\udffb-\udfff]|\ud83e\uddd1\u200d\ud83e\udd1d\u200d\ud83e\uddd1|\ud83d\udc6b\ud83c[\udffb-\udfff]|\ud83d\udc6c\ud83c[\udffb-\udfff]|\ud83d\udc6d\ud83c[\udffb-\udfff]|\ud83d[\udc6b-\udc6d])|(?:\ud83d[\udc68\udc69])(?:\ud83c[\udffb-\udfff])?\u200d(?:\u2695\ufe0f|\u2696\ufe0f|\u2708\ufe0f|\ud83c[\udf3e\udf73\udf93\udfa4\udfa8\udfeb\udfed]|\ud83d[\udcbb\udcbc\udd27\udd2c\ude80\ude92]|\ud83e[\uddaf-\uddb3\uddbc\uddbd])|(?:\ud83c[\udfcb\udfcc]|\ud83d[\udd74\udd75]|\u26f9)((?:\ud83c[\udffb-\udfff]|\ufe0f)\u200d[\u2640\u2642]\ufe0f)|(?:\ud83c[\udfc3\udfc4\udfca]|\ud83d[\udc6e\udc71\udc73\udc77\udc81\udc82\udc86\udc87\ude45-\ude47\ude4b\ude4d\ude4e\udea3\udeb4-\udeb6]|\ud83e[\udd26\udd35\udd37-\udd39\udd3d\udd3e\uddb8\uddb9\uddcd-\uddcf\uddd6-\udddd])(?:\ud83c[\udffb-\udfff])?\u200d[\u2640\u2642]\ufe0f|(?:\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d[\udc68\udc69]|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc68|\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d[\udc68\udc69]|\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83c\udff3\ufe0f\u200d\ud83c\udf08|\ud83c\udff4\u200d\u2620\ufe0f|\ud83d\udc15\u200d\ud83e\uddba|\ud83d\udc41\u200d\ud83d\udde8|\ud83d\udc68\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83d\udc6f\u200d\u2640\ufe0f|\ud83d\udc6f\u200d\u2642\ufe0f|\ud83e\udd3c\u200d\u2640\ufe0f|\ud83e\udd3c\u200d\u2642\ufe0f|\ud83e\uddde\u200d\u2640\ufe0f|\ud83e\uddde\u200d\u2642\ufe0f|\ud83e\udddf\u200d\u2640\ufe0f|\ud83e\udddf\u200d\u2642\ufe0f)|[#*0-9]\ufe0f?\u20e3|(?:[©®\u2122\u265f]\ufe0f)|(?:\ud83c[\udc04\udd70\udd71\udd7e\udd7f\ude02\ude1a\ude2f\ude37\udf21\udf24-\udf2c\udf36\udf7d\udf96\udf97\udf99-\udf9b\udf9e\udf9f\udfcd\udfce\udfd4-\udfdf\udff3\udff5\udff7]|\ud83d[\udc3f\udc41\udcfd\udd49\udd4a\udd6f\udd70\udd73\udd76-\udd79\udd87\udd8a-\udd8d\udda5\udda8\uddb1\uddb2\uddbc\uddc2-\uddc4\uddd1-\uddd3\udddc-\uddde\udde1\udde3\udde8\uddef\uddf3\uddfa\udecb\udecd-\udecf\udee0-\udee5\udee9\udef0\udef3]|[\u203c\u2049\u2139\u2194-\u2199\u21a9\u21aa\u231a\u231b\u2328\u23cf\u23ed-\u23ef\u23f1\u23f2\u23f8-\u23fa\u24c2\u25aa\u25ab\u25b6\u25c0\u25fb-\u25fe\u2600-\u2604\u260e\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262a\u262e\u262f\u2638-\u263a\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267b\u267f\u2692-\u2697\u2699\u269b\u269c\u26a0\u26a1\u26aa\u26ab\u26b0\u26b1\u26bd\u26be\u26c4\u26c5\u26c8\u26cf\u26d1\u26d3\u26d4\u26e9\u26ea\u26f0-\u26f5\u26f8\u26fa\u26fd\u2702\u2708\u2709\u270f\u2712\u2714\u2716\u271d\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u2764\u27a1\u2934\u2935\u2b05-\u2b07\u2b1b\u2b1c\u2b50\u2b55\u3030\u303d\u3297\u3299])(?:\ufe0f|(?!\ufe0e))|(?:(?:\ud83c[\udfcb\udfcc]|\ud83d[\udd74\udd75\udd90]|[\u261d\u26f7\u26f9\u270c\u270d])(?:\ufe0f|(?!\ufe0e))|(?:\ud83c[\udf85\udfc2-\udfc4\udfc7\udfca]|\ud83d[\udc42\udc43\udc46-\udc50\udc66-\udc69\udc6e\udc70-\udc78\udc7c\udc81-\udc83\udc85-\udc87\udcaa\udd7a\udd95\udd96\ude45-\ude47\ude4b-\ude4f\udea3\udeb4-\udeb6\udec0\udecc]|\ud83e[\udd0f\udd18-\udd1c\udd1e\udd1f\udd26\udd30-\udd39\udd3d\udd3e\uddb5\uddb6\uddb8\uddb9\uddbb\uddcd-\uddcf\uddd1-\udddd]|[\u270a\u270b]))(?:\ud83c[\udffb-\udfff])?|(?:\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f|\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc73\udb40\udc63\udb40\udc74\udb40\udc7f|\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc77\udb40\udc6c\udb40\udc73\udb40\udc7f|\ud83c\udde6\ud83c[\udde8-\uddec\uddee\uddf1\uddf2\uddf4\uddf6-\uddfa\uddfc\uddfd\uddff]|\ud83c\udde7\ud83c[\udde6\udde7\udde9-\uddef\uddf1-\uddf4\uddf6-\uddf9\uddfb\uddfc\uddfe\uddff]|\ud83c\udde8\ud83c[\udde6\udde8\udde9\uddeb-\uddee\uddf0-\uddf5\uddf7\uddfa-\uddff]|\ud83c\udde9\ud83c[\uddea\uddec\uddef\uddf0\uddf2\uddf4\uddff]|\ud83c\uddea\ud83c[\udde6\udde8\uddea\uddec\udded\uddf7-\uddfa]|\ud83c\uddeb\ud83c[\uddee-\uddf0\uddf2\uddf4\uddf7]|\ud83c\uddec\ud83c[\udde6\udde7\udde9-\uddee\uddf1-\uddf3\uddf5-\uddfa\uddfc\uddfe]|\ud83c\udded\ud83c[\uddf0\uddf2\uddf3\uddf7\uddf9\uddfa]|\ud83c\uddee\ud83c[\udde8-\uddea\uddf1-\uddf4\uddf6-\uddf9]|\ud83c\uddef\ud83c[\uddea\uddf2\uddf4\uddf5]|\ud83c\uddf0\ud83c[\uddea\uddec-\uddee\uddf2\uddf3\uddf5\uddf7\uddfc\uddfe\uddff]|\ud83c\uddf1\ud83c[\udde6-\udde8\uddee\uddf0\uddf7-\uddfb\uddfe]|\ud83c\uddf2\ud83c[\udde6\udde8-\udded\uddf0-\uddff]|\ud83c\uddf3\ud83c[\udde6\udde8\uddea-\uddec\uddee\uddf1\uddf4\uddf5\uddf7\uddfa\uddff]|\ud83c\uddf4\ud83c\uddf2|\ud83c\uddf5\ud83c[\udde6\uddea-\udded\uddf0-\uddf3\uddf7-\uddf9\uddfc\uddfe]|\ud83c\uddf6\ud83c\udde6|\ud83c\uddf7\ud83c[\uddea\uddf4\uddf8\uddfa\uddfc]|\ud83c\uddf8\ud83c[\udde6-\uddea\uddec-\uddf4\uddf7-\uddf9\uddfb\uddfd-\uddff]|\ud83c\uddf9\ud83c[\udde6\udde8\udde9\uddeb-\udded\uddef-\uddf4\uddf7\uddf9\uddfb\uddfc\uddff]|\ud83c\uddfa\ud83c[\udde6\uddec\uddf2\uddf3\uddf8\uddfe\uddff]|\ud83c\uddfb\ud83c[\udde6\udde8\uddea\uddec\uddee\uddf3\uddfa]|\ud83c\uddfc\ud83c[\uddeb\uddf8]|\ud83c\uddfd\ud83c\uddf0|\ud83c\uddfe\ud83c[\uddea\uddf9]|\ud83c\uddff\ud83c[\udde6\uddf2\uddfc]|\ud83c[\udccf\udd8e\udd91-\udd9a\udde6-\uddff\ude01\ude32-\ude36\ude38-\ude3a\ude50\ude51\udf00-\udf20\udf2d-\udf35\udf37-\udf7c\udf7e-\udf84\udf86-\udf93\udfa0-\udfc1\udfc5\udfc6\udfc8\udfc9\udfcf-\udfd3\udfe0-\udff0\udff4\udff8-\udfff]|\ud83d[\udc00-\udc3e\udc40\udc44\udc45\udc51-\udc65\udc6a-\udc6d\udc6f\udc79-\udc7b\udc7d-\udc80\udc84\udc88-\udca9\udcab-\udcfc\udcff-\udd3d\udd4b-\udd4e\udd50-\udd67\udda4\uddfb-\ude44\ude48-\ude4a\ude80-\udea2\udea4-\udeb3\udeb7-\udebf\udec1-\udec5\uded0-\uded2\uded5\udeeb\udeec\udef4-\udefa\udfe0-\udfeb]|\ud83e[\udd0d\udd0e\udd10-\udd17\udd1d\udd20-\udd25\udd27-\udd2f\udd3a\udd3c\udd3f-\udd45\udd47-\udd71\udd73-\udd76\udd7a-\udda2\udda5-\uddaa\uddae-\uddb4\uddb7\uddba\uddbc-\uddca\uddd0\uddde-\uddff\ude70-\ude73\ude78-\ude7a\ude80-\ude82\ude90-\ude95]|[\u23e9-\u23ec\u23f0\u23f3\u267e\u26ce\u2705\u2728\u274c\u274e\u2753-\u2755\u2795-\u2797\u27b0\u27bf\ue50a])|\ufe0f)/g;
      const matches = [...stringInput.matchAll(emojiMatches)];
      if (!matches.length) return [];
      const matchedEmojis = matches.map((x) => {
         const [unicode, animated, name, id] = x.slice(1);
         const str = id && name ? `<${animated || ''}:${name}:${id}>` : unicode;
         const codepoints = this.client.utils.general
            .toCodePoint(unicode.indexOf(String.fromCharCode(0x200d)) < 0 ? unicode.replace(/\uFE0F/g, '') : unicode)
            .toLowerCase();
         return {
            str,
            parsed: parseEmoji(str)!,
            custom: !!id,
            url: id
               ? `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}`
               : `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${codepoints}.png`,
         };
      });
      // @ts-ignore
      return filterDupes ? matchedEmojis.reduce((a, c) => (!a.find((item) => item.str === c.str) ? a.concat([c]) : a), []) : matchedEmojis;
   }

   edit(msgOrInteraction, messageToEdit, ...options) {
      if (msgOrInteraction?.token) {
         return msgOrInteraction.editReply(...options);
      }
      return messageToEdit.edit(...options);
   }

   delete(msgOrInteraction) {
      if (msgOrInteraction?.token) {
         return msgOrInteraction.deleteReply();
      }
      return msgOrInteraction.delete();
   }

   createProgressBar(current, total, emptyEmoji = '⬜', fillEmoji = '⬛', length = 8) {
      if (current === undefined || current === null || isNaN(current) || current < 0) {
         throw new TypeError('No valid current value specified');
      }

      if (total === undefined || total === null || isNaN(total) || total <= 0) {
         throw new TypeError('No valid total value specified');
      }

      if (!emptyEmoji) emptyEmoji = '⬜';
      if (!fillEmoji) fillEmoji = '⬛';

      const completedBars = Math.round((current / total) * length);
      const pendingBars = length - completedBars;

      return `${fillEmoji.repeat(completedBars)}${emptyEmoji.repeat(pendingBars)}`;
   }

   truncate(texto, n = 2045) {
      if (texto.length > n) {
         return `${texto.substring(0, n)}...`;
      }
      return texto;
   }

   disableComponents(msg) {
      const components = msg.components ||= msg;
      if (!components) return;
      for (let i = 0; i < components.length; i++) {
         for (let j = 0; j < components[i].components.length; j++) {
            components[i].components[j]['data']['disabled'] = true;
         }
      }
      return components;
   }

   // Definimos la funcion de paginación
   async pagination(interaction, language = process.env.LANGUAGE, texto, titulo = 'Paginación', elementosPorPagina = 5) {
      if (titulo == 'Paginación') titulo = this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.embed.title');
      /* DIVIDIMOS EL TEXTO PARA CREAR LAS PAGINAS Y EMPUJARLO EN LOS EMBEDS */

      const embeds: Embed[] = [];
      const dividido = elementosPorPagina;
      for (let i = 0; i < texto.length; i += dividido) {
         const desc = texto.slice(i, elementosPorPagina);
         elementosPorPagina += dividido;
         // Creamos un embed por cada pagina de los datos divididos
         const embed = new Embed()
            .setTitle(titulo.toString())
            .setDescription(desc.join(' '))
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }));
         embeds.push(embed);
      }

      let paginaActual = 0;
      // Si la cantidad de embeds es solo 1, envíamos el mensaje tal cual sin botones
      if (embeds.length === 1) return interaction.reply({ embeds: [embeds[0]], ephemeral: true }).catch(() => {});
      // Si el numero de embeds es mayor 1, hacemos el resto || definimos los botones.
      const botonAtras = new ButtonBuilder()
         .setStyle(ButtonStyle.Secondary)
         .setCustomId('Atrás')
         .setEmoji(this.client.allemojis.flechaizq)
         .setLabel(this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.buttons.back'));
      const botonInicio = new ButtonBuilder()
         .setStyle(ButtonStyle.Primary)
         .setCustomId('Inicio')
         .setEmoji('🏠')
         .setLabel(this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.buttons.home'));
      const botonAvanzar = new ButtonBuilder()
         .setStyle(ButtonStyle.Secondary)
         .setCustomId('Avanzar')
         .setEmoji(this.client.allemojis.flechader)
         .setLabel(this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.buttons.forward'));
      const botonIrPagina = new ButtonBuilder()
         .setStyle(ButtonStyle.Secondary)
         .setCustomId('Página')
         .setEmoji('🔢')
         .setLabel(this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.buttons.page'));
      // Enviamos el mensaje embed con los botones
      const embedpaginas = await interaction.reply({
         // content: this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.content'),
         embeds: [
            embeds[0].setFooter({
               text: this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.embed.footer', {
                  page: paginaActual + 1,
                  pages: embeds.length,
               }),
            }),
         ],
         components: [new ActionRowBuilder().addComponents([botonAtras, botonInicio, botonAvanzar, botonIrPagina])],
         fetchReply: true,
         ephemeral: true,
      });
      // Creamos un collector y filtramos que la persona que haga click al botón, sea la misma que ha puesto el comando, y que el autor del mensaje de las páginas, sea el cliente
      const collector = embedpaginas.createMessageComponentCollector({
         filter: (i) => i?.isButton() && i?.user && i?.user.id == interaction.user.id && i?.message.author.id == this.client.user?.id,
         time: 180e3,
      });

      // Escuchamos los eventos del collector
      collector.on('collect', async (b) => {
         // Si el usuario que hace clic a el botón no es el mismo que ha escrito el comando, le respondemos que solo la persona que ha escrito >>queue puede cambiar de páginas
         if (b?.user.id !== interaction.user.id)
            return b?.reply({
               content: this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.collector.wrongUser'),
            });

         switch (b?.customId) {
            case 'Atrás':
               {
                  // Resetemamos el tiempo del collector
                  collector.resetTimer();
                  // Si la pagina a retroceder no es igual a la primera pagina entonces retrocedemos
                  if (paginaActual !== 0) {
                     // Resetemamos el valor de pagina actual -1
                     paginaActual -= 1;
                     // Editamos el embeds
                     await b
                        ?.update({
                           embeds: [
                              embeds[paginaActual].setFooter({
                                 text: this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.embed.footer', {
                                    page: paginaActual + 1,
                                    pages: embeds.length,
                                 }),
                              }),
                           ],
                           components: [embedpaginas.components[0]],
                        })
                        .catch(() => {});
                  } else {
                     // Reseteamos al cantidad de embeds - 1
                     paginaActual = embeds.length - 1;
                     // Editamos el embeds
                     await b
                        ?.update({
                           embeds: [
                              embeds[paginaActual].setFooter({
                                 text: this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.embed.footer', {
                                    page: paginaActual + 1,
                                    pages: embeds.length,
                                 }),
                              }),
                           ],
                           components: [embedpaginas.components[0]],
                        })
                        .catch(() => {});
                  }
               }
               break;

            case 'Inicio':
               {
                  // Resetemamos el tiempo del collector
                  collector.resetTimer();
                  // Si la pagina a retroceder no es igual a la primera pagina entonces retrocedemos
                  paginaActual = 0;
                  await b
                     ?.update({
                        embeds: [
                           embeds[paginaActual].setFooter({
                              text: this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.embed.footer', {
                                 page: paginaActual + 1,
                                 pages: embeds.length,
                              }),
                           }),
                        ],
                        components: [embedpaginas.components[0]],
                     })
                     .catch(() => {});
               }
               break;

            case 'Avanzar':
               {
                  // Resetemamos el tiempo del collector
                  collector.resetTimer();
                  // Si la pagina a avanzar no es la ultima, entonces avanzamos una página
                  if (paginaActual < embeds.length - 1) {
                     // Aumentamos el valor de pagina actual +1
                     paginaActual++;
                     // Editamos el embeds
                     await b
                        ?.update({
                           embeds: [
                              embeds[paginaActual].setFooter({
                                 text: this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.embed.footer', {
                                    page: paginaActual + 1,
                                    pages: embeds.length,
                                 }),
                              }),
                           ],
                           components: [embedpaginas.components[0]],
                        })
                        .catch(() => {});
                     // En caso de que sea la ultima, volvemos a la primera
                  } else {
                     // Reseteamos al cantidad de embeds - 1
                     paginaActual = 0;
                     // Editamos el embeds
                     await b
                        ?.update({
                           embeds: [
                              embeds[paginaActual].setFooter({
                                 text: this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.embed.footer', {
                                    page: paginaActual + 1,
                                    pages: embeds.length,
                                 }),
                              }),
                           ],
                           components: [embedpaginas.components[0]],
                        })
                        .catch(() => {});
                  }
               }
               break;

            case 'Página':
               {
                  const MODAL = new ModalBuilder()
                     .setCustomId('paginaModal')
                     .setTitle(this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.modal.title'));

                  const MODAL_PAGE_OPTION = new TextInputBuilder()
                     .setCustomId('numeroPagina')
                     .setLabel(this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.modal.options.modalPage.label'))
                     .setRequired(true)
                     .setPlaceholder(`1 - ${embeds.length}`)
                     .setStyle(TextInputStyle.Short);

                  const MODAL_ROW = new ActionRowBuilder().addComponents(MODAL_PAGE_OPTION);
                  // @ts-ignore
                  MODAL.addComponents(MODAL_ROW);

                  await b?.showModal(MODAL);
                  await b
                     ?.awaitModalSubmit({
                        time: 180e3,
                        filter: (i) => i.user.id === interaction.user.id,
                     })
                     .then(async (modal) => {
                        const page = modal.fields.getTextInputValue('numeroPagina');
                        if (isNaN(page))
                           return modal?.reply({
                              embeds: [
                                 new ErrorEmbed().setDescription(
                                    this.client.translate(
                                       language,
                                       'UTILS.MESSAGE.PAGINATION.message.modal.options.modalPage.execute.invalidNumber',
                                    ),
                                 ),
                              ],
                              ephemeral: true,
                           });
                        paginaActual = Number(page - 1);
                        if (page > embeds.length - 1) paginaActual = embeds.length - 1;
                        if (page < 1) paginaActual = 0;
                        // Editamos el embed
                        await modal
                           ?.update({
                              embeds: [
                                 embeds[paginaActual].setFooter({
                                    text: this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.embed.footer', {
                                       page: paginaActual + 1,
                                       pages: embeds.length,
                                    }),
                                 }),
                              ],
                              components: [embedpaginas.components[0]],
                           })
                           .catch(() => {});
                     })
                     .catch((e) => {
                        console.error(e);
                     });
               }
               break;

            default:
               break;
         }
      });
      collector.on('end', async () => {
         // Desactivamos los botones y editamos el mensaje
         await this.edit(interaction, embedpaginas, {
            content: this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.collector.expire'),
            embeds: [
               embeds[paginaActual].setFooter({
                  text: this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.embed.footer', {
                     page: paginaActual + 1,
                     pages: embeds.length,
                  }),
               }),
            ],
            components: this.disableComponents(embedpaginas),
         }).catch(() => {});
      });
   }

   // Definimos la funcion de paginación
   async paginateEmbeds(
      interaction,
      language = process.env.LANGUAGE,
      embeds,
      options: PaginationOptions = { startFrom: 0, extraEmbeds: [], messageToEdit: undefined, content: '' },
   ) {
      const defaultOptions = { startFrom: 0, extraEmbeds: [], messageToEdit: undefined, content: undefined };
      const { startFrom, extraEmbeds, messageToEdit, content } = { ...defaultOptions, ...options };
      let paginaActual = startFrom;
      // Si la cantidad de embeds es solo 1, envíamos el mensaje tal cual sin botones
      if (embeds.length === 1) {
         const messageOptions = { embeds: [...extraEmbeds, embeds[startFrom]], ephemeral: true, content }
         return messageToEdit
            ? this.client.utils.message.edit(interaction, messageToEdit, messageOptions)
            : interaction.reply(messageOptions).catch(() => {});
      }

      // Si el numero de embeds es mayor 1, hacemos el resto || definimos los botones.
      const botonAtras = new ButtonBuilder()
         .setStyle(ButtonStyle.Secondary)
         .setCustomId('Atrás')
         .setEmoji(this.client.allemojis.flechaizq)
         .setLabel(this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.buttons.back'));
      const botonInicio = new ButtonBuilder()
         .setStyle(ButtonStyle.Primary)
         .setCustomId('Inicio')
         .setEmoji('🏠')
         .setLabel(this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.buttons.home'));
      const botonAvanzar = new ButtonBuilder()
         .setStyle(ButtonStyle.Secondary)
         .setCustomId('Avanzar')
         .setEmoji(this.client.allemojis.flechader)
         .setLabel(this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.buttons.forward'));
      const botonIrPagina = new ButtonBuilder()
         .setStyle(ButtonStyle.Secondary)
         .setCustomId('Página')
         .setEmoji('🔢')
         .setLabel(this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.buttons.page'));
      // Enviamos el mensaje embed con los botones
      const messageOptions = {
         // content: this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.content'),
         content,
         embeds: [
            ...extraEmbeds,
            embeds[startFrom].setFooter({
               text: this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.embed.footer', {
                  page: paginaActual + 1,
                  pages: embeds.length,
               }),
            }),
         ],
         components: [new ActionRowBuilder().addComponents([botonAtras, botonInicio, botonAvanzar, botonIrPagina])],
         fetchReply: true,
         ephemeral: true,
      };
      const embedpaginas = await (messageToEdit
         ? this.client.utils.message.edit(interaction, messageToEdit, messageOptions)
         : interaction.reply(messageOptions));
      // Creamos un collector y filtramos que la persona que haga click al botón, sea la misma que ha puesto el comando, y que el autor del mensaje de las páginas, sea el cliente
      const collector = embedpaginas.createMessageComponentCollector({
         filter: (i) => i?.isButton() && i?.user && i?.user.id == interaction.user.id && i?.message.author.id == this.client.user?.id,
         time: 180e3,
      });

      // Escuchamos los eventos del collector
      collector.on('collect', async (b) => {
         // Si el usuario que hace clic a el botón no es el mismo que ha escrito el comando, le respondemos que solo la persona que ha escrito >>queue puede cambiar de páginas
         if (b?.user.id !== interaction.user.id)
            return b?.reply({
               content: this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.collector.wrongUser'),
            });

         switch (b?.customId) {
            case 'Atrás':
               {
                  // Resetemamos el tiempo del collector
                  collector.resetTimer();
                  // Si la pagina a retroceder no es igual a la primera pagina entonces retrocedemos
                  if (paginaActual !== 0) {
                     // Resetemamos el valor de pagina actual -1
                     paginaActual -= 1;
                     // Editamos el embeds
                     await b
                        ?.update({
                           embeds: [
                              ...extraEmbeds,
                              embeds[paginaActual].setFooter({
                                 text: this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.embed.footer', {
                                    page: paginaActual + 1,
                                    pages: embeds.length,
                                 }),
                              }),
                           ],
                           components: [embedpaginas.components[0]],
                        })
                        .catch(() => {});
                  } else {
                     // Reseteamos al cantidad de embeds - 1
                     paginaActual = embeds.length - 1;
                     // Editamos el embeds
                     await b
                        ?.update({
                           embeds: [
                              ...extraEmbeds,
                              embeds[paginaActual].setFooter({
                                 text: this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.embed.footer', {
                                    page: paginaActual + 1,
                                    pages: embeds.length,
                                 }),
                              }),
                           ],
                           components: [embedpaginas.components[0]],
                        })
                        .catch(() => {});
                  }
               }
               break;

            case 'Inicio':
               {
                  // Resetemamos el tiempo del collector
                  collector.resetTimer();
                  // Si la pagina a retroceder no es igual a la primera pagina entonces retrocedemos
                  paginaActual = 0;
                  await b
                     ?.update({
                        embeds: [
                           ...extraEmbeds,
                           embeds[paginaActual].setFooter({
                              text: this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.embed.footer', {
                                 page: paginaActual + 1,
                                 pages: embeds.length,
                              }),
                           }),
                        ],
                        components: [embedpaginas.components[0]],
                     })
                     .catch(() => {});
               }
               break;

            case 'Avanzar':
               {
                  // Resetemamos el tiempo del collector
                  collector.resetTimer();
                  // Si la pagina a avanzar no es la ultima, entonces avanzamos una página
                  if (paginaActual < embeds.length - 1) {
                     // Aumentamos el valor de pagina actual +1
                     paginaActual++;
                     // Editamos el embeds
                     await b
                        ?.update({
                           embeds: [
                              ...extraEmbeds,
                              embeds[paginaActual].setFooter({
                                 text: this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.embed.footer', {
                                    page: paginaActual + 1,
                                    pages: embeds.length,
                                 }),
                              }),
                           ],
                           components: [embedpaginas.components[0]],
                        })
                        .catch(() => {});
                     // En caso de que sea la ultima, volvemos a la primera
                  } else {
                     // Reseteamos al cantidad de embeds - 1
                     paginaActual = 0;
                     // Editamos el embeds
                     await b
                        ?.update({
                           embeds: [
                              ...extraEmbeds,
                              embeds[paginaActual].setFooter({
                                 text: this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.embed.footer', {
                                    page: paginaActual + 1,
                                    pages: embeds.length,
                                 }),
                              }),
                           ],
                           components: [embedpaginas.components[0]],
                        })
                        .catch(() => {});
                  }
               }
               break;

            case 'Página':
               {
                  const MODAL = new ModalBuilder()
                     .setCustomId('paginaModal')
                     .setTitle(this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.modal.title'));

                  const MODAL_PAGE_OPTION = new TextInputBuilder()
                     .setCustomId('numeroPagina')
                     .setLabel(this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.modal.options.modalPage.label'))
                     .setRequired(true)
                     .setPlaceholder(`1 - ${embeds.length}`)
                     .setStyle(TextInputStyle.Short);

                  const MODAL_ROW = new ActionRowBuilder().addComponents(MODAL_PAGE_OPTION);
                  // @ts-ignore
                  MODAL.addComponents(MODAL_ROW);
                  await b?.showModal(MODAL);
                  await b
                     ?.awaitModalSubmit({
                        time: 180e3,
                        filter: (i) => i.user.id === interaction.user.id,
                     })
                     .then(async (modal) => {
                        const page = modal.fields.getTextInputValue('numeroPagina');
                        if (isNaN(page))
                           return modal?.reply({
                              embeds: [
                                 ...extraEmbeds,
                                 new ErrorEmbed().setDescription(
                                    this.client.translate(
                                       language,
                                       'UTILS.MESSAGE.PAGINATION.message.modal.options.modalPage.execute.invalidNumber',
                                    ),
                                 ),
                              ],
                              ephemeral: true,
                           });
                        paginaActual = Number(page - 1);
                        if (page > embeds.length - 1) paginaActual = embeds.length - 1;
                        if (page < 1) paginaActual = 0;
                        // Editamos el embed
                        await modal
                           ?.update({
                              embeds: [
                                 ...extraEmbeds,
                                 embeds[paginaActual].setFooter({
                                    text: this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.embed.footer', {
                                       page: paginaActual + 1,
                                       pages: embeds.length,
                                    }),
                                 }),
                              ],
                              components: [embedpaginas.components[0]],
                           })
                           .catch(() => {});
                     })
                     .catch((e) => {
                        console.error(e);
                     });
               }
               break;

            default:
               break;
         }
      });
      collector.on('end', async () => {
         // Desactivamos los botones y editamos el mensaje
         await this.edit(interaction, embedpaginas, {
            content: this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.collector.expire'),
            embeds: [
               ...extraEmbeds,
               embeds[paginaActual].setFooter({
                  text: this.client.translate(language, 'UTILS.MESSAGE.PAGINATION.message.embed.footer', {
                     page: paginaActual + 1,
                     pages: embeds.length,
                  }),
               }),
            ],
            components: this.disableComponents(embedpaginas),
         }).catch(() => {});
      });
   }
}
