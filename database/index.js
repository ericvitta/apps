const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/noderest', {useCreateIndex: true,useNewUrlParser: true } )
mongoose.Promise = global.Promise;

module.exports = mongoose;
