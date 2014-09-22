'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');
var secrets = require('./secrets')[process.env.NODE_ENV || 'development'];
var mongoose = require('mongoose')

// Session de/serialize
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(null, user);
  });
});

// Local login
passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done) {
  if (email) email = email.toLowerCase();

  process.nextTick(function() {    
    User.findOne({ 'email': email }, function(err, user) {
      if (err) return done(err);
      if (!user) return done(null, false, { message: 'No user found.' });

      user.comparePassword(password, function(err, isMatch) {
        if (err) return done(err);
        if (!isMatch) return done(null, false, { message: 'Email or password incorrect.' });
        return done(null, user, { message: 'Login successful.' });
      });
    });
  });
}));


/**
 * Local Strategy:
 *
 * - User not logged in
 *   - If user exists
 *     - If password throw error
 *     - Else add password to existing account
 *   - Else create new local account
 * - User already logged in
 *   - If no password, add it
 *   - Else return user
 */

// Local signup
passport.use('local-signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done) {
  if (email) email = email.toLowerCase();

  process.nextTick(function() {
    if (!req.user) {
      User.findOne({ 'email': email }, function(err, signedOutUser) {
        if (err) return done(err);

        if (signedOutUser) {
          if (signedOutUser.password) {
            // If user has a password, we can assume that it's an existing account.
            return done(null, false, { message: 'That email address is taken.' });
          } else {
            // Otherwise, it's an oauth account, add the password
            signedOutUser.password = password;

            signedOutUser.save(function(err) {
              if (err) return done(err);
              return done(null, user);
            });
          }
        } else {
          // Create a new account
          var newUser = new User({
            email: [email],
            password: password
          });

          newUser.save(function(err) {
            if (err) return done(err);
            return done(null, newUser);
          });
        }
      });
    } else if (!req.user.password) {
      var user = req.user;
      
      if (!user.email.contains(email)) user.email.push(email);
      user.password = password;

      user.save(function(err) {
        if (err) return done(err);
        return done(null, user, { message: 'Local password assigned to existing social sign on user.' });
      });
    } else {
      return done(null, req.user, { message: 'User already signed in.' });
    }
  });
}));


/**
 * OAuth Strategy:
 *
 * - User not logged in
 *   - If user with unlinked account exists, link social
 *   - Else if user exists, log in
 *   - Else no user, create one
 * - User already logged in
 *   - Link account
 */

// Sign in with Facebook
passport.use(new FacebookStrategy(secrets.facebook, function(req, token, refreshToken, profile, done) {
  
  var email = (profile.emails[0].value || profile._json.email).toLowerCase();
  
  process.nextTick(function() {
    if (!req.user) {
      User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
        if (err) return done(err);

        if (user) {
          if (!user.facebook.token) {
            user.first_name = user.first_name || profile.name.givenName;
            user.last_name = user.last_name || profile.name.familyName;
            user.display_name = user.display_name || profile.displayName || user.name;
            user.facebook.token = token;
            user.facebook.id = profile.id;
            if (!user.email.indexOf(email) === -1) user.email.push(email);

            user.save(function(err) {
              if (err) return done(err);
              return done(null, user);
            });
          }
          return done(null, user);
        } else {
          var newUser = new User();
          
          newUser.facebook.token = token;
          newUser.facebook.id = profile.id;
          newUser.first_name = profile.name.givenName;
          newUser.last_name = profile.name.familyName;
          newUser.display_name = newUser.display_name || profile.displayName || newUser.name;
          newUser.email.push(email);

          newUser.save(function(err) {
            if (err) return done(err);
            return done(null, newUser);
          });
        }
      });
    } else {
      var user = req.user;
          
      user.facebook.token = token;
      user.facebook.id = profile.id;
      user.first_name = user.first_name || profile.name.givenName;
      user.last_name = user.last_name || profile.name.familyName;
      user.display_name = user.display_name || profile.displayName || user.name;
      if (user.email.indexOf(email) === -1) user.email.push(email);

      user.save(function(err) {
        if (err) return done(err);
        return done(null, user);
      });
    }
  });
}));

// Middleware
module.exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401);
  return next(new Error('Unauthorized request.'));
};

module.exports.isAuthorized = function(req, res, next) {
  var provider = req.path.split('/').slice(-1)[0];

  if (_.find(req.user.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect('/auth/' + provider);
  }
};