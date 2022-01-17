require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const url = MONGO_URI;

module.exports = url;
