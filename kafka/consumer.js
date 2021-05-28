const { Consumer, KafkaClient } = require('kafka-node')

const kafkaConsumer = function () {
  const topic = 'submit';     //나중에 result로 바꿔야합니다
  const client = new KafkaClient({ kafkaHost: 'localhost:9092' });
  const topics = [{ topic: topic, partition: 0 }];
  const options = { fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024, autoCommit : true };
  const consumer = new Consumer(client, topics, options);

  consumer.on('message', (message) => {
    // 여기는 계속 listening상태로 있고 message가 바뀌면 찍힙니다
    console.log(message);
  });

  consumer.on('error', error => {
    console.error(error);
  });
}

exports.kafkaConsumer = kafkaConsumer;
