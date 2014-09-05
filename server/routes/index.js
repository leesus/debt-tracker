var router = require('express').Router();
var passport = require('passport');

// Controllers
var controllers = {
  auth: require('../controllers/auth')
};

// Middleware
var isAuthenticated = passport.isAuthenticated;

// Routes
router
  // Account routes - sign in/sign up/sign out/oauth
  .post('/auth/login', controllers.auth.login)
  .post('/auth/signup', controllers.auth.signup)
  .get('/auth/logout', controllers.auth.logout)
  .get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }))
  .get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/api/auth/success', failureRedirect: '/api/auth/failure' }))
  .get('/auth/success', function(req, res) {
    res.render('after-auth.ejs', { state: 'success', user: req.user ? req.user : null });
  })
  .get('/auth/failure', function(req, res) {
    res.render('after-auth.ejs', { state: 'failure', user: null });
  });

// Export routes
module.exports = router;