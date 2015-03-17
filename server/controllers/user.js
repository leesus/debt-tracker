'use strict';

var passport = require('passport');
var passportConfig = require('../config/passport');
var User = require('../models/user');

/**
 * Add an unactivated user
 */
module.exports.addUser = function(req, res, next) {
  User.create({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    owes: [req.user._id]
  }, function(err, user) {
    if (err) {
      res.status(403);
      return next(err);
    }
    // send email to new user - 'user registered a debt to you' etc
    return res.send(201, { success: true, message: 'User created successfully.', data: user });
  });
};

/**
 * Update user
 */
module.exports.updateUser = function(req, res, next) {

};

/**
 * Remove user
 */
module.exports.removeUser = function(req, res, next) {

};

/**
 * Get all users
 */
module.exports.getUsers = function(req, res, next) {

};

/**
 * Find user
 */
module.exports.findUsers = function(req, res, next) {
  var query = { $search: req.params.query };
  
  User.find({ $text: query }).exec(function(err, users) {
    if (err) {
      res.status(403);
      return next(err);
    }
    return res.send(200, { success: true, message: 'Users found.', data: users });
  });
};

/**
 * Get user by email
 */
module.exports.getUserByEmail = function(req, res, next) {

};

/**
 * Get user by id
 */
module.exports.getUserById = function(req, res, next) {

};

/**
 * Get user by name
 */
module.exports.getUserByName = function(req, res, next) {

};