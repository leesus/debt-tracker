var mongoose = require('mongoose');

var DebtSchema = new mongoose.Schema({
  name: String,
  date: Date,
  amount: Number,
  archived: Boolean
});

module.exports = mongoose.model('Debt', DebtSchema);