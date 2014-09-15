'use strict';

var Debt = require('../models/debt');

module.exports.addDebt = function(req, res, next) {
  Debt.create({
    creditor: req.user._id,
    debtor: req.body.debtor,
    date: req.body.date,
    reference: req.body.reference,
    amount: req.body.amount
  }, function(err, debt) {
    if (err) return next(err);
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
  var id = req.params.id;
  Debt.update(id, function(err) {
    if (err) return next(err);
    return res.send(200, { success: true, message: 'Debt updated successfully.' });
  });
};

module.exports.removeDebt = function(req, res, next) {
  Debt.remove({ _id: req.params.id }, function(err) {
    if (err) return next(err);
    return res.send(200, { success: false, message: 'Debt removed successfully.' });
  });
};