'use strict';

var _ = require('underscore');
var Debt = require('../models/debt');

module.exports.addDebt = function(req, res, next) {
  Debt.create({
    creditor: req.user._id,
    debtor: req.body.debtor,
    date: req.body.date,
    reference: req.body.reference,
    amount: req.body.amount
  }, function(err, debt) {
    if (err) {
      res.status(403);
      return next(err);
    }
    return res.send(201, { success: true, message: 'Debt created successfully.', data: debt });
  });
};

module.exports.getDebtsOwedToUser = function(req, res, next) {
  var user = req.user._id;

  Debt.find({ creditor: user }).sort('date').exec(function(err, debts) {
    if (err) return next(err);
    if (!debts || !debts.length) return res.send(404, { success: false, message: 'No debts found to be owed to user.' });
    return res.send(200, { success: true, message: 'Debts owed to user ' + user + '.', data: debts });
  });
};

module.exports.getDebtsOwedByUser = function(req, res, next) {
  var user = req.user._id;

  Debt.find({ debtor: user }).sort('date').exec(function(err, debts) {
    if (err) return next(err);
    if (!debts || !debts.length) return res.send(404, { success: false, message: 'No debts found to be owed by user.' });
    return res.send(200, { success: true, message: 'Debts owed by user ' + user + '.', data: debts });
  });
};

module.exports.getDebt = function(req, res, next) {
  var id = req.params.id;
  Debt.findById(id, function(err, debt) {
    if (err) return next(err);
    if (!debt) return res.send(404, { success: false, message: 'Debt not found.' });
    return res.send(200, { success: true, message: 'Debt found.', data: debt });
  });
};

module.exports.updateDebt = function(req, res, next) {
  Debt.findById(req.params.id, function(err, debt) {
    if (err) return next(err);

    _.each(Debt.schema.paths, function(value, key) {
      if (key !== '_id' && key !== '__v') {
        if (req.body[key]) {
          debt[key] = req.body[key];
        }
      }
    });

    debt.save(function(err) {
      if (err) {
        res.status(403);
        return next(err);
      }
      return res.send(200, { success: true, message: 'Debt updated successfully.', data: debt });
    });
  });
};

module.exports.removeDebt = function(req, res, next) {
  Debt.remove({ _id: req.params.id }, function(err) {
    if (err) return next(err);
    return res.send(200, { success: true, message: 'Debt removed successfully.' });
  });
};