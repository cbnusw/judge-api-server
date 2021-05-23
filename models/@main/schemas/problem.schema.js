const { Schema } = require('mongoose');
const { createSchema } = require('../../helpers');
const { searchPlugin } = require('../../plugins');
const { toRegEx, toRef } = require('../../mappers');

const ioSchema = createSchema({
  inFile: String,   // input file url
  outFile: String,  // output file url
});


const optionsSchema = createSchema({
  maxRealTime: { type: Number, required: true },
  maxMemory: { type: Number, required: true }
}, false)

const schema = createSchema({
  title: {
    type: String,
    trim: true,
    required: true,
    index: true
  },
  open: {
    type: Boolean,
    default: false,
    index: true,
  },
  content: {
    type: String,
    required: true,
  },
  score: { type: Number, required: true },
  contest: {
    type: Schema.Types.ObjectId,
    ref: 'Contest',
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
  sort: 'no',
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
