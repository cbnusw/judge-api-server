const { Schema, Mongoose } = require('mongoose');
const { createSchema } = require('../../helpers');
const { searchPlugin } = require('../../plugins');
const { toRegEx, toRef } = require('../../mappers');

const schema = createSchema({
  problem: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: 'Problem'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'UserInfo',
    required: true,
    index: true,
  },
  score: {
    type: Number,
    required: true,
    default: -1
  },
  error: {
    type: Number,
  },
  realTime: {
    type: Number
  },
  memory: {
    type: Number
  },
  try: { type: Number, default: 0 },
  started: { type: Date },
  solvedTime: { type: Date },
  source: {
    type: Schema.Types.ObjectId,
    ref: 'File',
    required: true
  },
  lang: {
    type: String,
    enum: ['C/C++', 'Python', 'JAVA']
  }
});

schema.index({ createdAt: -1 });

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
