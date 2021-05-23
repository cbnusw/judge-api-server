const { Schema } = require('mongoose');
const { createSchema } = require('../../helpers');
const { toRegEx, toRef } = require('../../mappers');
const { searchPlugin } = require('../../plugins');

const ioSchema = createSchema({
  inFile: String,   // input file url
  outFile: String,  // output file url
});

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
  contest: {
    type: Schema.Types.ObjectId,
    ref: 'Contest',
    default: null,
  },
  ioSet: [ioSchema],//File URL
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
