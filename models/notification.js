const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
  read: { type: Boolean, default: false },
  type: {
    type: String,
    enum: ['payment', 'bookingfiles', 'deposit', 'wallet',"bid",'winner','loser', 'auction','reject'],
    default: 'auction',
  },
},{
  timestamps: true,
  // toJSON: { virtuals: true },
  // toObject: { virtuals: true },
});
notificationSchema.pre('find', function(next) {
  this.populate({
    path: 'userId',
    select: '-_id name '
  }).populate({
    path: 'itemId',
  });

  next();
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
