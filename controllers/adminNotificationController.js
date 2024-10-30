
// controllers/adminNotificationController.js
const AdminNotification = require('../models/adminNotificationModel');
const factory = require('../utils/apiFactory');
const catchAsync = require('../utils/catchAsync');

exports.getAllNotifications = factory.getAll(AdminNotification);
exports.getNotification = factory.getOne(AdminNotification);
exports.createNotification = factory.createOne(AdminNotification);
exports.updateNotification = factory.updateOne(AdminNotification);
exports.deleteNotification = factory.deleteOne(AdminNotification);

// Custom controller to mark a notification as seen
exports.markAsSeen = catchAsync(async (req, res, next) => {
  const notification = await AdminNotification.findByIdAndUpdate(
    req.params.id,
    { seen: true },
    { new: true, runValidators: true }
  );

  if (!notification) {
    return next(new AppError('No notification found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: notification
    }
  });
});

exports.markAllAsSeen = catchAsync(async (req, res, next) => {
  console.log("object");
  await AdminNotification.updateMany({ seen: false }, { seen: true });

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as seen'
  });
});