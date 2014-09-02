var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');
var secrets = require('./secrets');

// Session de/serialize
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// Local signin
passport.use(new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {
  User.findOne({ 'email': email }, function(err, user) {
    if (err) return done(err);
    if (!user) return done(null, false, { message: 'Email ' + email + ' not found.' });

    user.comparePassword(password, function(err, isMatch) {
      if (isMatch) return done(null, user);
      return done(null, false, { message: 'Invalid email or password' });
    });
  });
}));

/**
 * OAuth Strategy:
 *
 * - User already logged in
 *   - Check if there is an existing account with <provider> id
 *     - If so, return error message
 *     - Else link new OAuth account with current user
 * - User not logged in
 *   - Check if returning user
 *     - If so, sign in
 *     - Else check if there is existing account with email
 *       - If so, return error message
 *       - Else create new account
 */

// Sign in with Facebook
passport.use(new FacebookStrategy(secrets.facebook, function(req, accessToken, refreshToken, profile, done) {
  console.log(accessToken);
  console.log(refreshToken);
  console.log(profile);
  if (req.user) {
    User.findOne({ facebook: profile.id }, function(err, existingUser) {
      if (existingUser) {
        console.log('Existing user, already linked!')
        req.flash('errors', { message: 'There is already a Facebook account that belongs to you. Sign in with that account or delete it and then link it with your current account.' });
        done(err);
      } else {
        User.findById(req.user.id, function(err, user) {
          console.log('Existing user, linking now!')
          user.facebook = profile.id;
          user.tokens.push({ kind: 'facebook', accessToken: accessToken });
          user.name = user.name || profile.displayName;
          user.save(function(err) {
            req.flash('info', { message: 'Facebook account has been linked.' });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({ facebook: profile.id }, function(err, existingUser) {
      if (existingUser) {
        console.log('Existing facebook user')
        return done(null, existingUser);
      }
      User.findOne({ email: profile._json.email }, function(err, existingEmailUser) {
        if (existingEmailUser) {
          console.log('Creating new user, already exists!')
          //req.flash('errors', { message: 'There is already an account using this email address. Sign in with that account and link it with Facebook from account settings.' });
          //done(err);
          console.log(existingEmailUser)
          existingEmailUser.facebook = profile.id;
          existingEmailUser.tokens.push({ kind: 'facebook', accessToken: accessToken });
          existingEmailUser.name = existingEmailUser.name || profile.displayName;
          existingEmailUser.save(function(err) {
            req.flash('info', { message: 'Facebook account has been linked.' });
            done(err, existingEmailUser);
          });
        } else {
          console.log('Creating new user!')
          var user = new User();
          user.email = profile._json.email;
          user.facebook = profile.id;
          user.tokens.push({ kind: 'facebook', accessToken: accessToken });
          user.name = profile.displayName;
          user.save(function(err) {
            done(err, user);
          });
        }
      });
    });
  }
}));

// Middlewares
exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
};

exports.isAuthorized = function(req, res, next) {
  var provider = req.path.split('/').slice(-1)[0];

  if (_.find(req.user.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect('/auth/' + provider);
  }
};