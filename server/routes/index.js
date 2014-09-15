'use strict';

var router = require('express').Router();
var passport = require('passport');
var passportConfig = require('../config/passport');

// Controllers
var controllers = {
  auth: require('../controllers/auth'),
  user: require('../controllers/user'),
  debt: require('../controllers/debt')
};

// Middleware
var isAuthenticated = passportConfig.isAuthenticated;

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
  })
  // User routes - profile
  // Debt routes
  .post('/debts', isAuthenticated, controllers.debt.addDebt)
  .put('/debts/:id', isAuthenticated, controllers.debt.updateDebt)
  .get('/debts/owed', isAuthenticated, controllers.debt.getDebtsOwedToUser)
  .get('/debts/owes', isAuthenticated, controllers.debt.getDebtsOwedByUser)
  .get('/debts/:id', isAuthenticated, controllers.debt.getDebt)
  .delete('/debts/:id', isAuthenticated, controllers.debt.removeDebt);

// Export routes
module.exports = router;