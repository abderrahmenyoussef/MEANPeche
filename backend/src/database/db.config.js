const config = require('../config/config');
const mongoose = require('mongoose');
const db={};
mongoose.Promise = global.Promise;
mongoose.set('strictQuery', false);
db.mongoose = mongoose;
db.url = config.DB_URL;

// Import models
db.article = require('../api/models/article.model')(mongoose);

module.exports = db;