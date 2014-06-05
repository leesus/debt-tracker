var mongoose = require('mongoose');

var RepaymentSchema = new mongoose.Schema({
  date: Date,
  amount: Number,
  debtor: { type: mongoose.Schema.Types.ObjectId, ref: 'Debtor' }
});

module.exports = mongoose.model('Repayment', RepaymentSchema);