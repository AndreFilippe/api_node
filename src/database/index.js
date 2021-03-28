const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/apiexpress');
mongoose.Promise = global.Promise;

module.exports = mongoose;