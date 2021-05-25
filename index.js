const http = require('http');
const { debug, error } = require('./utils/logger');
const { JUDGE_APP_PORT: PORT, IS_DEV } = require('./env');
// const { kafkaConsumer } = require('./kafka/consumer');
const initKafka = require('./kafka');
const socketIo = require('./socket.io');
const initApp = require('./app');
const axios = require('axios');


async function start() {
  // const producer = await initKafka();
  const producer = await initKafka();
  const app = initApp({ producer });
  const server = http.createServer(app);
  server.listen(+PORT);
  server.on('error', error);
  server.on('listening', () => {
    const addr = server.address();
    debug(`Server running on ${addr.address}${addr.port}`);
  });

  // for (let i = 0; i < 10; i++) {
  //   axios.post(`http://localhost:4003/v1/problem/${i}/submit`);
  // }

  socketIo(server, app);
}

start().then(() => console.log('start server'));


//카프카 consumer 코드
// kafkaConsumer();
