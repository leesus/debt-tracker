var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  firstName: String,
  lastName: String,
  displayName: String,

  email: [String],
  password: String,

  facebook: {
    id: String,
    token: String
  },

  created: { type: Date, 'default': Date.now },
  activated: { type: Boolean, 'default': false },

  paid: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
  owes: [{ type: Schema.Types.ObjectId, ref: 'Debt' }],

  repaid: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
  owed: [{ type: Schema.Types.ObjectId, ref: 'Debt' }]
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