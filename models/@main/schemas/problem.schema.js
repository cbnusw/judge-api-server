const { Schema } = require('mongoose');
const { createSchema } = require('../../helpers');
const { searchPlugin } = require('../../plugins');
const { toRegEx, toRef } = require('../../mappers');

const ioSchema = createSchema({
  inFile: String,   // input file url
  outFile: String,  // output file url
});

const optionsSchema = createSchema({
  maxRealTime: {
    type: Number,
    default: null
  },
  maxMemory: {
    type: Number,
    default: null
  },
}, false);

const schema = createSchema({
  title: {
    type: String,
    trim: true,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
  },
  contest: {
    type: Schema.Types.ObjectId,
    ref: 'Contest',
    index: true,
    default: null,
  },
  published: {
    type: Date,
    index: true,
    default: null,
  },
  ioSet: [ioSchema],
  options: optionsSchema,
  writer: {
    type: Schema.Types.ObjectId,
    ref: 'UserInfo',
    index: true,
  }
});

schema.plugin(searchPlugin({
  sort: '-createdAt',
  mapper: {
    title: toRegEx,
    contest: toRef('Contest', {
      title: toRegEx
    }),
    writer: toRef('UserInfo', {
      name: toRegEx
    })
  }
}));


module.exports = schema;
