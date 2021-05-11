const { Contest, UserInfo,Problem } = require('../../../../shared/models');
const { createResponse } = require('../../../../shared/utils/response');
const { hasRoles } = require('../../../../shared/utils/permission');
const { updateFiles, removeFilesByIds } = require('../../../../shared/utils/file');
const {
  CONTEST_NOT_FOUND,
} = require('../../../../shared/errors');
const { File } = require('../../../../shared/models/@main');
const getProblems = async (req, res, next) => {
  const { query } = req;
  try {
    const documents = await Problem.search(query, null, [{ path: 'contest', model: Contest }]);
    res.json(createResponse(res, documents));
  } catch (e) {
    next(e);
  }
};

const getProblem = async (req, res, next) => {
  const { params: { id }, user } = req;

  try {
    const doc = await Problem.findById(id)
    .populate({ path: 'contest', model: Contest })
    .populate({ path: 'content.contentPDF'})
    .populate({path:'writer', model: UserInfo})
    if (!doc) return next(PROBLEM_NOT_FOUND);
    res.json(createResponse(res, doc));
  } catch (e) {
    next(e);
  }
};

const createProblem = async (req, res, next) => {
  const { body, user } = req;
  body.writer = user.info;
  console.log(body)
  try {
    const ids = body.content.ioSample.map(inAndOut => inAndOut.in).concat(body.content.ioSample.map(inAndOut => inAndOut.out), body.io.map(inAndOut => inAndOut.in),body.io.map(inAndOut => inAndOut.out))
    const doc = await Problem.create(body);
    await updateFiles(req, doc._id, 'Contest', ids);
    res.json(createResponse(res, doc));
  } catch (e) {
    next(e);
  }
};

const updateProblem = async (req, res, next) => {
  const { params: { id }, body: $set } = req;
  const urls = $set.content.ioSample.map(inAndOut => inAndOut.in).concat($set.content.ioSample.map(inAndOut => inAndOut.out), $set.io.map(inAndOut => inAndOut.in),$set.io.map(inAndOut => inAndOut.out))
  try {
    const doc = await Problem.findById(id);
    if (!doc) return next(PROBLEM_NOT_FOUND);
    await Promise.all([doc.updateOne({ $set }), updateFiles(req, doc._id, 'Problem', urls)]);
    res.json(createResponse(res));
  } catch (e) {
    next(e);
  }
};

const removeProblem = async (req, res, next) => {
  const { id } = req.params;

  try {
    const doc = await Problem.findById(id);
    if (!doc) return next(PROBLEM_NOT_FOUND);
    const ids = doc.content.ioSample.map(inAndOut => inAndOut.in).concat(doc.content.ioSample.map(inAndOut => inAndOut.out), doc.io.map(inAndOut => inAndOut.in),doc.io.map(inAndOut => inAndOut.out))
    await Promise.all([doc.deleteOne(), removeFilesByIds(req, ids)]);
    res.json(createResponse(res));
  } catch (e) {
    next(e);
  }
};

exports.getProblems = getProblems;
exports.getProblem = getProblem;
exports.createProblem = createProblem;
exports.updateProblem = updateProblem;
exports.removeProblem = removeProblem;
