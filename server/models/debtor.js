var mongoose = require('mongoose');

var DebtorSchema = new mongoose.Schema({
  name: String,
  debts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Debt'}],
  repayments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Repayment'}],
  account: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Debtor', DebtorSchema);