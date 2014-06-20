var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true },
  password: String,

  facebook: String,
  name: String,
  tokens: Array,

  resetPasswordToken: String,
  resetPasswordExpires: Date
});

UserSchema.pre('save', function(next) {
  var user = this;

  if (!user.isModified('password')) return next();
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function(password, fn) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return fn(err);
    fn(null, isMatch);
  });
};

module.exports = mongoose.model('User', UserSchema);