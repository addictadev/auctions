const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const adminNotificationSchema = new Schema(
    {
     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

      title: {
        type: String,
        required: [true, 'Notification must have a title']
      },
      message: {
        type: String,
        required: [true, 'Notification must have a message']
      },
      seen: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    },
    {
      toJSON: { virtuals: true },
      toObject: { virtuals: true }
    }
  );
  adminNotificationSchema.pre('find', function(next) {
    this.populate({
      path: 'userId',
      select: 'name email photo phoneNumber'
    })
    next();
  });

  module.exports = mongoose.model('AdminNotification', adminNotificationSchema);
 
  