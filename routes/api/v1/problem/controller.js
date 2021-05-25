const { Contest, UserInfo, Problem } = require('../../../../models');
const { createResponse } = require('../../../../utils/response');
const { hasRoles } = require('../../../../utils/permission');
const { updateFiles, removeFilesByIds } = require('../../../../utils/file');
const {
  CONTEST_NOT_FOUND,
} = require('../../../../errors');
const asyncHandler = require('express-async-handler');
const { File } = require('../../../../models/@main');


const getProblems = asyncHandler(async (req, res, next) => {
  const { query } = req;
  try {
    const documents = await Problem.search(query, null, [{ path: 'contest', model: Contest }]);
    res.json(createResponse(res, documents));
  } catch (e) {
    next(e);
  }
});

const getProblem = asyncHandler(async (req, res, next) => {
  const { params: { id }, user } = req;

  try {
    const doc = await Problem.findById(id)
      .populate({ path: 'contest', model: Contest })
      .populate({ path: 'content.contentPDF' })
      .populate({ path: 'writer', model: UserInfo })
    if (!doc) return next(PROBLEM_NOT_FOUND);
    res.json(createResponse(res, doc));
  } catch (e) {
    next(e);
  }
});

const createSubmit = asyncHandler(async (req, res, next) => {
  //권한 없을 시 예외처리 추가해야합니다.
  const { params: { id }, user, body } = req;
  body.user = user;
  body.problem = id;
  try {
    const findedScore = await ScoreBoard.find().where('problem').equals(id).where('user').equals(user)
    const problem = await Problem.findById(id);
    const contest = await Contest.findById(problem.contest)
    if (!findedScore) ScoreBoard.create({ contest: contest._id, user: user })
    const createdSubmit = Submit.create(body);
    const jedgerReq = { io: problem.ioSets, option: problem.options, user: user, language: body.language }
    
    //const judgerResult = await // kafka결과 받는 부분
    //const result = {type: judgerResult.status.result, memory: judgerResult.status.memory, time: judgerResult.status.cpu_time}
    //await Submit.update(
    // { 'user': user, 'problem': id }, 
    // { '$set': 
    //    {'res': result}
    //  })
    const beforeScore = ScoreBoard.find({ 'contest': problem.contest }).find({ 'user': user }).find({ 'scores.problem': id })
    if (beforeScore) {
      beforeScore.tries += 1;
      beforeScore.time = createdSubmit._createdAt - contest.testPeriod.start
      //if(judgerResult.status.result == 0)beforeScore.isCorrect = true;
      ScoreBoard.update({ 'contest': problem.contest, 'user': user, 'score.problem': id }, {
        '$set': {
          'score.$.tries': beforeScore.tries,
          'score.$.time': beforeScore.time,
          //'score.$.isCorrect' : beforeScore.isCorrct
        }
      })
    } else {
      ScoreBoard.update(
        { 'contest': problem.contest, 'user': user },
        { '$push': { 'problem': id } },
        done
      )
    }
  } catch (e) {
    next(e);
  }

})

const createProblem = asyncHandler(async (req, res, next) => {
  const { body, user } = req;
  body.writer = user.info;
  console.log(body)
  try {
    const ids = body.content.ioSample.map(inAndOut => inAndOut.in).concat(body.content.ioSample.map(inAndOut => inAndOut.out), body.io.map(inAndOut => inAndOut.in), body.io.map(inAndOut => inAndOut.out))
    const doc = await Problem.create(body);
    await updateFiles(req, doc._id, 'Contest', ids);
    res.json(createResponse(res, doc));
  } catch (e) {
    next(e);
  }
});

const updateProblem = asyncHandler(async (req, res, next) => {
  const { params: { id }, body: $set } = req;
  const urls = $set.content.ioSample.map(inAndOut => inAndOut.in).concat($set.content.ioSample.map(inAndOut => inAndOut.out), $set.io.map(inAndOut => inAndOut.in), $set.io.map(inAndOut => inAndOut.out))
  try {
    const doc = await Problem.findById(id);
    if (!doc) return next(PROBLEM_NOT_FOUND);
    await Promise.all([doc.updateOne({ $set }), updateFiles(req, doc._id, 'Problem', urls)]);
    res.json(createResponse(res));
  } catch (e) {
    next(e);
  }
});

const removeProblem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const doc = await Problem.findById(id);
    if (!doc) return next(PROBLEM_NOT_FOUND);
    const ids = doc.content.ioSample.map(inAndOut => inAndOut.in).concat(doc.content.ioSample.map(inAndOut => inAndOut.out), doc.io.map(inAndOut => inAndOut.in), doc.io.map(inAndOut => inAndOut.out))
    await Promise.all([doc.deleteOne(), removeFilesByIds(req, ids)]);
    res.json(createResponse(res));
  } catch (e) {
    next(e);
  }
});

exports.getProblems = getProblems;
exports.getProblem = getProblem;
exports.createProblem = createProblem;
exports.updateProblem = updateProblem;
exports.removeProblem = removeProblem;
exports.createSubmit = createSubmit;