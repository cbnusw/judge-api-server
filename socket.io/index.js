const socketIo = require('socket.io');
const { debug } = require('../utils/logger');
// const { readdirSync, statSync } = require('fs');
// const { join } = require('path');

module.exports = (httpServer, app) => {
  const io = socketIo(httpServer);
  app.set('io', io);

  io.on('connection', socket => {
    debug('a user connected');

    socket.on('disconnect', () => {
      debug('a user disconnected');
    });
  });

  // const onConnetion = (socket) => {
  //   readdirSync(__dirname)
  //     .filter(dir => statSync(join(__dirname, dir)).isDirectory())
  //     .forEach(dir => {
  //       const handler = require(`./${dir}`);
  //       handler(io, socket);
  //     });
  // };

  // io.on('connection', onConnetion);
};
