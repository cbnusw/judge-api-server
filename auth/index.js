const http = require('http');
const app = require('./app');
const { debug, error } = require('./utils/logger');
const { AUTH_APP_PORT: PORT } = require('../shared/env');
const initialize = require('./init');

const server = http.createServer(app);

server.listen(+PORT);
server.on('error', error);
server.on('listening', () => {
  const addr = server.address();
  debug(`Server running on ${addr.address}${addr.port}`);
  console.log(1);
});

initialize().then(() => debug(`initialization complete!`));
