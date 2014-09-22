'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DebtSchema = new Schema({
  // User debt owed to, maps to user._id
  creditor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  // User debt owed by, maps to user._id
  debtor: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  // Date of debt (actual date debt is owed)
  date: { type: Date, required: true },

  // Bill reference (e.g. 'Phone bill')
  reference: { type: String, required: true },

  // Bill amount
  amount: { type: Number, required: true },

  // Debt active or not
  archived: { type: Boolean, 'default': false },

  // Created date
  created_date: { type: Date, 'default': Date.now },

  // Updated date
  updated_date: { type: Date, 'default': Date.now }
});

DebtSchema.statics.findAllOwedTo = function(name, fn) {
  return this.find({ creditor: findAllOwedTo }, fn);
};

DebtSchema.pre('save', function(next) {
  this.updated_date = Date.now();
  next();
});

module.exports = mongoose.model('Debt', DebtSchema);