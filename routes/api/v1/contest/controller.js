const { Contest, UserInfo } = require('../../../../models');
const { createResponse } = require('../../../../utils/response');
const { hasRoles } = require('../../../../utils/permission');
const { removeFilesByUrls, updateFiles } = require('../../../../utils/file');
const asyncHandler = require('express-async-handler');
const {
  CONTEST_NOT_FOUND,
  CONTEST_USER_DUPLICATE
} = require('../../../../errors');


const { File, Problem } = require('../../../../models/@main');
const { ObjectId } = require('mongodb');
const getContests = asyncHandler(async (req, res, next) => {
  const { query } = req;
  const documents = await Contest.search(query, null, [{ path: 'writer', model: UserInfo }]);
  res.json(createResponse(res, documents));
});

const getContest = asyncHandler(async (req, res, next) => {
  const { params: { id }, user } = req;

  const doc = await Contest.findById(id)
    .populate({ path: 'pictures', model: File })
    .populate({ path: 'writer', model: UserInfo })
    .populate({ path: 'problems', model: Problem })
  if (!doc) return next(CONTEST_NOT_FOUND);
  res.json(createResponse(res, doc));
})

const createContest = asyncHandler(async (req, res, next) => {
  const { body, user } = req;
  body.writer = user.info;
  console.log(body)
  const urls = body.pictures.map(picture => picture.url);
  body.pictures = urls;
  const doc = await Contest.create(body);
  await updateFiles(req, doc._id, 'Contest', urls);
  res.json(createResponse(res, doc));
});

const updateContest = asyncHandler(async (req, res, next) => {
  const { params: { id }, body: $set } = req;
  const urls = $set.pictures.map(picture => picture.url);
  const doc = await Contest.findById(id);
  if (!doc) return next(CONTEST_NOT_FOUND);
  await Promise.all([doc.updateOne({ $set }), updateFiles(req, doc._id, 'Contest', urls)]);
  res.json(createResponse(res));
});

const removeContest = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const doc = await Contest.findById(id)
    .populate({ path: 'problems', model: Problem })
    .populate({ path: 'pictures', model: File })
  if (!doc) return next(CONTEST_NOT_FOUND);
  const Ids = doc.pictures.map(picture => picture.url);
  await Promise.all([doc.deleteOne(), removeFilesByUrls(req, Ids)]);
  res.json(createResponse(res));
});

const enrollContest = asyncHandler(async (req, res, next) => {
  const { userId, contestId } = req.body;
  const students = await Contest.findById(contestId).select('-_id attendedStudents');
  if (!students) return next(CONTEST_NOT_FOUND);
  for (let student in students.attendedStudents) {
    if (userId == ObjectId(`${students.attendedStudents[student]}`).toString())
      return next(CONTEST_USER_DUPLICATED);
  }
  await Contest.update(
    { _id: `${contestId}` },
    { $push: { attendedStudents: userId } }
  );
  return res.json(createResponse(res));
})

const unenrollContest = asyncHandler(async (req, res, next) => {
  const { userId, contestId } = req.body;
  const students = await Contest.findById(contestId).select('-_id attendedStudents');
  if (!students) return next(CONTEST_NOT_FOUND);
  await Contest.update(
    { _id: `${contestId}` },
    { $pull: { attendedStudents: userId } }
  );
  return res.json(createResponse(res));
})

exports.getContests = getContests;
exports.getContest = getContest;
exports.createContest = createContest;
exports.updateContest = updateContest;
exports.removeContest = removeContest;
exports.enrollContest = enrollContest;
exports.unenrollContest = unenrollContest;