var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  firstName: String,
  lastName: String,
  displayName: String,

  local: {
    email: { type: String, lowercase: true },
    password: String
  },

  facebook: {
    id: String,
    token: String,
    email: { type: String, lowercase: true }
  },

  created: { type: Date, 'default': Date.now },

  payments: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],

  debts: [{ type: Schema.Types.ObjectId, ref: 'Debt' }]
});

UserSchema.pre('save', function(next) {
  var user = this;

  if (!user.isModified('local.password')) return next();
  
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.local.password, salt, function(err, hash) {
      if (err) return next(err);
      user.local.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function(password, fn) {
  bcrypt.compare(password, this.local.password, function(err, isMatch) {
    if (err) return fn(err);
    fn(null, isMatch);
  });
};

module.exports = mongoose.model('User', UserSchema);