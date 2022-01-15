const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');
const Thread = require('./Thread');

const Repository = new Schema({
  id: {
    type: String,
    required: true,
  },
  notificationChannel: {
    type: String,
    required: true,
  },
  channel: {
    type: String,
    required: true,
  },
  users: [User],
  threads: [Thread],
});

module.exports = mongoose.model('Repository', Repository);
