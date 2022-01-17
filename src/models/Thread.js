const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Thread = new Schema({
  threadTs: {
    type: String,
    required: true,
  },
  pullRequest: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
});

module.exports = Thread;
