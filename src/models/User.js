const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
  slackId: {
    type: String,
    required: true,
  },
  githubId: {
    type: String,
    required: true,
  },
  mention: [
    {
      type: String,
      required: true,
    },
  ],
});

module.exports = User;
