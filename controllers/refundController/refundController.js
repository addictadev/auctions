const RefundRequest = require('../../models/RefundReques');
const AppError = require('../../utils/appError'); // Ensure you have an AppError class for handling errors
const catchAsync = require('../../utils/catchAsync'); 
const AdminNotification = require('../../models/adminNotificationModel'); 
// Ensure you have a utility function for catching errors in async functions

exports.createRefundRequest = catchAsync(async (req, res, next) => {
  const { user } = req;
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

  // Check if the user has already made two requests today
  const count = await RefundRequest.countDocuments({
    user: user._id,
    // requestDate: { $gte: today }
  });

//   if (count >= 1) {
//     return next(new AppError('You have reached your limit of one refund requests per day.', 400));
//   }

  const newRequest = await RefundRequest.create({
    user: user._id
  });
  const adminNotificationMessage = `تم تقديم طلب استرداد جديد من قبل المستخدم ${user.name}.`;
  const adminNotification = new AdminNotification({
    userId: user._id,
    title: 'طلب استرداد جديد',
    message: adminNotificationMessage,
  });

  await adminNotification.save();
  res.status(201).send({
    status: 'success',
    data: {
      refundRequest: newRequest
    }
  });
});

exports.getAllRefundRequests = catchAsync(async (req, res, next) => {
  const { status } = req.query;
  const filter = status ? { status } : {};

//   const refundRequests = await RefundRequest.find().populate('user', 'name phoneNumber');
    const refundRequests = await RefundRequest.find({}).populate('user', 'name phoneNumber idNumber')
    console.log("refundRequests",refundRequests)
  res.status(200).send({
    status: 'success',
    results: refundRequests.length,
    data: {
      refundRequests
    }
  });
});

exports.updateRefundRequestToCompleted = catchAsync(async (req, res, next) => {
  const { requestId } = req.params;

  const updatedRequest = await RefundRequest.findByIdAndUpdate(requestId, { status: 'completed' }, { new: true });

  if (!updatedRequest) {
    return next(new AppError('No request found with that ID', 404));
  }

  res.status(200).send({
    status: 'success',
    data: {
      refundRequest: updatedRequest
    }
  });
});

exports.deleteRefundRequest = catchAsync(async (req, res, next) => {
  const { requestId } = req.params;

  const deletedRequest = await RefundRequest.findByIdAndDelete(requestId);

  if (!deletedRequest) {
    return next(new AppError('No request found with that ID', 404));
  }

  res.status(204).send({
    status: 'success',
    data: null
  });
});
