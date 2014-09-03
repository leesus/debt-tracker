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

// Local login
passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}), function(req, email, password, done) {
  if (email) email = email.toLowerCase();

  process.nextTick(function() {
    User.findOne({ 'local.email': email }, function(err, user) {
      if (err) return done(err);

      if (!user) return done(null, false, req.flash('loginMessage', 'No user found.'));

      if (!user.validPassword(password)) return done(null, false, req.flash('loginMessage', 'Email or password incorrect!'));

      done(null, user);
    });
  });
});

// Local signup
passport.use('local-signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}), function(req, email, password, done) {
  if (email) email = email.toLowerCase();

  process.nextTick(function() {
    if (!req.user) {
      User.findOne({ 'local.email' }, function(err, user) {
        if (err) return done(err);

        if (user) return done(null, false, req.flash('signupMessage', 'That email is already taken.'));

        var newUser = new User();

        newUser.local.email = email;
        newUser.local.password = password;

        newUser.save(function(err) {
          if (err) return done(err);
          return done(null, newUser);
        });
      });
    } else if (!req.user.local.email) {
      var user = req.user;
      
      user.local.email = email;
      user.local.password = password;

      user.save(function(err) {
        if (err) return done(err);
        return done(null, user);
      });
    } else {
      return done(null, req.user);
    }
  });
});


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
  
  process.nextTick(function() {
    if (!req.user) {
      User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
        if (err) return done(err);

        if (user) {
          if (!user.facebook.token) {
            user.facebook.token = token;
            user.facebook.id = profile.id;
            user.facebook.name = profile.displayName;
            user.facebook.email = (profile.emails[0].value || profile._json.email).toLowerCase();

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
          newUser.facebook.name = profile.displayName;
          newUser.facebook.email = (profile.emails[0].value || profile._json.email).toLowerCase();

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
      user.facebook.name = profile.displayName;
      user.facebook.email = (profile.emails[0].value || profile._json.email).toLowerCase();

      user.save(function(err) {
        if (err) return done(err);
        return done(null, user);
      });
    }
  });
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