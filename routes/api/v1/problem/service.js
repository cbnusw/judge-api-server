const { Producer, KafkaClient } = require('kafka-node');
const client = new KafkaClient();
const producer = new Producer(client);


exports.producingSubmit = (producer, submitId) => {

  const payloads = [{
    topic: 'submit',
    messages: submitId
  }];

  return new Promise((resolve, reject) => {
    producer.send(payloads, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};
