const { Contest } = require('../../../../models');
const { createResponse } = require('../../../../utils/response');
const { hasRoles } = require('../../../../utils/permission');
const asyncHandler = require('express-async-handler');
const {
  AFTER_PROGRESS_PERIOD,
  AFTER_REGISTER_PERIOD,
  BEFORE_REGISTER_PERIOD,
  CONTEST_NOT_FOUND,
  CONTEST_ENROLLED,
  FORBIDDEN,
  PROGRESSED_CONTEST,
} = require('../../../../errors');


const getContests = asyncHandler(async (req, res, next) => {
  const { query } = req;
  const documents = await Contest.search(query);
  res.json(createResponse(res, documents));
});

const getMyContests = asyncHandler(async (req, res, next) => {
  const { query, user } = req;
  const documents = await Contest.search(query, { writer: user.info });
  res.json(createResponse(res, documents));
});

const getRegisteredContests = asyncHandler(async (req, res, next) => {
  const { query, user } = req;
  const documents = await Contest.search(query, { contestants: user.info });
  res.json(createResponse(res, documents));
});

const getApplyingContests = asyncHandler(async (req, res, next) => {
  const now = new Date();

  const documents = await Contest.search({}, {
    $or: [
      { $and: [{ applyingPeriod: null }, { testPeriod: null }] },
      { $and: [{ applyingPeriod: null }, { 'testPeriod.start': { $gt: now } }] },
      { $and: [{ 'applyingPeriod.start': { $lte: now } }, { 'applyingPeriod.end': { $gte: now } }] }
    ]
  });

  res.json(createResponse(res, documents));
});

const getContest = asyncHandler(async (req, res, next) => {
  const { params: { id } } = req;

  const doc = await Contest.findById(id)
    .populate({ path: 'writer' })
    .populate({ path: 'contestants' });

  if (!doc) return next(CONTEST_NOT_FOUND);

  res.json(createResponse(res, doc));
})

const enrollContest = asyncHandler(async (req, res, next) => {
  const { params: { id }, user } = req;
  const contest = await Contest.findById(id);

  if (!contest) return next(CONTEST_NOT_FOUND);

  const { applyingPeriod, testPeriod } = contest;

  if (applyingPeriod) {
    const now = new Date();
    let { start, end } = applyingPeriod;
    start = new Date(start);
    end = new Date(end);

    if (now.getTime() < start.getTime()) return next(BEFORE_REGISTER_PERIOD);
    if (now.getTime > end.getTime()) return next(AFTER_REGISTER_PERIOD);
  }

  if (testPeriod) {
    const now = new Date();
    let { end } = testPeriod;
    end = new Date(end);
    if (now.getTime() > end.getTime()) return next(AFTER_PROGRESS_PERIOD);
  }

  if (contest.contestants.map(id => String(id)).includes(String(user.info))) return next(CONTEST_ENROLLED);
  contest.contestants.unshift(user.info);
  await contest.save();

  return res.json(createResponse(res));
})

const unenrollContest = asyncHandler(async (req, res, next) => {
  const { params: { id }, user } = req;
  const contest = await Contest.findById(id);

  if (!contest) return next(CONTEST_NOT_FOUND);

  const { testPeriod } = contest;

  if (testPeriod) {
    const now = new Date();
    let { start } = testPeriod;
    start = new Date(start);

    if (now.getTime() > start.getTime()) return next(PROGRESSED_CONTEST);
  }

  const idx = contest.contestants.map(id => String(id)).indexOf(String(user.info));
  if (idx !== -1) {
    contest.contestants.splice(idx, 1);
    await contest.save();
  }
  return res.json(createResponse(res));
})

const createContest = asyncHandler(async (req, res, next) => {
  const { body, user } = req;

  body.writer = user.info;
  const doc = await Contest.create(body);

  res.json(createResponse(res, doc));
});

const updateContest = asyncHandler(async (req, res, next) => {
  const { params: { id }, body: $set, user } = req;

  const doc = await Contest.findById(id);

  if (!doc) return next(CONTEST_NOT_FOUND);
  if (String(doc.writer) !== String(user.info)) return next(FORBIDDEN);

  await doc.updateOne({ $set });

  res.json(createResponse(res));
});

const removeContest = asyncHandler(async (req, res, next) => {
  const { params: { id }, user } = req;
  const doc = await Contest.findById(id);

  if (!doc) return next(CONTEST_NOT_FOUND);
  if (String(doc.writer) !== String(user.info) && !hasRoles()) return next(FORBIDDEN);

  await doc.deleteOne();

  res.json(createResponse(res));
});

exports.getContests = getContests;
exports.getMyContests = getMyContests;
exports.getRegisteredContests = getRegisteredContests;
exports.getApplyingContests = getApplyingContests;
exports.getContest = getContest;
exports.createContest = createContest;
exports.updateContest = updateContest;
exports.removeContest = removeContest;
exports.enrollContest = enrollContest;
exports.unenrollContest = unenrollContest;
