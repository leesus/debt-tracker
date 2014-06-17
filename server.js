// Dependencies
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// Models
var Debtor = require('./app/models/debtor');
var Debt = require('./app/models/debt');
var Repayment = require('./app/models/repayment');

mongoose.connect('mongodb://localhost:27017/debt-tracker');

var app = express();
var router = express.Router();
var port = process.env.port || 3000;


app.get('/', function(req, res, next) {
  res.send('Welcome to Debt Tracker');
});

// Middleware
app.use(bodyParser());
app.use('/api', router);

// API routes - refactor out later
// Debtor routes
var debtors = router.route('/debtors');

// GET: /api/debtors
debtors.get(function(req, res, next) {
  Debtor.find(function(err, debtors) {
    if (err) res.send(err);

    if (!debtors.length) debtors = { message: 'There are no debtors, add some to get started' };

    res.json(debtors);
  });
});
// POST: /api/debtors
debtors.post(function(req, res, next) {
  var debtor = new Debtor();
  debtor.name = req.body.name;

  debtor.save(function(err) {
    if (err) res.send(err);

    res.json({ message: 'Debtor successfully added.', data: debtor });
  });
});

// Debt routes
var debts = router.route('/debts');

// GET: /api/debts
debts.get(function(req, res, next) {
  Debt.find(function(err, debts) {
    if (err) res.send(err);

    if (!debts.length) debts = { message: 'There are no debts, add some to get started' };

    res.json(debts);
  });
});
// POST: /api/debts
debts.post(function(req, res, next) {
  var debt = new Debt();
  debt.name = req.body.name;
  debt.date = new Date();
  debt.amount = +req.body.amount;
  debt.archived = false;
  debt.debtor = req.body.debtor;

  debt.save(function(err) {
    if (err) res.send(err);

    res.json({ message: 'Debt successfully added.', data: debt });
  });
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