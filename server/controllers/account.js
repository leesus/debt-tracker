var passportConfig = require('../config/passport');
var User = require('../models/user');

module.exports.login = function(req, res, next) {
  console.log('login called');
  next();
};

module.exports.signup = function(req, res, next) {
  console.log('signup called');
  next();
};

module.exports.logout = function(req, res, next) {
  console.log('logout called');
  req.logout();
};