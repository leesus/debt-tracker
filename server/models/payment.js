'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PaymentSchema = new Schema({
  // User debt owed to, maps to user._id
  creditor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  // User debt owed by, maps to user._id
  debtor: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  // Optional payment reference (e.g. 'Phone bill')
  reference: String,

  // Payment amount
  amount: { type: Number, required: true },

  // Payment confirmed by creditor or not
  confirmed: { type: Boolean, 'default': false },

  // Created date
  created_date: { type: Date, 'default': Date.now },

  // Updated date
  updated_date: { type: Date, 'default': Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema);