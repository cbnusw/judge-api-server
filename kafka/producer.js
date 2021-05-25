
const producingKafka = (io, option, user, language)=>{

    let kafka = require('kafka-node'),
        Producer = kafka.Producer,
        client = new kafka.KafkaClient(),
        producer = new Producer(client);
    
    //보내야하는 메세지 정의
    const messages = {
        io,
        option,
        user,
        language
    }

    //메세지와 topic이름으로 카프카에 쌓아야할 데이터 정의
    const payloads = [{
        topic : 'submit',
        messages,
        partition : 0
    }]; 

    return new Promise((resolve, reject)=>{
        producer.on('ready', ()=>{
            producer.send(payloads, (err, data)=>{
                if(err){
                    reject(err);
                } 
                console.log(data);
                resolve(data);
            })
        })
        producer.on('error', error =>{
            reject(error);
        })
    })
};

exports.producingKafka = producingKafka;
