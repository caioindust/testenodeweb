var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  id: Number,  
  username: String,
  password: String,
  active: Boolean
});
// Create a model based on the schema
//var User = mongoose.model('Users', UserSchema);
module.exports = mongoose.model('Users', UserSchema);