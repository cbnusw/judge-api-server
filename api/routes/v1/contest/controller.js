const { Contest, UserInfo } = require('../../../../shared/models');
const { createResponse } = require('../../../../shared/utils/response');
const { hasRoles } = require('../../../../shared/utils/permission');
const { removeFilesByUrls, updateFiles } = require('../../../../shared/utils/file');
const {
  CONTEST_NOT_FOUND,
  CONTEST_USER_DUPLICATED
} = require('../../../../shared/errors');
const { File, Problem } = require('../../../../shared/models/@main');
const { ObjectId } = require('mongodb');
const getContests = async (req, res, next) => {
  const { query } = req;
  try {
    const documents = await Contest.search(query, null, [{ path: 'writer', model: UserInfo }]);
    res.json(createResponse(res, documents));
  } catch (e) {
    next(e);
  }
};

const getContest = async (req, res, next) => {
  const { params: { id }, user } = req;

  try {
    const doc = await Contest.findById(id)
    .populate({ path: 'pictures', model: File })
    .populate({path: 'writer', model: UserInfo})
    .populate({path: 'problems', model: Problem})
    if (!doc) return next(CONTEST_NOT_FOUND);
    res.json(createResponse(res, doc));
  } catch (e) {
    next(e);
  }
};

const createContest = async (req, res, next) => {
  const { body, user } = req;
  body.writer = user.info;
  try {
    console.log(body)
    const urls = body.pictures.map(picture => picture.url);
    body.pictures = urls;
    const doc = await Contest.create(body);
    await updateFiles(req, doc._id, 'Contest', urls);
    res.json(createResponse(res, doc));
  } catch (e) {
    next(e);
  }
};

const updateContest = async (req, res, next) => {
  const { params: { id }, body: $set } = req;
  const urls = $set.pictures.map(picture => picture.url);

  try {
    const doc = await Contest.findById(id);
    if (!doc) return next(CONTEST_NOT_FOUND);
    await Promise.all([doc.updateOne({ $set }), updateFiles(req, doc._id, 'Contest', urls)]);
    res.json(createResponse(res));
  } catch (e) {
    next(e);
  }
};

const removeContest = async (req, res, next) => {
  const { id } = req.params;

  try {
    const doc = await Contest.findById(id)
    .populate({path: 'problems', model: Problem})
    .populate({path: 'pictures', model: File})
    if (!doc) return next(CONTEST_NOT_FOUND);
    const Ids = doc.pictures.map(picture => picture.url);
    await Promise.all([doc.deleteOne(), removeFilesByUrls(req, Ids)]);
    res.json(createResponse(res));
  } catch (e) {
    next(e);
  }
};

const enrollContest = async(req,res,next)=>{
  const {userId, contestId} = req.body;
  try{
    const students = await Contest.findById(contestId).select('-_id attendedStudents');
    if(!students) return next(CONTEST_NOT_FOUND);
    for(let student in students.attendedStudents){
       if(userId == ObjectId(`${students.attendedStudents[student]}`).toString())
        return next(CONTEST_USER_DUPLICATED);
    }
    await UserInfo.update(
        {user : userId},
        {$push: {enrolledContests:contestId}}
    );
    await Contest.update(
        {_id : `${contestId}`},
       {$push:{attendedStudents:userId}}
      );
    return res.json(createResponse(res));
  }catch(e){
    next(e);
  }
}

const unenrollContest = async (req, res, next) => {
  const { userId, contestId } = req.body;
  try {
    const students = await Contest.findById(contestId).select('-_id attendedStudents');
    if (!students) return next(CONTEST_NOT_FOUND);
    await Contest.update(
      { _id: `${contestId}` },
      { $pull: { attendedStudents: userId } }
    );
    await UserInfo.update(
      { user: userId },
      { $pull: { enrolledContests : contestId } }
    );
    return res.json(createResponse(res));
  } catch (e) {
    next(e);
  }
}

exports.getContests = getContests;
exports.getContest = getContest;
exports.createContest = createContest;
exports.updateContest = updateContest;
exports.removeContest = removeContest;
exports.enrollContest = enrollContest;
exports.unenrollContest = unenrollContest;