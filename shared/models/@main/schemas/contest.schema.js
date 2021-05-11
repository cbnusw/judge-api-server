const { Schema, Mongoose } = require('mongoose');
const { createSchema } = require('../../helpers');
const { searchPlugin } = require('../../plugins');
const { toRegEx, toRef } = require('../../mappers');

const schema = createSchema({
  title: {
    type: String,
    trim: true,
    required: true,
    index: true,
  },
  pictures: [{
    type: Schema.Types.ObjectId,
    ref: 'File'
  }],
  writer: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  content: String,
  problems: [Schema.Types.ObjectId],
  registerPeriod: {
    from: Date,
    to: Date
  },
  progressPeriod: {
    from : Date,
    to: Date
  },
  attendedStudents: [Schema.Types.ObjectId]
});

schema.index({ createdAt: -1 });

schema.plugin(searchPlugin({
  sort: '-createdAt',
  mapper: {
    title: toRegEx,
    writer: toRef('UserInfo', {
      name: toRegEx
    }),
  }
}));

module.exports = schema;
