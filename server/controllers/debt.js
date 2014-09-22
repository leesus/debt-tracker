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

  Debt.find({ creditor: user }).order('created_date').exec(function(err, debts) {
    if (err) return next(err);
    return res.send(200, { success: true, message: 'Debts owed to user ' + user, data: debts });
  });
};

module.exports.getDebtsOwedByUser = function(req, res, next) {
  var user = req.user._id;

  Debt.find({ debtor: user }).order('created_date').exec(function(err, debts) {
    if (err) return next(err);
    return res.send(200, { success: true, message: 'Debts owed by user ' + user, data: debts });
  });
};

module.exports.getDebt = function(req, res, next) {
  var id = req.params.id;
  Debt.findById(id, function(err, debt) {
    if (err) return next(err);
    return res.send(200, { success: true, message: 'Debt found.', data: debt });
  });
};

module.exports.updateDebt = function(req, res, next) {
  Debt.findById(req.params.id, function(err, debt) {
    console.log(err)
    console.log(debt)
    if (err) return next(err);

    _.each(req.body, function(value, key) {
      if (debt.hasOwnProperty(key)) {
        debt[key] = value;
      }
    });

    debt.save(function(err) {
      if (err) {
        res.status(403);
        return next(err);
      }
      return res.send(200, { success: true, message: 'Debt updated successfully.' });
    });
  });
};

module.exports.removeDebt = function(req, res, next) {
  Debt.remove({ _id: req.params.id }, function(err) {
    if (err) return next(err);
    return res.send(200, { success: false, message: 'Debt removed successfully.' });
  });
};