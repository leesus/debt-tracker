var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DebtSchema = new Schema({
  // Maps to user._id
  _owner: { type: Schema.Types.ObjectId, ref: 'User' },

  created: { type: Date, 'default': Date.now }
});

module.exports = mongoose.model('Debt', DebtSchema);