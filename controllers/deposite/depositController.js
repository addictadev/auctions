// const jwt = require('jsonwebtoken');
// const DepositeSchema = require('../../models/Deposit');


// const catchAsync = require('../../utils/catchAsync');
const factory = require('../../utils/apiFactory');
// exports.getDeposit = factory.getOne(DepositeSchema);
// exports.createDeposit = factory.createOne(DepositeSchema);
// exports.deleteDeposit = factory.deleteOne(DepositeSchema);
const AdminNotification = require('../../models/adminNotificationModel'); 

const User = require('../../models/User');
const Notification = require('../../models/notification');
const AppError = require('../../utils/appError');

const catchAsync = require('../../utils/catchAsync');
const Deposit = require('../../models/Deposit');
const bookingfile = require('../../models/bookenigfile');

// const Item = require('../../models/item');
const ItemsSchema = require('../../models/item');
exports.getAllDeposit = factory.getAll(Deposit);
exports.getDeposit = factory.getOne(Deposit);
const admin = require('../../firebase/firebaseAdmin'); // Firebase Admin SDK

const mongoose = require('mongoose');

























// Helper function to send Firebase notifications

// const sendFirebaseNotification = async (user, title, body) => {
//   if (user && user.fcmToken ) {
//     const message = {
//       notification: {
//         title,
//         body
//       },
//       token: user.fcmToken,
//     };
//     try {
//       await admin.messaging().send(message);
//       console.log('Notification sent successfully');
//     } catch (error) {
//       console.error('Error sending notification:', error);
//       // Handle the error, such as removing the invalid token from the database
//       // or implementing retry logic
//     }
//   } else {
//     console.error('User FCM token not found or invalid');
//   }
// };






// exports.createDeposit = async (req, res, next) => {
//   try {
//     const { userId, billingmethod } = req.body;
//     const item = req.item;
//     const amount = item.deposit;

//     const user = req.user;

//     // Step 1: Check wallet balance if billingmethod is wallet
//     if (billingmethod === 'wallet') {
//       if (user.walletBalance < amount) {
//         return next(new AppError('Insufficient balance', 400));
//       }

//       // Deduct amount from user wallet and update transactions
//       user.walletBalance -= amount;
//       user.walletTransactions.push({ amount, type: 'deposit', description: `Deposit for item ${item.name}` });
//     }

//     // Step 2: Create and save the deposit
//     const deposit = new Deposit({
//       userId,
//       item,
//       amount,
//       billImage: req.body.billImage,
//       billingmethod,
//       status: billingmethod === 'wallet' ? 'approved' : 'pending',
//       seenByadmin: billingmethod === 'wallet'
//     });

//     await deposit.save();

//     // Step 3: Send notification
//     const notificationMessage = billingmethod === 'wallet'
//       ? `Your deposit of ${amount} for item ${item.name} was successful and approved.`
//       : `Your deposit for item ${item.name} is pending admin approval.`;

//     const notification = new Notification({
//       userId,
//       message: notificationMessage,
//       itemId: item._id,
//       type:'deposit'

//     });

//     await sendFirebaseNotification(user, 'Deposit Notification', notificationMessage);
//     await notification.save();

//     // Step 4: Save user changes if billingmethod is wallet
//     if (billingmethod === 'wallet') {
//       await user.save({ validateBeforeSave: false });
//     }

//     // If everything succeeded, respond with the deposit
//     res.status(201).json(deposit);

//   } catch (error) {
//     // Rollback operations if an error occurs

//     if (error.code === 11000) {
//       return next(new AppError('Deposit already exists', 400));
//     }

//     if (req.body.billingmethod === 'wallet') {
//       // If there was an error and billingmethod was wallet, revert the user's wallet changes
//       user.walletBalance += req.item.deposit;
//       user.walletTransactions.pop();
//       await user.save({ validateBeforeSave: false });
//     }

//     return next(new AppError(`Server error during deposit: ${error.message}`, 500));
//   }
// };


















// // Fetch notifications for the admin
// exports.getAdminNotifications = async (req, res) => {
//   try {
//     const deposits = await Deposit.find({ seenByadmin: false });
//     res.status(200).json(deposits);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Fetch user notifications
// exports.getUserNotifications = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const deposits = await Deposit.find({ userId, seenByuser: false })
//       .populate({ path: 'item', select: 'name _id' })
//       .select('status item createdAt updatedAt');

//     const transformedDeposits = deposits.map(deposit => {
//       let message;
//       switch (deposit.status) {
//         case 'pending':
//           message = "تم دفع مبلغ التامين بنجاح و سيتم التحقق من المالية في اقرب وقت ممكن";
//           break;
//         case 'approved':
//           message = "تمت الموافقة على الطلب بنجاح";
//           break;
//         case 'rejected':
//           message = "تم رفض الطلب";
//           break;
//         default:
//           message = "حالة غير معروفة";
//       }

//       return {
//         _id: deposit._id,
//         _iditem: deposit.item._id,
//         item: deposit.item.name,
//         status: deposit.status,
//         notification: message,
//       };
//     });

//     res.status(200).json({ data: { notifications: transformedDeposits } });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Approve a deposit
// exports.approveDeposit = async (req, res) => {
//   try {
//     const { depositId } = req.params;
//     const deposit = await Deposit.findByIdAndUpdate(
//       depositId,
//       { status: 'approved', seenByadmin: true, seenByuser: false },
//       { new: true }
//     );

//     if (!deposit) {
//       return res.status(404).json({ error: 'Deposit not found.' });
//     }

//     const user = await User.findById(deposit.userId);
//     await sendFirebaseNotification(user, 'Deposit Approved', `Your deposit for ${deposit.item.name} has been approved.`);

//     res.status(200).json(deposit);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Reject a deposit
// exports.rejectDeposit = async (req, res) => {
//   try {
//     const { depositId } = req.params;
//     const deposit = await Deposit.findByIdAndUpdate(
//       depositId,
//       { status: 'rejected', seenByadmin: true, seenByuser: false },
//       { new: true }
//     );

//     if (!deposit) {
//       return res.status(404).json({ error: 'Deposit not found.' });
//     }

//     const user = await User.findById(deposit.userId);
//     await sendFirebaseNotification(user, 'Deposit Rejected', `Your deposit for ${deposit.item.name} has been rejected.`);

//     res.status(200).json(deposit);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Delete a deposit
// exports.deleteDeposit = async (req, res) => {
//   try {
//     const { depositId } = req.params;
//     const deposit = await Deposit.findByIdAndDelete(depositId);

//     if (!deposit) {
//       return res.status(404).json({ error: 'Deposit not found.' });
//     }

//     res.status(200).json({ message: 'Deposit deleted successfully.' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
















const sendFirebaseNotification = async (user, title, body) => {
  if (user && user.fcmToken) {
    const message = {
      notification: {
        title,
        body,
      },
      token: user.fcmToken,
    };
    try {
      await admin.messaging().send(message);
      console.log('Notification sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  } else {
    console.error('User FCM token not found or invalid');
  }
};

exports.createDeposit = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { userId, billingmethod } = req.body;
    const item = req.item;
    const amount = item.deposit;

    const user = await User.findById(userId).session(session);

    if (!user) {
      await session.abortTransaction();
      return next(new AppError('User not found', 404));
    }

    if (billingmethod === 'wallet') {
      if (user.walletBalance < amount) {
        await session.abortTransaction();
        return next(new AppError('الرصيد  الموجود فى المحفظة غير كافي برجاء الشحن', 400));
      }

      user.walletBalance -= amount;
      user.walletTransactions.push({ amount, type: 'deposit', description: `مبلغ التامين للوط ${item.name}` });
    }

    const deposit = new Deposit({
      userId,
      item,
      amount,
      billImage: req.body.billImage,
      billingmethod,
      status: billingmethod === 'wallet' ? 'approved' : 'pending',
      seenByadmin: billingmethod === 'wallet',
    });

    await deposit.save({ session });

    const notificationMessage = billingmethod === 'wallet'
      ? `تم الموافقة على دفع التامين بمبلغ ${amount} للوط ${item.name} .`
      : `تم ارسال طلب دفع التأمين يمكنك المزايدة بعد التحقق والموافقة على طلب الدفع ${item.name}.`;

    const notification = new Notification({
      userId,
      message: notificationMessage,
      itemId: item._id,
      type: 'deposit',
    });

    await sendFirebaseNotification(user, 'Deposit Notification', notificationMessage);
    await notification.save({ session });
    const adminNotificationMessage = billingmethod === 'wallet'
      ? `تمت الموافقة على إيداع بمبلغ ${amount} للبند ${item.name} من المستخدم ${userId}.`
      : `تم تقديم طلب إيداع للبند ${item.name} ويتطلب موافقة الإدارة.`;

    const adminNotification = new AdminNotification({
      userId,
      title: 'إشعار إيداع جديد',
      message: adminNotificationMessage,
    });

    await adminNotification.save({ session });
    if (billingmethod === 'wallet') {
      await user.save({ session, validateBeforeSave: false });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(deposit);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error.code === 11000) {
      return next(new AppError('طلب دفع التأمين تم بالفعل', 400));
    }

    if (req.body.billingmethod === 'wallet') {
      user.walletBalance += req.item.deposit;
      user.walletTransactions.pop();
      await user.save({ validateBeforeSave: false });
    }

    return next(new AppError(`حدث خطاء فى السيرفر : ${error.message}`, 500));
  }
});

// Approve a deposit
exports.approveDeposit = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { depositId } = req.params;
    const deposit = await Deposit.findByIdAndUpdate(
      depositId,
      { status: 'approved', seenByadmin: true, seenByuser: false },
      { new: true, session }
    );

    if (!deposit) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'طلب الدفع غير موجود.' });
    }

    const user = await User.findById(deposit.userId).session(session);
    await sendFirebaseNotification(user, 'تم الموافقة على طلب دفع التامين', `تم الموافقة على طلب دفع التامين يمكنك المزايدة الان  ${deposit.item.name}.`);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(deposit);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError(`حدث خطاء فى السيرفر : ${error.message}`, 500));
  }
});

// Reject a deposit
exports.rejectDeposit = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { depositId } = req.params;
    const deposit = await Deposit.findByIdAndUpdate(
      depositId,
      { status: 'rejected', seenByadmin: true, seenByuser: false },
      { new: true, session }
    );

    if (!deposit) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'طلب دفع التامين غير موجود.' });
    }

    const user = await User.findById(deposit.userId).session(session);
    await sendFirebaseNotification(user, 'تم رفض دفع التامين', ` ${deposit.item.name} has been rejected.`);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(deposit);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError(`طلب دفع التامين : ${error.message}`, 500));
  }
});

// Delete a deposit
exports.deleteDeposit = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { depositId } = req.params;
    const deposit = await Deposit.findByIdAndDelete(depositId).session(session);

    if (!deposit) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'طلب دفع التامين غير موجود' });
    }

    const user = await User.findById(deposit.userId).session(session);
    if (deposit.billingmethod === 'wallet') {
      user.walletBalance += deposit.amount;
      user.walletTransactions = user.walletTransactions.filter(trans => trans._id.toString() !== depositId);
    }

    await user.save({ session, validateBeforeSave: false });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: 'تم حذف طلب التامين بنجاح.' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError(`Server error during deposit deletion: ${error.message}`, 500));
  }
});

// Fetch notifications for the admin
exports.getAdminNotifications = async (req, res) => {
  try {
    const deposits = await Deposit.find({ seenByadmin: false });
    res.status(200).json(deposits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const deposits = await Deposit.find({ userId, seenByuser: false })
      .populate({ path: 'item', select: 'name _id' })
      .select('status item createdAt updatedAt');

    const transformedDeposits = deposits.map(deposit => {
      let message;
      switch (deposit.status) {
        case 'pending':
          message = "تم دفع مبلغ التامين بنجاح و سيتم التحقق من المالية في اقرب وقت ممكن";
          break;
        case 'approved':
          message = "تمت الموافقة على الطلب بنجاح";
          break;
        case 'rejected':
          message = "تم رفض الطلب";
          break;
        default:
          message = "حالة غير معروفة";
      }

      return {
        _id: deposit._id,
        _iditem: deposit.item._id,
        item: deposit.item.name,
        status: deposit.status,
        notification: message,
      };
    });

    res.status(200).json({ data: { notifications: transformedDeposits } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};






























