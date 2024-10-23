const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
  type: { type: String, enum: ['deposit', 'withdrawal','refundfromadmin'], required: true },
  description: { type: String },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },  // Reference to Admin
  createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
