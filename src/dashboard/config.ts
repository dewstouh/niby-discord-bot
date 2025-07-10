export default {
   features: [
      {
         title: "Alta velocidad de respuesta",
         description: "Gracias a nuestros servidores, {botName} tiene una gran estabilidad y velocidad de respuesta.",
         icon: {
            id: "ri-signal-wifi-fill",
            color: "#37ff00"
         }
      },
      {
         title: "24/7 en línea",
         description: "{botName} siempre estará encendidos las 24 horas del día, todos los días, sin interrupciones.",
         icon: {
            id: "ri-24-hours-fill",
            color: "#5578ff"
         }
      },
      {
         title: "Facilidad de Uso",
         description: "Usa {botName} a través de su web o utiliza el comando {prefix}help para saber como funciona.",
         icon: {
            id: "ri-checkbox-circle-fill",
            color: "#FFFFFF"
         }
      },
      {
         title: "Soporte de plataformas",
         description: "Escucha música de Spotify, Soundcloud y más de 1000 plataformas diferentes.",
         icon: {
            id: "bi bi-spotify",
            color: "#00ff37"
         }
      },
      {
         title: "Guarda canciones",
         description: "Crea playlists personalizadas con todas tus canciones favoritas.",
         icon: {
            id: "ri-folder-music-fill",
            color: "#4800AA"
         }
      },
      {
         title: "Filtro & Ecualización",
         description: "Configura el audio de la música con nuestro sistema avanzado de filtros y ecualización.",
         icon: {
            id: "ri-equalizer-fill",
            color: "#fc03b1"
         }
      },
      {
         title: "Alta calidad de audio",
         description: "Disfruta de un sonido excepcional gracias a nuestro avanzado sistema de codificación y decodificación de audio.",
         icon: {
            id: "ri-volume-up-fill",
            color: "#03fcdb"
         }
      },
      {
         title: "Control de permisos",
         description: "Controla quién o quienes pueden hacer qué en tu servidor gracias al control de permisos completamente personalizable.",
         icon: {
            id: "ri-lock-2-fill",
            color: "#FFC100"
         }
      }
   ],
   premiumFeatures: [
      {
         title: "Sin tiempo de espera entre interacciones",
         description: "No tendrás que esperar nada de tiempo para ejecutar comandos o interacciones.",
         icon: {
            id: "ri-rest-time-fill",
            color: "#37ff00"
         }
      },
      {
         title: "Reproductor 24/7 en línea",
         description: "{botName} siempre estará conectado las 24 horas del día, todos los días, sin interrupciones a tu canal de voz reproduciendo temas.",
         icon: {
            id: "ri-24-hours-fill",
            color: "#5578ff"
         }
      },
      {
         title: "Reproduce directos de Twitch",
         description: "Reproduce retransmisiones en vivo de tu streamer favorito en tiempo real.",
         icon: {
            id: "ri-twitch-fill",
            color: "#6f00ff"
         }
      },
      {
         title: "x2 Boost XP + Monedas de Economía",
         description: "Multiplica tus recompensas de economía y experiencia x2 para alcanzar con mayor facilidad el #1 en la lista.",
         icon: {
            id: "bi bi-2-circle-fill",
            color: "#FFFFFF"
         }
      },
      {
         title: "Acceso anticipado",
         description: "Recibe acceso al bot Niby Premium y prueba funciones antes de que salgan en Niby de manera oficial.",
         icon: {
            id: "ri-settings-6-fill",
            color: "#00ff37"
         }
      },
      {
         title: "Comandos personalizados",
         description: "Crea comandos en tu servidor con respuestas completamente personalizables.",
         icon: {
            id: "bi bi-slash-square-fill",
            color: "#4800AA"
         }
      },
      // {
      //    title: "Filtro & Ecualización",
      //    description: "Configura el audio de la música con nuestro sistema avanzado de filtros y ecualización.",
      //    icon: {
      //       id: "ri-equalizer-fill",
      //       color: "#fc03b1"
      //    }
      // },
      // {
      //    title: "Control de permisos",
      //    description: "Controla quién o quienes pueden hacer qué en tu servidor gracias al control de permisos completamente personalizable.",
      //    icon: {
      //       id: "ri-lock-2-fill",
      //       color: "#FFC100"
      //    }
      // }
   ],
   faq: [
      {
         question: "¿Cómo puedo utilizar {botName}?",
         answer: "Puedes usar {botName} a través de su sitio web o usando el comando {prefix}help en Discord para conocer sus comandos."
      },
      {
         question: "¿En qué plataformas de música puedo escuchar con {botName}?",
         answer: "{botName} soporta más de 1000 plataformas diferentes, incluyendo Youtube, Spotify, Soundcloud, y más."
      },
      {
         question: "¿Cómo puedo crear una playlist personalizada con {botName}?",
         answer: "Puedes crear una playlist personalizada usando el comando {prefix}playlist add <nombre de la lista> <enlace de la canción>."
      },
      {
         question: "¿Cómo puedo ajustar el audio de la música en {botName}?",
         answer: "Puedes ajustar el audio de la música en {botName} utilizando nuestro sistema avanzado de filtros y ecualización. Usa el comando {prefix}filter para obtener más información."
      },
      {
         question: "¿Cómo puedo obtener soporte para {botName}?",
         answer: "Puedes obtener soporte para {botName} a través de nuestro <a href=\"https://discord.gg/test\">Servidor de Soporte<\/a>. ¡Únete para obtener ayuda y actualizaciones!"
      }
   ]
};

export const premiumPlans = [
   {
      name: "Plan Premium de Usuario (3 Meses)",
      description: 'Suscripción Premium Niby de Usuario por 3 meses',
      price: '3.00',
      cycles: '3',
      frequency_interval: '1',
      frequency: 'MONTH',
   },
   {
      name: "Plan Premium de Servidor (3 Meses)",
      description: 'Suscripción Premium Niby de Servidor por 3 meses',
      price: '5.00',
      cycles: '3',
      frequency_interval: '1',
      frequency: 'MONTH',
   }
]
