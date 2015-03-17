'use strict';

var _ = require('underscore');
var Payment = require('../models/payment');

module.exports.addPayment = function(req, res, next) {
  Payment.create({
    debtor: req.user._id,
    creditor: req.body.creditor,
    reference: req.body.reference,
    amount: req.body.amount
  }, function(err, payment) {
    if (err) {
      res.status(403);
      return next(err);
    }
    return res.send(201, { success: true, message: 'Payment created successfully.', data: payment });
  });
};

module.exports.getPaymentsToUser = function(req, res, next) {
  var user = req.user._id;

  Payment.find({ creditor: user }).sort('created_date').exec(function(err, payments) {
    if (err) return next(err);
    if (!payments || !payments.length) return res.send(404, { success: false, message: 'No payments found to be paid to user.' });
    return res.send(200, { success: true, message: 'Payments paid to user ' + user + '.', data: payments });
  });
};

module.exports.getPaymentsByUser = function(req, res, next) {
  var user = req.user._id;

  Payment.find({ debtor: user }).sort('created_date').exec(function(err, payments) {
    if (err) return next(err);
    if (!payments || !payments.length) return res.send(404, { success: false, message: 'No payments found to be paid by user.' });
    return res.send(200, { success: true, message: 'Payments paid by user ' + user + '.', data: payments });
  });
};

module.exports.getPayment = function(req, res, next) {
  var id = req.params.id;
  Payment.findById(id, function(err, payment) {
    if (err) return next(err);
    if (!payment) return res.send(404, { success: false, message: 'Payment not found.' });
    return res.send(200, { success: true, message: 'Payment found.', data: payment });
  });
};

module.exports.updatePayment = function(req, res, next) {
  Payment.findById(req.params.id, function(err, payment) {
    if (err) return next(err);

    _.each(Payment.schema.paths, function(value, key) {
      if (key !== '_id' && key !== '__v') {
        if (req.body[key]) {
          payment[key] = req.body[key];
        }
      }
    });

    payment.save(function(err) {
      if (err) {
        res.status(403);
        return next(err);
      }
      return res.send(200, { success: true, message: 'Payment updated successfully.', data: payment });
    });
  });
};

module.exports.removePayment = function(req, res, next) {
  Payment.remove({ _id: req.params.id }, function(err) {
    if (err) return next(err);
    return res.send(200, { success: true, message: 'Payment removed successfully.' });
  });
};