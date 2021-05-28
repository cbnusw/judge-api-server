const http = require('http');
const { debug, error } = require('./utils/logger');
const { JUDGE_APP_PORT: PORT, IS_DEV } = require('./env');
const { initConsumer } = require('./kafka');
const socketIo = require('./socket.io');
const app = require('./app');


// const producer = await initKafka();

const server = http.createServer(app);
server.listen(+PORT);
server.on('error', error);
server.on('listening', () => {
  const addr = server.address();
  debug(`Server running on ${addr.address}${addr.port}`);
});

socketIo(server, app);
initConsumer(app.get('io'));



//카프카 consumer 코드
// kafkaConsumer();
