var router = require('express').Router();
var passport = require('passport');

// Controllers
var controllers = {
  account: require('../controllers/account')
};

// Middleware
var auth = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.send(401);
};

// Routes
router
  .post('/account/login', controllers.account.login)
  .post('/account/signup', controllers.account.signup)
  .get('/account/logout', controllers.account.logout)
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