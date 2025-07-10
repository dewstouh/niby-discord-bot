import { CommandInteraction, MessageComponentInteraction, ModalSubmitInteraction } from 'discord.js';

// Función para asegurarse de que las respuestas sean siempre efímeras
function ensureEphemeral(args) {
   if (!args[0]?.hasOwnProperty('ephemeral')) {
      args[0] = { ...args[0], ephemeral: true };
   }
   return args;
}

// Array de las clases de interacciones a modificar
const interactions = [CommandInteraction, MessageComponentInteraction, ModalSubmitInteraction];

// Iterar a través de las interacciones y modificar el método reply
interactions.forEach((interactionClass) => {
   const originalReply = interactionClass.prototype.reply;
   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
   // @ts-ignore
   interactionClass.prototype.reply = function (...args) {
      return originalReply.apply(this, ensureEphemeral(args));
   };
});
