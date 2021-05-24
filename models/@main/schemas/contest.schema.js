const { Schema } = require('mongoose');
const { createSchema } = require('../../helpers');
const { searchPlugin } = require('../../plugins');
const { toRegEx, toRef } = require('../../mappers');

const periodSchema = createSchema({
  start: {
    type: Date,
    index: true,
    required: true,
  },
  end: {
    type: Date,
    index: true,
    required: true,
  },
}, false);

const problemSchema = createSchema({
  score: {
    type: Number,
    default: 1,
  },
  problem: {
    type: Schema.Types.ObjectId,
    ref: 'Problem',
  }
});

const schema = createSchema({
  title: {
    type: String,
    trim: true,
    required: true,
    index: true,
  },
  content: String,
  writer: {
    type: Schema.Types.ObjectId,
    ref: 'UserInfo',
    required: true,
    index: true,
  },
  problems: [problemSchema],
  applyingPeriod: {
    type: periodSchema,
    default: null,
  },
  testPeriod: {
    type: periodSchema,
    required: true,
  },
  contestants: [{
    type: Schema.Types.ObjectId,
    ref: 'UserInfo',
    required: true,
  }]
});

schema.index({ createdAt: -1 });

schema.plugin(searchPlugin({
  sort: '-createdAt',
  populate: [{ path: 'writer' }],
  mapper: {
    title: toRegEx,
    writer: toRef('UserInfo', {
      name: toRegEx
    }),
  }
}));

module.exports = schema;
