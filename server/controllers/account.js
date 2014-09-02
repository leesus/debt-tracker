var passport = require('passport');
var passportConfig = require('../config/passport');
var User = require('../models/user');

module.exports.login = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    return res.send({ success: false, message: 'Login failed', errors: errors });
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) return console.log(err) && next(err);
    if (!user) res.send({ success: false, message: 'Login failed' });
    req.logIn(user, function(err) {
      if (err) return console.log(err) && next(err);
      res.cookie('user', JSON.stringify(req.user));
      res.send({ success: true, message: 'Login successful', data: user });
    });
  })(req, res, next);
};

module.exports.signup = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 6 characters long').len(6);

  var errors = req.validationErrors();

  if (errors) {
    return res.send({ success: false, message: 'Signup failed', errors: errors });
  }

  var user = new User({
    email: req.body.email,
    password: req.body.password
  });

  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) return res.send({ success: false, message: 'An account with that email already exists.' });
    user.save(function(err) {
      if (err) return next(err);
      req.logIn(user, function(err) {
        if (err) return next(err);
        return res.send({ success: true, message: 'Signup successful', data: user });
      });
    });
  });
};

module.exports.logout = function(req, res, next) {
  req.logout();
  res.send({ success: true, message: 'Logout successful' });
};

