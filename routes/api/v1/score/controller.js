const { createResponse } = require('../../../../utils/response');
const { removeFilesByUrls, updateFiles } = require('../../../../utils/file');
const asyncHandler = require('express-async-handler');
const { File, Problem, UserInfo } = require('../../../../models/@main');
const { ObjectId } = require('mongodb');
const kafka = require('kafka-node');

const getScores = asyncHandler(async (req, res, next) => {
  const { query } = req;
  const documents = await Score.find()
    .where('user').equals(query.user)
    .where('problem').equals(query.problem)
    .sort('-solvedTime')
  res.json(createResponse(res, documents));
});

const createScore = asyncHandler(async (req, res, next) => {
  const { body, user } = req;
  const nowDate = Date();
  body.user = user.info;
  body.started = nowDate;
  const beforeValue = await Score.find()
    .where('user').equals(body.user)
    .sort('-try')
    .limit(1)
  if (beforeValue) {
    body.try = beforeValue.try + 1
    body.started = beforeValue.started
  }
  const problemInfo = await Problem.find()
    .where('_id').equals(body.problem)
    .select('option io')
  const judgeReq = {
    option: problemInfo.option,
    in: problemInfo.io.map(res => res.in),
    out: problemInfo.io.map(res => res.out),
    source: body.source,
    lang: body.lang
  }
  const judgeRes = {} //kafka로 judgeReq 제출 후 결과 수신하는 변수
  body.error = judgeRes.status.result
  body.realtime = judgeRes.status.real_time
  body.memory = judgeRes.status.memory
  const doc = await Score.create(body);
  res.json(createResponse(res, doc));
});

const kafkaTest = asyncHandler( async(req,res,next)=>{
  let HighLevelProducer = kafka.HighLevelProducer;
  let Producer = kafka.Producer;
  let client = new kafka.KafkaClient();
  let producer = new HighLevelProducer(client);

  const messageInfo  = {
    option : "hihi",
    in: "/problems/in.txt",
    out: "/problems/out.txt"
  }

  const payloads = [{
    topic : 'topic1',
    messages: messageInfo
  }]

  producer.on('ready', ()=>{
    producer.send(payloads, (err, data)=>{
      console.log(data);
    })
  })

  producer.on('error', error =>{
    console.error(error);
  })

  return res.send('ok');
});



exports.kafkaTest = kafkaTest;
exports.getScores = getScores;
exports.createScore = createScore;
exports.kafkaTest = kafkaTest;
