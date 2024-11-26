// const mongoose = require('mongoose');
// const Payment = require('../../models/Payment');
// const Winner = require('../../models/Winner');
// const Item = require('../../models/item');
// const User = require('../../models/User');
// const Notification = require('../../models/notification');
// const AppError = require('../../utils/appError');
// const admin = require('../../firebase/firebaseAdmin'); // Firebase Admin SDK


// const processPayment = async (req, res, next) => {
//   try {
//     const { userId, itemId, winnerid, billingMethod, billImage } = req.body;

//     // Ensure winner and item are defined
//     const winner = req.winner;
//     if (!winner) {
//       return next(new AppError('Winner not found', 404));
//     }

//     const item = req.item;
//     if (!item) {
//       return next(new AppError('Item not found', 404));
//     }

//     const dueAmount = winner.totalAmount;

//     if (dueAmount <= 0) {
//       return res.status(400).json({ message: 'The due amount must be greater than zero.' });
//     }

//     const payment = new Payment({
//       winnerid,
//       billImage: billImage,
//       billingMethod,
//       status: billingMethod === 'wallet' ? 'completed' : 'pending'
//     });

//     const user = await User.findById(userId);
//     if (!user) {
//       return next(new AppError('User not found', 404));
//     }

//     if (billingMethod === 'wallet') {
//       if (user.walletBalance < dueAmount) {
//         return next(new AppError('Insufficient balance', 400));
//       }

//       user.walletBalance -= dueAmount;
//       user.walletTransactions.push({ amount: dueAmount, type: 'payment', description: `Payment for item ${item.name}` });
//       await user.save({ validateBeforeSave: false });
//     }

//     await payment.save();

//     const notification = new Notification({
//       userId,
//       message: billingMethod === 'wallet' 
//         ? `Your payment of ${dueAmount} for ${item.name} was successful.` 
//         : `Your payment for ${item.name} is pending admin approval.`,
//       itemId,
//       type:'payment'

//     });

//     if (user && user.fcmToken) {
//       const message = {
//         notification: {
//           title: 'Payment Successful',
//           body: billingMethod === 'wallet' 
//             ? `Your payment of ${dueAmount} for ${item.name} was successful.` 
//             : `Your payment for ${item.name} is pending admin approval.`
//         },
//         token: user.fcmToken,
//       };
//       try {
//         await admin.messaging().send(message);
//         console.log('Notification sent successfully');
//       } catch (error) {
//         console.error('Error sending notification:', error);
//       }
//     } else {
//       console.error('User FCM token not found or invalid');
//     }

//     await notification.save();

//     res.status(201).json({ status: "success", data: payment });
//   } catch (error) {
//     if (error.code === 11000) {
//       return next(new AppError('You already paid', 400));
//     }
//     return next(new AppError(error.message, 500));
//   }
// };























// // const approvePayment = async (req, res, next) => {
//   const approvePayment = async (req, res, next) => {
//     try {
//       const { paymentId, action } = req.body; // action should be 'approve' or 'reject'
//       const payment = await Payment.findById(paymentId);
  
//       if (!payment || payment.status !== 'pending') {
//         return res.status(400).json({ message: 'Invalid payment or payment is not pending.' });
//       }
  
//       if (action === 'approve') {
//         payment.status = 'completed';
//         const notification = new Notification({
//           userId: payment.userId,
//           message: `Your payment of ${payment.amount} for item ${payment.itemId} has been approved.`,
//           itemId: payment.itemId,
//           type:'payment'
  
//         });
//         await notification.save();
//       } else if (action === 'reject') {
//         payment.status = 'rejected';
//         const notification = new Notification({
//           userId: payment.userId,
//           message: `Your payment of ${payment.amount} for item ${payment.itemId} has been rejected.`,
//           itemId: payment.itemId,
//           type:'payment'
  
//         });
//         await notification.save();
//       } else {
//         return res.status(400).json({ message: 'Invalid action specified.' });
//       }
  
//       await payment.save();
//       res.status(200).json({ message: `Payment has been ${payment.status}.` });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   };
  
  
  
  
  
  
//   module.exports = { processPayment,approvePayment };





/////////////////////////////////////////////with sessions //////////////////////////////////

const mongoose = require('mongoose');
const Payment = require('../../models/Payment');
const Winner = require('../../models/Winner');
const Item = require('../../models/item');
const User = require('../../models/User');
const Notification = require('../../models/notification');
const AppError = require('../../utils/appError');
const admin = require('../../firebase/firebaseAdmin'); // Firebase Admin SDK
const factory = require('../../utils/apiFactory');
const AdminNotification = require('../../models/adminNotificationModel'); 
const subcategory = require('../../models/subcategory');

const getprocessPayment = factory.getAll(Payment);
// Helper function to send Firebase notifications
const sendFirebaseNotification = async (userfcmtoken, title, body) => {
  const user= await User.findById(userfcmtoken)
  console.log("fmctoken",user.fcmToken)
  console.log("user",user)

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

const processPayment = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { userId, itemId, winnerid, billingMethod, billImage } = req.body;

    const winner = req.winner;
    if (!winner) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('Winner not found', 404));
    }

    const item = req.item;
    if (!item) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('Item not found', 404));
    }

    const dueAmount = winner.totalAmount;

    if (dueAmount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'The due amount must be greater than zero.' });
    }

    const payment = new Payment({
      winnerid,
      billImage: billImage,
      billingMethod,
      status: billingMethod === 'wallet' ? 'completed' : 'pending',
    });

    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('User not found', 404));
    }

    if (billingMethod === 'wallet') {
      if (user.walletBalance < dueAmount) {
        await session.abortTransaction();
        session.endSession();
        return next(new AppError('رصيد المحفظة لا يكفي برجاء اعادة الشحن للاستمرار', 400));
      }

      user.walletBalance -= dueAmount;
      user.walletTransactions.push({ amount: dueAmount, type: 'payment', description: `طلب استكمال الدفع ${item.name}` });
      await user.save({ session, validateBeforeSave: false });
    }

    await payment.save({ session });
    // ? `تمت معالجة الدفع بمبلغ ${dueAmount} بنجاح للبند ${item.name} بواسطة المستخدم ${userId}.`
    // : `تم تقديم طلب دفع للبند ${item.name} ويتطلب موافقة الإدارة.`,
    const subcategory = await subcategory.findById(item.subcategoryId).select('name').session(session);

    if (!subcategory) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Subcategory not found.' });
    }

    const subcategoryName = subcategory.name;
    const notification = new Notification({
      userId,
      message: billingMethod === 'wallet'
      ? `تم استكمال دفع المزاد بنجاح`
      : ` تم ارسال طلب استكمال الدفع بمزاد ${subcategoryName}.`,
      itemId,
      type: 'payment',
    });

    await sendFirebaseNotification(user, 'طلب استكمال الدفع', notification.message);
    await notification.save({ session });

    const adminNotificationMessage = billingMethod === 'wallet'
      ? `تمت معالجة الدفع بمبلغ ${dueAmount} بنجاح للبند ${item.name} بواسطة المستخدم ${userId}.`
      : `تم تقديم طلب دفع للبند ${item.name} ويتطلب موافقة الإدارة.`;
      
    const adminNotification = new AdminNotification({
      userId,
      title: 'إشعار دفع جديد',
      message: adminNotificationMessage,
    });

    await adminNotification.save({ session });



    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ status: 'success', data: payment });
  } catch (error) {
    console.log(error)
    await session.abortTransaction();
    session.endSession();
    if (error.code === 11000) {
      return next(new AppError('You already paid', 400));
    }
    return next(new AppError(error.message, 500));
  }
};

// const approvePayment = async (req, res, next) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const { paymentId, action } = req.body;
//     const payment = await Payment.findById(paymentId).session(session);

//     if (!payment || payment.status !== 'pending') {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ message: 'Invalid payment or payment is not pending.' });
//     }

//     if (action === 'approve') {
//       payment.status = 'completed';
//       const notification = new Notification({
//         userId: payment.winnerid.userId,
//         message: `Your payment of ${payment.amount} for item ${payment.itemId} has been approved.`,
//         itemId: payment.itemId,
//         type: 'payment',
//       });
//       await notification.save({ session });
//       await sendFirebaseNotification(user, 'Payment Approved', notification.message);
//     } else if (action === 'reject') {
//       payment.status = 'rejected';
//       const notification = new Notification({
//         userId: payment.userId,
//         message: `Your payment of ${payment.amount} for item ${payment.itemId} has been rejected.`,
//         itemId: payment.itemId,
//         type: 'payment',
//       });
//       await notification.save({ session });
//       await sendFirebaseNotification(user, 'Payment Rejected', notification.message);
//     } else {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ message: 'Invalid action specified.' });
//     }

//     await payment.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     res.status(200).json({ message: `Payment has been ${payment.status}.` });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     res.status(500).json({ error: error.message });
//   }
// };


const approvePayment = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { paymentId, action,message } = req.body;
    // const payment = await Payment.findById(paymentId)
    //   .populate({
    //     path: 'winnerid',
    //     populate: {
    //       path: 'userId',
    //       select: 'name phoneNumber',
    //     },
    //   })
      // .populate('itemId') // Assuming `itemId` exists in your Payment schema
      // .session(session);
      const payment = await Payment.findById(paymentId)
      .populate({
        path: 'winnerid',
        populate: {
          path: 'userId',
          select: 'name phoneNumber',
        },
      })
      .populate({
        path: 'winnerid.subcategory',  // Populate the subcategory here
        select: 'name',
      })
      .session(session);
      const subcategoryId = payment.winnerid.subcategory;

    if (!payment || payment.status !== 'pending') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Invalid payment or payment is not pending.' });
    }
   
    const subcategorya = await subcategory.findById(subcategoryId).select('name').session(session);

    if (!subcategorya) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Subcategory not found.' });
    }

    const subcategoryName = subcategorya.name;
    if (action === 'approve') {
      payment.status = 'completed';
      const notification = new Notification({
        userId: payment.winnerid.userId._id,
        message: `مبرووك تم تاكيد استكمال الدفع لمزاد ${subcategoryName} بمبلغ ${payment.winnerid.totalAmount} يمكنك الاستلام الان  :  
        ${message}.`,
        // itemId: payment.itemId._id,
        type: 'payment',
      });
      await notification.save({ session });
      await sendFirebaseNotification(payment.winnerid.userId, `تاكيد استكمال الدفع`, notification.message);
    } else if (action === 'reject') {
     await Payment.findByIdAndDelete(paymentId)    
      
      const notification = new Notification({
        userId: payment.winnerid.userId._id,
        message: `تم رفض استكمال الدفع لمزاد ${subcategoryName} بمبلغ ${payment.winnerid.totalAmount} لوجود خطاء بالبيانات:${message}.`,
        // itemId: payment.itemId._id,
        type: 'payment',
      });
      await sendFirebaseNotification(payment.winnerid.userId, `تم رفض استكمال الدفع  ${message}`, notification.message);
      await notification.save({ session });
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Invalid action specified.' });
    }

    await payment.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: `Payment has been ${payment.status}.` });
  } catch (error) {
    console.log(error)
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message });
  }
};


module.exports = { processPayment, approvePayment,getprocessPayment };








///////////////////////////////////////////////////////////////////////////////////
















// const processPayment = async (req, res, next) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { userId, itemId, winnerid,billingMethod,billImage } = req.body;
//     const winner = req.winner;
//     const item = req.item;

   
//     const dueAmount = req.winner.totalAmount 

//     if (dueAmount <= 0) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ message: 'The due amount must be greater than zero.' });
//     }

//     const payment = new Payment({
//         winnerid,
//     //   amount: dueAmount,
//       billImage: billImage,

//       billingMethod,
//       status: billingMethod === 'wallet' ? 'completed' : 'pending'
//     });

//     const user = await User.findById(userId).session(session);
//     if (billingMethod === 'wallet') {

//       if (user.walletBalance < dueAmount) {
//         await session.abortTransaction();
//         session.endSession();
//         return next(new Error('Insufficient balance'));
//       }

//       user.walletBalance -= dueAmount;
//       user.walletTransactions.push({ amount: dueAmount, type: 'payment', description: `Payment for item ${item.name}` });
//       await user.save({ session, validateBeforeSave: false });
//     }

//     await payment.save({ session });

//     const notification = new Notification({
//       userId,
//       message: billingMethod === 'wallet' 
//         ? `Your payment of ${dueAmount} for ${item.name} was successful.` 
//         : `Your payment for ${item.name} is pending admin approval.`,
//       itemId
//     });






//     if (user && user.fcmToken) {
//       const message = {
//         notification: {
//           title: ' booking was successful ',
//           body: billingmethod === 'wallet' ? `Your deposit was successful ${req.item.name}.` : `Your booking files ${req.item.name} is pending admin approval.` 
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
//     await notification.save({ session });

//     await session.commitTransaction();
//     session.endSession();
//     res.status(201).json({status:"success",data:payment});
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     if (error.code === 11000) {
//         return next(new AppError('you  already payed  exists', 400));
//        }
//      return next(new AppError(error, 400));
   
//   }
// };




  
//     const session = await mongoose.startSession();
//     session.startTransaction();
  
//     try {
//       const { paymentId, action } = req.body; // action should be 'approve' or 'reject'
//       const payment = await Payment.findById(paymentId).session(session);
  
//       if (!payment || payment.status !== 'pending') {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(400).json({ message: 'Invalid payment or payment is not pending.' });
//       }
  
//       if (action === 'approve') {
//         payment.status = 'completed';
//         const notification = new Notification({
//           userId: payment.userId,
//           message: `Your payment of ${payment.amount} for item ${payment.itemId} has been approved.`,
//           itemId: payment.itemId
//         });
//         await notification.save({ session });
//       } else if (action === 'reject') {
//         payment.status = 'rejected';
//         const notification = new Notification({
//           userId: payment.userId,
//           message: `Your payment of ${payment.amount} for item ${payment.itemId} has been rejected.`,
//           itemId: payment.itemId
//         });
//         await notification.save({ session });
//       } else {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(400).json({ message: 'Invalid action specified.' });
//       }
  
//       await payment.save({ session });
//       await session.commitTransaction();
//       session.endSession();
//       res.status(200).json({ message: `Payment has been ${payment.status}.` });
//     } catch (error) {
//       await session.abortTransaction();
//       session.endSession();
//       res.status(500).json({ error: error.message });
//     }
//   };
  
 

  
