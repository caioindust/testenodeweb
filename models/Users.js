var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new mongoose.Schema({
  id: Number,  
  username: String,
  password: String,
  active: Boolean
});

// generating a hash
UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};
// Create a model based on the schema
//var User = mongoose.model('Users', UserSchema);
module.exports = mongoose.model('Users', UserSchema);