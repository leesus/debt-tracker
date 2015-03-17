'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  first_name: String,
  last_name: String,

  email: [{ type: String, required: true }],
  password: String,

  facebook: {
    id: String,
    token: String
  },

  created_date: { type: Date, 'default': Date.now },
  activated: { type: Boolean, 'default': false },

  paid: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
  owes: [{ type: Schema.Types.ObjectId, ref: 'Debt' }],

  repaid: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
  owed: [{ type: Schema.Types.ObjectId, ref: 'Debt' }]
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
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

UserSchema.virtual('display_name').get(function(){
  return this.first_name + ' ' + this.last_name;
});

UserSchema.virtual('display_name').set(function(name){
  this.first_name = name.split(' ')[0];
  this.last_name = name.split(' ')[1];
});

UserSchema.index({ name: 'text', email: 'text' });

module.exports = mongoose.model('User', UserSchema);