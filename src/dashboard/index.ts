import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import RedisStore from 'connect-redis';
import createMemoryStore from 'memorystore';
const MemoryStore = createMemoryStore(session);
const app = express();
const server = http.createServer(app);
const io = new Server(server);
import flash from 'connect-flash';
import rateLimit from 'express-rate-limit';
import Client from '../structures/Client';
import extractRoute from './utils/extractRoute';
import loadFiles from '../utils/loadFiles';
import texts, { premiumPlans } from './config';
import socketHandler from './handlers/socketHandler';
export default async (client: Client) => {
   console.info('Cargando dashboard...'.yellow);

   loadSuscriptions(client);

   app.set('trust proxy', 1); // Si pasa por cloudflare, pillamos las IPs de la peña de verdad :)
   app.set('view engine', 'ejs'); // Esto establece EJS como el motor de plantillas por defecto

   const limiter = rateLimit({
      windowMs: (parseInt(process.env.RATE_LIMIT_COOLDOWN) || 5) * 60 * 1000, // CONFIG minutos
      max: parseInt(process.env.MAX_REQUESTS_PER_COOLDOWN) || 1000, // máximo de CONFIG solicitudes por ventana cada CONFIG minutos,
      message: 'Too many requests | 429',
      handler: (request, response, next, options) => response.status(options.statusCode).json(options.message),
   });

   passport.serializeUser((user, done) => done(null, user));
   passport.deserializeUser((obj, done) => done(null, obj));
   // Configurar Passport.js
   passport.use(
      new DiscordStrategy(
         {
            clientID: client?.user?.id,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL:
               process.env.WEB_DOMAIN == 'localhost'
                  ? `http://${process.env.WEB_DOMAIN}:${process.env.PORT}/auth/discord/callback`
                  : `https://${process.env.WEB_DOMAIN}/auth/discord/callback`,
            scope: ['identify', 'guilds', 'guilds.join', 'email'],
         },
         (accessToken, refreshToken, profile, done) => {
            process.nextTick(() => {
               return done(null, profile);
            });
         },
      ),
   );

   const sessionMiddleware = session({
      store: process.env.CACHE_DB == 'true' ? new RedisStore({ client: client.redisClient }) : new MemoryStore({ checkPeriod: 86400000 }),
      secret: '#@%#&^$^$%@$^$&%#$%@|#@|€|@#|#||¬€~#€#€¬@#~@~@~#@~@~@~|#@|#|@#@||@#¬€~#||@####LLLLLLNIGEGR#536c53cc6%5%tv%4y4hrgrggrgrgf4n',
      resave: false,
      saveUninitialized: false,
   });

   // Configuración de Express.js
   app.use(sessionMiddleware);
   io.engine.use(sessionMiddleware);

   // Inicializar Passport.js
   app.use(passport.initialize());
   app.use(passport.session());

   app.use(flash());
   // Global Variables
   app.use((req, res, next) => {
      // @ts-ignore
      req.active = req.path.split('/')[1];
      res.locals.success = req.flash('success');
      res.locals.error = req.flash('error');
      res.locals.bot = client;
      res.locals.config = texts;
      res.locals.user = req.user || null;
      next();
   });
   app.use(cookieParser());
   app.use(bodyParser.json({ limit: '50mb' }));
   app.use(
      bodyParser.urlencoded({
         extended: true,
         limit: '50mb',
      }),
   );
   app.use(express.json());
   app.use(
      express.urlencoded({
         extended: true,
      }),
   );

   app.use(express.static(`${process.cwd()}/src/dashboard/public`));
   // app.use(express.static(path.join(__dirname, '/'), { dotfiles: 'allow' })); //static

   // PRIVATE API, NO ATTACKS + LIMITER
   app.use('/api', limiter, tokenChecker, (err, req, res, next) => {
      if (err) {
         console.log(err);
         return res.status(500).json({ message: '500 Interval Server Error' });
      }
      next();
   });

   // GLOBAL MIDDLEWARE HANDLER
   app.use((err, req, res, next) => {
      // SERVER ERRORS
      if (err) {
         console.error(err);
         return res.redirect('/');
      }

      // API RATE LIMITS
      if (req.rateLimit.limitExceeded) {
         const response = {
            message: 'Límite de solicitudes alcanzado. Por favor, intenta de nuevo más tarde.',
            // Otros datos que quieras enviar en la respuesta
         };
         return res.status(429).json(response);
      }

      next();
   });

   await loadRoutes();

   // CARGA DE RUTAS
   socketHandler(io, client);

   server.listen(process.env.PORT, () => {
      console.success(`Servidor web iniciado en http://localhost:${process.env.PORT} || ${process.env.WEB_DOMAIN}`, { sendWebhook: true });
   });
};

async function loadRoutes() {
   console.log(`(+) Cargando routes`.yellow);
   const RUTA_ARCHIVOS = await loadFiles('/src/dashboard/routes');
   if (RUTA_ARCHIVOS.length) {
      for (const rutaArchivo of RUTA_ARCHIVOS) {
         try {
            const BASE_PATH = __dirname.toString().slice(1) + '/dist/dashboard/routes';
            const PATH = '/' + rutaArchivo.split('\\')[0].split('/').slice(1).join('/').split('.')[0].replace(BASE_PATH, '');
            if (PATH.endsWith('routes/index')) {
               app.use('/', (await import(rutaArchivo)).default);
            } else if (PATH.endsWith('index') && !PATH.endsWith('routes/index')) {
               const DIRNAME = extractRoute(PATH);
               app.use(DIRNAME, (await import(rutaArchivo)).default);
            } else {
               app.use(extractRoute(PATH), (await import(rutaArchivo)).default);
            }
         } catch (e) {
            console.log(`ERROR AL CARGAR EL ROUTE ${rutaArchivo}`.bgRed);
            console.error(e);
         }
      }
      // and then finally add the auto redirect on errors
      app.get('*', (req, res) => {
         res.redirect('/');
      });
   }

   console.log(`(+) ${RUTA_ARCHIVOS.length} Routes Cargados`.green);
}

function loadSuscriptions(client: Client) {
   console.info(`[WEB] Cargando ${premiumPlans.length} planes premium...`);
   premiumPlans.forEach(async (plan) => {
      const productData = {
         name: plan.name,
         type: 'SERVICE',
         description: plan.description,
         category: 'ONLINE_SERVICES',
      };

      const product = await client.paypal.createProduct(productData);

      const planData = {
         product_id: product.id,
         name: plan.name,
         description: plan.description,
         type: 'FIXED',
         billing_cycles: [
            {
               frequency: {
                  interval_unit: plan.frequency,
                  interval_count: plan.frequency_interval,
               },
               tenure_type: 'REGULAR',
               sequence: 1,
               total_cycles: plan.cycles,
               pricing_scheme: {
                  fixed_price: {
                     value: plan.price,
                     currency_code: 'EUR',
                  },
               },
            },
         ],
         payment_preferences: {
            setup_fee: {
               currency_code: 'EUR',
               value: '0',
            },
            return_url: `https://${process.env.WEB_DOMAIN}/premium/purchase?success=true`,
            cancel_url: `https://${process.env.WEB_DOMAIN}/premium/purchase?success=false`,
            payment_failure_threshold: '3',
            auto_bill_outstanding: true,
            setup_fee_failure_action: 'CONTINUE',
         },
         status: 'ACTIVE',
         taxes: {
            percentage: '0',
            inclusive: false,
         },
      };

      return client.paypal.createBillingPlan(planData);
   });
   console.success(`[WEB] Cargados ${premiumPlans.length} planes premium!`);
}

// Middleware para comprobar el origen de las solicitudes entrantes
function tokenChecker(req, res, next) {
   // if (req.method !== 'POST') return next(); //PROTEGER GET Y POST
   const allowedOrigins = [process.env.WEB_DOMAIN, `${process.env.WEB_DOMAIN}:${process.env.PORT}`, '127.0.0.1', '::1', '::ffff:127.0.0.1'];
   // Comprobar si la solicitud proviene del servidor web
   if (allowedOrigins.includes(req.headers.origin)) {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      next();
   } else if (req.headers?.authorization) {
      // Comprobar si la solicitud contiene un token
      const TOKEN = req.headers.authorization;
      if (TOKEN == process.env.GLOBAL_TOKEN) {
         next();
      } else {
         res.status(403).json({ message: 'Forbidden | INVALID TOKEN' });
      }
   } else {
      res.status(403).json({ message: 'Forbidden' });
   }
}
