import './config/env';
import './structures/Logger';
console.info('Iniciando proceso...', { sendWebhook: true });
import ClusterManager from './structures/ClusterManager';
new ClusterManager(`${__dirname}/bot.js`);
