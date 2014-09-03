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

// Local login
passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done) {
  if (email) email = email.toLowerCase();

  process.nextTick(function() {
    User.findOne({ 'local.email': email }, function(err, user) {
      if (err) return done(err);

      if (!user) return done(null, false, req.flash('loginMessage', 'No user found.'));

      user.comparePassword(password, function(err, isMatch) {
        if (err) return done(err);
        if (!isMatch) return done(null, false, req.flash('loginMessage', 'Email or password incorrect!'));
        return done(null, user);
      });
    });
  });
}));

// Local signup
passport.use('local-signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done) {
  if (email) email = email.toLowerCase();

  process.nextTick(function() {
    if (!req.user) {
      User.findOne({ 'local.email': email }, function(err, user) {
        if (err) return done(err);

        if (user) return done(null, false, req.flash('signupMessage', 'That email is already taken.'));

        // Before creating a user, let's see if there's a facebook account with that address
        User.findOne({ 'facebook.email': email }, function(err, fbUser) {
          if (err) return done(err);
          if (fbUser) {
            fbUser.local.email = email;
            fbUser.local.password = password;

            fbUser.save(function(err) {
              if (err) return done(err);
              return done(null, fbUser);
            })
          } else {
            var newUser = new User({
              local: {
                email: email,
                password: password
              }
            });

            newUser.save(function(err) {
              if (err) return done(err);
              return done(null, newUser);
            });
          }
        })        
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
  
  process.nextTick(function() {
    if (!req.user) {
      User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
        if (err) return done(err);

        if (user) {
          if (!user.facebook.token) {
            user.name = user.name || profile.displayName;
            user.facebook.token = token;
            user.facebook.id = profile.id;
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
          newUser.name = profile.displayName;
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
      user.name = user.name || profile.displayName;profile.displayName;
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