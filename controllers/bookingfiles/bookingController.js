// // controllers/bookingController.js

// const Booking = require('../../models/bookenigfile');
// const User = require('../../models/User');
// const Notification = require('../../models/notification');
// const mongoose = require('mongoose');
// const factory = require('../../utils/apiFactory');
// const AppError = require('../../utils/appError');
// const admin = require('../../firebase/firebaseAdmin'); // Firebase Admin SDK

// const APIFeatures = require('../../utils/apiFeatures');




















// // Helper function to send Firebase notifications

// const sendFirebaseNotification = async (user, title, body) => {
//   if (user && user.fcmToken ) {
//     // console.log(user.fcmToken,user.isLogin)
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
//     }
//   } else {
//     console.error('User FCM token not found or invalid');
//   }
// };

// exports.bookFile = async (req, res, next) => {
//   try {
//     const { userId, itemId, billingmethod } = req.body;
//     const amount = req.item.fileprice;

//     // Check for duplicate booking
//     const existingBooking = await Booking.findOne({ userId, item: itemId });
//     if (existingBooking) {
//       return next(new AppError('Booking already exists for this item and user', 400));
//     }

//     const newBooking = new Booking({
//       userId,
//       item: itemId,
//       amount,
//       billingmethod,
//       billImage: req.body.billImage,
//       seenByadmin: billingmethod === 'wallet',
//       status: billingmethod === 'wallet' ? 'approved' : 'pending'
//     });

//     const user = req.user;

//     if (billingmethod === 'wallet') {
//       if (user.walletBalance < amount) {
//         return next(new AppError('Insufficient wallet balance', 400));
//       }

//       user.walletBalance -= amount;
//       user.walletTransactions.push({ amount, type: 'withdrawal', description: `Booking for item ${itemId}` });
//       await user.save({ validateBeforeSave: false });
//     }

//     await newBooking.save();

//     const notificationMessage = billingmethod === 'wallet'
//       ? `Your booking was successful for ${req.item.name}.`
//       : `Your booking for ${req.item.name} is pending admin approval.`;

//     const notification = new Notification({
//       userId,
//       message: notificationMessage,
//       itemId,
//       type:'bookingfiles'
//     });

//     await sendFirebaseNotification(user, 'Booking Notification', notificationMessage);
//     await notification.save();

//     res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
//   } catch (error) {
//     next(new AppError(error.message, 500));
//   }
// };









// // Get all bookings
// exports.getAllBookings = factory.getAll(Booking);

// // Approve a booking
// exports.approveBooking = async (req, res) => {
//   try {
//     const { id: bookingId } = req.params;
//     const booking = await Booking.findByIdAndUpdate(
//       bookingId,
//       { status: 'approved', seenByadmin: true },
//       { new: true }
//     );

//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }

//     const notification = new Notification({
//       userId: booking.userId,
//       message: 'Your booking has been approved.',
//       itemId: booking.item,
//       type:'bookingfiles'

//     });
//     await notification.save();

//     const user = await User.findById(booking.userId);
//     await sendFirebaseNotification(user, 'Booking Approved', `Your booking for ${booking.item.name} has been approved.`);

//     res.status(200).json({ message: 'Booking approved successfully', booking });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Reject a booking
// exports.rejectBooking = async (req, res) => {
//   try {
//     const { id: bookingId } = req.params;
//     const booking = await Booking.findByIdAndUpdate(
//       bookingId,
//       { status: 'rejected', seenByadmin: true },
//       { new: true }
//     );

//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }

//     const notification = new Notification({
//       userId: booking.userId,
//       message: 'Your booking has been rejected.',
//       itemId: booking.item,
//       type:'bookingfiles'

//     });
//     await notification.save();

//     const user = await User.findById(booking.userId);
//     await sendFirebaseNotification(user, 'Booking Rejected', `Your booking for ${booking.item.name} has been rejected.`);

//     res.status(200).json({ message: 'Booking rejected successfully', booking });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Get booking history for a user
// exports.getbookinghistory = async (req, res) => {
//   try {
//     const { userid: userId } = req.params;

//     const features = new APIFeatures(Booking.find({ userId }).populate('item'), req.query)
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();
//     const booking = await features.query.lean();

//     if (!booking.length) {
//       return res.status(404).json({ message: 'No bookings found' });
//     }

//     res.status(200).json({ message: 'Booking history', booking });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };









































////////////////////////////////////////with sesions////////////////////////////////









const Booking = require('../../models/bookenigfile');
const User = require('../../models/User');
const Notification = require('../../models/notification');
const Subcategory = require('../../models/subcategory');

const mongoose = require('mongoose');
const factory = require('../../utils/apiFactory');
const AppError = require('../../utils/appError');
const admin = require('../../firebase/firebaseAdmin'); // Firebase Admin SDK
const APIFeatures = require('../../utils/apiFeatures');
const AdminNotification = require('../../models/adminNotificationModel'); 
// Helper function to send Firebase notifications
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

exports.bookFile = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { userId, itemId, billingmethod } = req.body;
    const amount = req.item.fileprice;

    // Check for duplicate booking
    const existingBooking = await Booking.findOne({ userId, item: itemId ,billingmethod});
    if (existingBooking) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('طلب شراء الكراسة موجود بالفعل', 400));
    }

    const newBooking = new Booking({
      userId,
      item: itemId,
      amount,
      billingmethod,
      billImage: req.body.billImage,
      seenByadmin: billingmethod === 'wallet',
      status: billingmethod === 'wallet' ? 'approved' : 'pending',
    });

    const user = await User.findById(userId).session(session);
    const subcategory = await Subcategory.findById(itemId).session(session);


    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('المستخدم غير موجود', 404));
    }

    if (billingmethod === 'wallet') {
      if (user.walletBalance < amount) {
        await session.abortTransaction();
        session.endSession();
        return next(new AppError('المبلغ الموجود فى المحفظة غير كافي لشراء كراسة الشروط', 400));
      }

      user.walletBalance -= amount;
      user.walletTransactions.push({ amount, type: 'withdrawal', description: ` كراسة الشروط لمزاد ${subcategory.name}` });
      await user.save({ session, validateBeforeSave: false });
    }

    await newBooking.save({ session });

    const notificationMessage = billingmethod === 'wallet'
      ? `تم شراء كراسة الشروط ${req.item.name}.`
      : `تم ارسال طلب شراء كراسة شروط مزاد ${req.item.name}`;

    const notification = new Notification({
      userId,
      message: notificationMessage,
      itemId,
      type: 'bookingfiles',
    });

    await sendFirebaseNotification(user, 'طلب كراسة الشروط', notificationMessage);
    await notification.save({ session });
    const adminNotificationMessage = billingmethod === 'wallet'
      ? `New booking approved for ${req.item.name} by user ${user.phoneNumber}.`
      : `New booking for ${req.item.name} requires approval.`;

    const adminNotification = new AdminNotification({
      userId,
      title: 'New Booking Notification',
      message: adminNotificationMessage,
    });

    await adminNotification.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: 'طلب شراء كراسة الشروط تم الارسال بنجاح', booking: newBooking });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(new AppError(error.message, 500));
  }
};

// Get all bookings
exports.getAllBookings = factory.getAll(Booking);

// Approve a booking
exports.approveBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id: bookingId } = req.params;
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'approved', seenByadmin: true },
      { new: true, session }
    );

    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Booking not found' });
    }
    const populatedBooking = await Booking.findById(bookingId).populate('item');
    
    const notification = new Notification({
      userId: booking.userId,
      message: 'تم تاكيد شراء كراسة الشروط يمكنك الاطلاع والمعاينة لان',
      itemId: populatedBooking.item,
      type: 'bookingfiles',
    });
    await notification.save({ session });

    const user = await User.findById(booking.userId).session(session);
    await sendFirebaseNotification(user, `تم تاكيد شراء كراسة الشروط`, `تم تاكيد شراء كراسة الشروط يمكنك الاطلاع والمعاينة الأن ${populatedBooking.item.name} `);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: 'تم الموافقة على طلب شراء كراسة الشروط ', booking });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message });
  }
};

// Reject a booking
exports.rejectBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id: bookingId } = req.params;
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'rejected', seenByadmin: true },
      { new: true, session }
    );

    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'طلب كراسة الشروط غير موجود' });
    }

    const notification = new Notification({
      userId: booking.userId,
      message: 'تم رفض طلب دفع كراسة الشروط لوجود خطاء بالبيانات برجاء اعادة المحاولة',
      itemId: booking.item,
      type: 'bookingfiles',
    });
    await notification.save({ session });

    const user = await User.findById(booking.userId).session(session);
    await sendFirebaseNotification(user, "كراسة الشروط", `تم رفض طلب شراء كراشة الشروط لوجود خطأ بالبيانات برجاء اعادة المحاولة`);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: 'تم رفض دفع كراسة الشروط بنجاح', booking });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message });
  }
};

// Get booking history for a user
exports.getbookinghistory = async (req, res) => {
  try {
    const { userid: userId } = req.params;

    const features = new APIFeatures(Booking.find({ userId }).populate('item'), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const booking = await features.query.lean();

    if (!booking.length) {
      return res.status(404).json({ message: 'لا يوجد مدفوعات' });
    }

    res.status(200).json({ message: 'Booking history', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
