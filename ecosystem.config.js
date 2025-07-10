const path = require('path');
module.exports = {
   apps: [
      {
         name: path.dirname(__filename).split(path.sep).pop(), // Dir name
         script: 'npx tsc; node dist/index.js',
         // eslint-disable-next-line camelcase
         // cron_restart: '0 0 * * *', // At 00:00
         env: {
            NODE_OPTIONS: '--no-warnings=ExperimentalWarning',
         },
      },
   ],
};
