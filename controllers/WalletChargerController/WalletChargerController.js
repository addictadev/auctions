// const WalletCharger = require('../../models/WalletCharger');
// const Notification = require('../../models/notification');
// const User = require('../../models/User');
// const admin = require('../../firebase/firebaseAdmin'); // Firebase Admin SDK
// const catchAsync = require('../../utils/catchAsync');
// const factory = require('../../utils/apiFactory');

// exports.getChargingRequests = factory.getAll(WalletCharger);
// exports.getChargingRequestdetails = factory.getOne(WalletCharger);

// exports.chargeWallet = catchAsync(async (req, res, next) => {
//     const { userId, billingMethod, billImage } = req.body;
  
//     // Create wallet charger record
//     const walletCharger = await WalletCharger.create({ userId, billingMethod, billImage });
  
//     // Send notification to user
//     await Notification.create({
//       userId,
//       message: 'You have sent a request for charging.',
//       type:'wallet'

//     });
  
//     // Send notification with Firebase
//     const user = await User.findById(userId).select('fcmToken');
//     if (user && user.fcmToken) {
//       const message = {
//         notification: {
//           title: 'Charging Request',
//           body: 'You have sent a request for charging.',
//         },
//         token: user.fcmToken,
//       };
//       try {
//         await admin.messaging().send(message);
//         console.log('Notification sent successfully');
//       } catch (error) {
//         console.error('Error sending notification:', error);
//         // Handle the error, such as removing the invalid token from the database
//         // or implementing retry logic
//       }
//     } else {
//       console.error('User FCM token not found or invalid');
//       // Handle the case where the user's FCM token is missing or invalid
//     }
  
//     res.status(200).json({ status: 'success', data: walletCharger });
//   });
  
// exports.reviewWalletCharger = catchAsync(async (req, res, next) => {
//   const { paymentId, status, amount } = req.body;
//   const walletCharger = await WalletCharger.findById(paymentId);

//   if (!walletCharger) {
//     return res.status(404).json({ status: 'error', message: 'Wallet Charger not found' });
//   }

//   walletCharger.status = status;
//   if (status === 'completed') {
//     walletCharger.amount = amount;

//     // Update user wallet balance
//     const user = await User.findById(walletCharger.userId);
//     user.walletBalance += amount;
//     user.walletTransactions.push({
//       amount,
//       type: 'deposit',
//       description: 'Wallet charged by admin',
//     });
//     await user.save({ validateBeforeSave: false});

//     // Send notification to user
//     if (user && user.fcmToken) {
//       const message = {
//         notification: {
//           title: 'Payment Approved',
//           body: `Your payment of amount ${amount} has been approved.`,
//         },
//         token: user.fcmToken,
//       };
//       await admin.messaging().send(message);
//     }
//   }

//   // Send notification in all cases
//   await Notification.create({
//     userId: walletCharger.userId,
//     message: status === 'completed' ? `Your payment of amount ${amount} has been approved.` : 'Your payment has been rejected.',
//     type:'wallet'

//   });

//   if (walletCharger.status !== 'completed' && user && user.fcmToken) {
//     const message = {
//       notification: {
//         title: 'Payment Status Update',
//         body: `Your payment has been ${status}.`,
//       },
//       token: user.fcmToken,
//     };
//     await admin.messaging().send(message);
//   }

//   await walletCharger.save({ validateBeforeSave: false});
//   res.status(200).json({ status: 'success', data: walletCharger });
// });

// exports.getUserChargingHistory = catchAsync(async (req, res, next) => {
//   const userId = req.params.userId;

//   const chargingHistory = await WalletCharger.find({ userId }).sort({ createdAt: -1 });

//   res.status(200).json({ status: 'success', data: chargingHistory });
// });
















//////////////////////////////////////////////with sessions /////////////////////////////////////////////////////////////


const WalletCharger = require('../../models/WalletCharger');
const Notification = require('../../models/notification');
const User = require('../../models/User');
const admin = require('../../firebase/firebaseAdmin'); // Firebase Admin SDK
const catchAsync = require('../../utils/catchAsync');
const factory = require('../../utils/apiFactory');
const mongoose = require('mongoose');
const AppError = require('../../utils/appError');
const AdminNotification = require('../../models/adminNotificationModel'); 

exports.getChargingRequests = factory.getAll(WalletCharger);
exports.getChargingRequestdetails = factory.getOne(WalletCharger);

exports.chargeWallet = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { userId, billingMethod, billImage } = req.body;

    // Create wallet charger record
    const walletCharger = await WalletCharger.create([{ userId, billingMethod, billImage }], { session });

    // Send notification to user
    await Notification.create([{ userId, message: 'تم ارسال طلب شحن المحفظة', type: 'wallet' }], { session });

    // Send notification with Firebase
    const user = await User.findById(userId).select('fcmToken phoneNumber').session(session);
    if (user && user.fcmToken) {
      const message = {
        notification: {
          title: 'طلب شحن المحفظة',
          body: 'تم ارسال طلب شحن المحفظة',
        },
        token: user.fcmToken,
      };
      try {
        await admin.messaging().send(message);
        console.log('Notification sent successfully');
      } catch (error) {
        console.error('Error sending notification:', error);
        // Handle the error, such as removing the invalid token from the database
        // or implementing retry logic
      }
    } else {
      console.error('User FCM token not found or invalid');
      // Handle the case where the user's FCM token is missing or invalid
    }
    const adminNotificationMessage = `تم تقديم طلب شحن المحفظة من قبل المستخدم ${user.phoneNumber}.`;
    const adminNotification = new AdminNotification({
      userId,
      title: 'طلب شحن المحفظة',
      message: adminNotificationMessage,
    });
    
    await adminNotification.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ status: 'success', data: walletCharger });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError(`حدث خطاء اثناء ارسال الطلب الرجاء اعادة المحاولة : ${error.message}`, 500));
  }
});

exports.reviewWalletCharger = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { paymentId, status, amount } = req.body;
    const walletCharger = await WalletCharger.findById(paymentId).session(session);

    if (!walletCharger) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ status: 'error', message: 'المحفظة غير موجودة' });
    }

    walletCharger.status = status;
    const user = await User.findById(walletCharger.userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ status: 'error', message: 'المستخدم غير موجود' });
    }

    if (status === 'completed') {
      walletCharger.amount = amount;

      // Update user wallet balance
      user.walletBalance += parseInt(amount);
      user.walletTransactions.push({
        amount,
        type: 'deposit',
        description: "شحن رصيد الى المحفظة",
      });
      await user.save({ session, validateBeforeSave: false });

      // Send notification to user
      if (user && user.fcmToken) {
        const message = {
          notification: {
            title: "طلب شحن المحفظة",
            body: `تم اضافة الرصيد الى المحفظة بمبلغ${amount}بنجاح .`,
          },
          token: user.fcmToken,
        };
        await admin.messaging().send(message);
      }
    }

    // Send notification in all cases
    await Notification.create([{ userId: walletCharger.userId, message: status === 'completed' ? ` تم اضافة رصيد اللى المحفظة بنجاح بمبلغ${amount} .` : 'طلبك لشحن المحفظة رفض', type: 'wallet' }], { session });

    if (walletCharger.status !== 'completed' && user && user.fcmToken) {
      const message = {
        notification: {
          title: 'حالة طلب شحن المحفظة',
          body: `طلبك لشحن المحفظة  ${status}.`,
        },
        token: user.fcmToken,
      };
      await admin.messaging().send(message);
    }

    await walletCharger.save({ session, validateBeforeSave: false });
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({ status: 'success', data: walletCharger });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError(`حدث خطاء فى السيرفر: ${error.message}`, 500));
  }
});

exports.getUserChargingHistory = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;

  const chargingHistory = await WalletCharger.find({ userId }).sort({ createdAt: -1 });

  res.status(200).json({ status: 'success', data: chargingHistory });
});











////////////////////////////////////////////////////////////////////////////////////////////////////////////////