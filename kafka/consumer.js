const kafka = require('kafka-node')

const kafkaConsumer = function() {
  let Consumer = kafka.Consumer;
  let Client = kafka.KafkaClient;
  let topic = 'topic1';
  
  let client = new Client({kafkaHost: 'localhost:9092'});
  let topics = [{topic: topic, partition: 0}];
  let options = { autoCommit: false, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024 };
    
  let consumer = new Consumer(client, topics, options);
  
  consumer.on('message', (message) =>{
    console.log(message);
  })
  
  consumer.on('error', error =>{
    console.error(error);
  })
}

exports.kafkaConsumer = kafkaConsumer;