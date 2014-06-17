var mongoose = require('mongoose');

var RepaymentSchema = new mongoose.Schema({
  date: Date,
  amount: Number
});

module.exports = mongoose.model('Repayment', RepaymentSchema);