// Dependencies
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// Models
var User = require('./server/models/user');
var Debtor = require('./server/models/debtor');
var Debt = require('./server/models/debt');
var Repayment = require('./server/models/repayment');

mongoose.connect('mongodb://localhost:27017/debt-tracker');

var app = express();
var router = express.Router();
var port = process.env.port || 3000;


app.get('/', function(req, res, next) {
  res.send('Welcome to Debt Tracker');
});

// Middleware
app.use(bodyParser());

// API routes
// TODO - Refactor out
app.use('/api', router);
// Account routes
var account = router.route('/account');
account.post('/signup', function(req, res, next) {
  var user = new User({
    email: req.body.email, 
    password: req.body.password
  });
  user.save(function(err) {
    if (err) return next(err);
    res.send(200);
  });
});
account.post('/login', function(req, res, next) {

});
account.get('/logout', function(req, res, next) {
  req.logout();
  res.send(200);
});

// Error middleware
app.get('404', function(req, res, next) {
  res.send('404');
});

app.get('500', function(req, res, next) {
  res.send('500');
});

app.listen(port, function() {
  console.log('App started on port', port);
});