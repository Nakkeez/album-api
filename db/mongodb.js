const mongoose = require('mongoose');

mongoose.set('debug', true);
mongoose.set('strictQuery', false);

const connectMongoDB = (url) => {
  return mongoose.connect(url, {});
};

module.exports = connectMongoDB;