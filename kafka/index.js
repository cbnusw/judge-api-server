const { KafkaClient, Producer, Consumer } = require('kafka-node');
const { debug ,error } = require('../utils/logger');

const initConsumer = (client, no) => {
  const topics = [{ topic: 'submit', partition: 0 }];
  const options = { autoCommit: false, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024, fromOffset: true };
  const consumer = new Consumer(client, topics, options);

  consumer.on('message', (message) => {
    // 여기는 계속 listening상태로 있고 message가 바뀌면 찍힙니다
    console.log(`${no} value:::`, message.value);
    consumer.commit(true,(err, data) => {
      if (err) console.error(`${no} commit error::: `, err);
      else console.log(`${no} commit:::`, data);
    });
  });
  consumer.on('error', error => {
    console.error(error);
  });
};

const createProducer = client => {
  const producer = new Producer(client);
  producer.on('ready', () => debug('ready producer'));
  producer.on('error', err => error('producer error'));
  return producer;
};

module.exports = () => {
  const client = new KafkaClient({kafkaHost: 'localhost:9092'});
  // initConsumer(client);
  // return createProducer(client);

  const topics = [
    {
      topic: 'submit',
      partitions: 1,
      replicationFactor: 1
    },
    {
      topic: 'result',
      partitions: 1,
      replicationFactor: 1
    }
  ];

  return new Promise((resolve, reject) => {
    client.createTopics(topics, (err, result) => {
      if (err) return reject(err);
      const producer = createProducer(client);
      initConsumer(client, 1);
      resolve(producer);
    });
  });
}
