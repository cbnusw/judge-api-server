const { Schema } = require('mongoose');
const { createSchema } = require('../../helpers');
const { searchPlugin } = require('../../plugins');
const { toRegEx, toRef } = require('../../mappers');
const { PROGRAMMING_LANGUAGES } = require('../../../constants');

const resultSchema = createSchema({
  type: {
    type: String,
    enum: ['compile', 'runtime', 'timeout', 'memory', 'done'],
  },
  // done일 경우
  memory: {
    type: Number,
    default: null,
  },
  time: {
    type: Number,
    default: null,
  }
}, false);

const schema = createSchema({
  contest: {
    type: Schema.Types.ObjectId,
    ref: 'Contest',
    index: true,
    default: null,
  },
  problem: {
    type: Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
    index: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'UserInfo',
    required: true,
    index: true,
  },
  source: {
    // https://swjudgeapi.cbnu.ac.kr/uploads/~~~~.c
    type: String,
    required: true,
  },
  language: {
    type: String,
    enum: PROGRAMMING_LANGUAGES,
    required: true,
  },
  result: {
    type: resultSchema,
    default: null,
  }

}, {
  updatedAt: false,
});

schema.index({ createdAt: 1 });

schema.plugin(searchPlugin({
  sort: '-score',
  mapper: {
    title: toRegEx,
    user: toRef('UserInfo', {
      name: toRegEx
    }),
    problem: toRef('Problem', {
      title: toRegEx
    }),
  }
}));

module.exports = schema;
