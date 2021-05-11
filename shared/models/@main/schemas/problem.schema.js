const { Schema, Mongoose } = require('mongoose');
const { createSchema } = require('../../helpers');
const { searchPlugin } = require('../../plugins');
const { toRegEx, toRef } = require('../../mappers');
const toRegex = require('../../mappers/to-regex');

const contentSchema = createSchema({
  contentPDF: [{type:Schema.Types.ObjectId, ref: 'File'}],
  ioSample: [{in:{type:Schema.Types.ObjectId, ref: 'File'}, out:{type:Schema.Types.ObjectId, ref: 'File'}}]
},false)

const schema = createSchema({
  title: {
    type: String,
    trim: true,
    required: true,
    index: true
  },
  content: contentSchema,
  contest: {
    type: Schema.Types.ObjectId
  },
  io: [{in:Schema.Types.ObjectId, out:Schema.Types.ObjectId}],//File URL
  writer: Schema.Types.ObjectId
})


schema.plugin(searchPlugin({
  sort: 'no',
  mapper: {
    title: toRegEx,
    contest: toRef('Contest', {
      title: toRegEx
    }),
    writer: toRef('UserInfo', {
      name: toRegex
    })
  }
}));


module.exports = schema;