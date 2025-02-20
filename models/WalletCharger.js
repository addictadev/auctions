const mongoose = require('mongoose');

const walletChargerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  billingMethod: { type: String, enum:['mobile', 'bank','fawry', 'instapay'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'pending' },
  billImage: {
    type: { name: String, path: String, pathname: String },
    required: true,
  },
  amount: { type: Number },
  createdAt: { type: Date, default: Date.now }
   // This will be set by admin
}, {
  timestamps: true,
});

// walletChargerSchema.index({ userId: 1 }, { unique: true });
walletChargerSchema.pre('find', function () {
  this.populate('userId').select('name email idNumber phoneNumber walletTransactions walletBalance');
})
module.exports = mongoose.model('WalletCharger', walletChargerSchema);
