var mongoose = require('mongoose');

var DebtSchema = new mongoose.Schema({
  name: String,
  date: Date,
  amount: Number,
  archived: Boolean,
  debtor: { type: mongoose.Schema.Types.ObjectId, ref: 'Debtor' }
});

module.exports = mongoose.model('Debt', DebtSchema);