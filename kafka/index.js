const { KafkaClient, Producer, Consumer } = require('kafka-node');
const { debug, error } = require('../utils/logger');
const { KAFKA_RESULT_TOPIC: topic } = require('../env');
const { Submit } = require('../models');

const client = new KafkaClient({ kafkaHost: 'localhost:9092' });


const initConsumer = io => {
  const topics = [{ topic, partition: 0 }];
  const options = { autoCommit: true, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024 };
  const consumer = new Consumer(client, topics, options);

  consumer.on('message', (message) => {
    debug(`comsumer message:::${message.value}`);

    const id = message.value;

    Submit.findById(id).then(
      result => io.emit('result', result)
    );

  });

  consumer.on('error', error => {
    console.error(error);
  });
};

const createProducer = () => {
  const producer = new Producer(client);
  producer.on('ready', () => debug('ready producer'));
  producer.on('error', err => error('producer error'));
  return producer;
};

module.exports = {
  createProducer,
  initConsumer,
};
