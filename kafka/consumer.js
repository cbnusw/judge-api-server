const kafka = require('kafka-node')

const kafkaConsumer = function() {
  let Consumer = kafka.Consumer;
  let Client = kafka.KafkaClient;
  let topic = 'submit';     //나중에 result로 바꿔야합니다
  
  let client = new Client({kafkaHost: 'localhost:9092'});
  let topics = [{topic: topic, partition: 0}];
  let options = { autoCommit: false, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024 };
    
  let consumer = new Consumer(client, topics, options);
  
  consumer.on('message', (message) =>{
    // 여기는 계속 listening상태로 있고 message가 바뀌면 찍힙니다
    console.log(message);
  })
  
  consumer.on('error', error =>{
    console.error(error);
  })
  
}

exports.kafkaConsumer = kafkaConsumer;