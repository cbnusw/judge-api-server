const { Contest, UserInfo, Problem } = require('../../../../models');
const { createResponse } = require('../../../../utils/response');
const { hasRole } = require('../../../../utils/permission');
const { updateFiles, removeFilesByUrls } = require('../../../../utils/file');
const {
  CONTEST_NOT_FOUND,
  FORBIDDEN,
  INVALID_PROBLEM_PUBLISH,
  PROBLEM_NOT_FOUND
} = require('../../../../errors');
const asyncHandler = require('express-async-handler');
const { producingSubmit } = require('./service');


const getProblems = asyncHandler(async (req, res, next) => {
  const { query } = req;

  const now = new Date();

  const documents = await Problem.search(query, {
    $and: [{ published: { $ne: null } }, { published: { $lte: now } }]
  }, [{ path: 'contest', model: Contest }]);
  res.json(createResponse(res, documents));
});

const getProblem = asyncHandler(async (req, res, next) => {
  const { params: { id }, user } = req;

  const query = Problem.findById(id)
    .populate({ path: 'contest', model: Contest })
    .populate({ path: 'writer', model: UserInfo });

  if (!doc) return next(PROBLEM_NOT_FOUND);
  res.json(createResponse(res, doc));
});

const createSubmit = asyncHandler(async (req, res, next) => {

  const { params: { id } } = req;

  const { producer } = req.app.get('properties');

  // submit DB에 저장(생성)


  await producingSubmit(producer, id);
  res.json(createResponse(res));

  //권한 없을 시 예외처리 추가해야합니다.
  // const { params: { id }, user, body } = req;
  // body.user = user;
  // body.problem = id;
  // try {
  //   const findedScore = await ScoreBoard.find().where('problem').equals(id).where('user').equals(user)
  //   const problem = await Problem.findById(id);
  //   const contest = await Contest.findById(problem.contest)
  //   if (!findedScore) ScoreBoard.create({ contest: contest._id, user: user })
  //   const createdSubmit = Submit.create(body);
  //   const jedgerReq = { io: problem.ioSets, option: problem.options, user: user, language: body.language }
  //
  //   //const judgerResult = await // kafka결과 받는 부분
  //   //const result = {type: judgerResult.status.result, memory: judgerResult.status.memory, time: judgerResult.status.cpu_time}
  //   //await Submit.update(
  //   // { 'user': user, 'problem': id },
  //   // { '$set':
  //   //    {'res': result}
  //   //  })
  //   const beforeScore = ScoreBoard.find({ 'contest': problem.contest }).find({ 'user': user }).find({ 'scores.problem': id })
  //   if (beforeScore) {
  //     beforeScore.tries += 1;
  //     beforeScore.time = createdSubmit._createdAt - contest.testPeriod.start
  //     //if(judgerResult.status.result == 0)beforeScore.isCorrect = true;
  //     ScoreBoard.update({ 'contest': problem.contest, 'user': user, 'score.problem': id }, {
  //       '$set': {
  //         'score.$.tries': beforeScore.tries,
  //         'score.$.time': beforeScore.time,
  //         //'score.$.isCorrect' : beforeScore.isCorrct
  //       }
  //     })
  //   } else {
  //     ScoreBoard.update(
  //       { 'contest': problem.contest, 'user': user },
  //       { '$push': { 'problem': id } },
  //       done
  //     )
  //   }
  // } catch (e) {
  //   next(e);
  // }
})

const createProblem = asyncHandler(async (req, res, next) => {
  const { body, user } = req;

  body.writer = user.info;

  const err = validateContest(body);
  if (err) return next(err);

  const doc = await Problem.create(body);
  let urls = [body.content, ...body.ioSet.map(io => io.inFile), ...body.ioSet.map(io => io.outFile)];
  await updateFiles(req, doc._id, 'Problem', urls);
  res.json(createResponse(res, doc));
});

const updateProblem = asyncHandler(async (req, res, next) => {
  const { params: { id }, body: $set, user } = req;
  const doc = await Problem.findById(id);

  if (!doc) return next(PROBLEM_NOT_FOUND);
  if (String(doc.writer) !== String(user.info)) return next(FORBIDDEN);

  const err = validateContest($set);
  if (err) return next(err);

  const urls = [$set.content, ...$set.ioSet.map(io => io.inFile), ...$set.ioSet.map(io => io.outFile)];
  await Promise.all([doc.updateOne({ $set }), updateFiles(req, doc._id, 'Problem', urls)]);
  res.json(createResponse(res));
});

const removeProblem = asyncHandler(async (req, res, next) => {
  const { params: { id }, user } = req;
  const doc = await Problem.findById(id);
  if (!doc) return next(PROBLEM_NOT_FOUND);

  if (!hasRole(user) && String(user.info) !== String(doc.writer)) return next(FORBIDDEN);

  const urls = [doc.content, ...doc.ioSet.map(io => io.inFile), ...doc.ioSet.map(io => io.outFile)];
  await Promise.all([doc.deleteOne(), removeFilesByUrls(req, urls)]);
  res.json(createResponse(res));
});


// utility functions
async function validateContest(problem) {
  if (problem.contest) {
    const contest = await Contest.findById(problem.contest);
    if (!contest) return CONTEST_NOT_FOUND;
    if (problem.published) {
      const published = new Date(problem.published);
      const { testPeriod } = contest;
      const end = new Date(testPeriod.end);
      if (published.getTime() < end.getTime()) return INVALID_PROBLEM_PUBLISH;
    }
    if (String(problem.writer) !== String(contest.writer)) return FORBIDDEN;
  }
  return null;
}

exports.getProblems = getProblems;
exports.getProblem = getProblem;
exports.createProblem = createProblem;
exports.updateProblem = updateProblem;
exports.removeProblem = removeProblem;
exports.createSubmit = createSubmit;
