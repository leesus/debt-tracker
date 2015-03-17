'use strict';

var router = require('express').Router();
var passport = require('passport');
var passportConfig = require('../config/passport');

// Controllers
var controllers = {
  auth: require('../controllers/auth'),
  user: require('../controllers/user'),
  debt: require('../controllers/debt'),
  payment: require('../controllers/payment')
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
  // Profile routes
  // User routes
  .post('/users', isAuthenticated, controllers.user.addUser)
  .put('/users/:id', isAuthenticated, controllers.user.updateUser)
  .get('/users', isAuthenticated, controllers.user.getUsers)
  .get('/users/search/:query', isAuthenticated, controllers.user.findUsers)
  .get('/users/:id', isAuthenticated, controllers.user.getUserById)
  .delete('/users/:id', isAuthenticated, controllers.user.removeUser)
  // Debt routes
  .post('/debts', isAuthenticated, controllers.debt.addDebt)
  .put('/debts/:id', isAuthenticated, controllers.debt.updateDebt)
  .get('/debts/owed', isAuthenticated, controllers.debt.getDebtsOwedToUser)
  .get('/debts/owes', isAuthenticated, controllers.debt.getDebtsOwedByUser)
  .get('/debts/:id', isAuthenticated, controllers.debt.getDebt)
  .delete('/debts/:id', isAuthenticated, controllers.debt.removeDebt)
  // Payment routes
  .post('/payments', isAuthenticated, controllers.payment.addPayment)
  .put('/payments/:id', isAuthenticated, controllers.payment.updatePayment)
  .get('/payments/received', isAuthenticated, controllers.payment.getPaymentsToUser)
  .get('/payments/paid', isAuthenticated, controllers.payment.getPaymentsByUser)
  .get('/payments/:id', isAuthenticated, controllers.payment.getPayment)
  .delete('/payments/:id', isAuthenticated, controllers.payment.removePayment);

// Export routes
module.exports = router;