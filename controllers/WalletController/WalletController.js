const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const mongoose = require('mongoose');
const admin = require('../../firebase/firebaseAdmin'); 
const Notification = require('../../models/notification');
const factory = require('../../utils/apiFactory');
exports.getAllRefund=factory.getAll(Transaction)
// Firebase Admin SDK
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
exports.getAllTransactions = async (req, res) => {
    try {
      const transactions = await Transaction.find().populate('userId', 'name phoneNumber walletBalance walletTransactions').populate('adminId', 'username');
      res.status(200).json({ message: 'Transactions fetched successfully', transactions });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
  
  exports.updateTransaction = async (req, res) => {
    const { id, amount, description } = req.body;
  
    try {
      const transaction = await Transaction.findByIdAndUpdate(id, { amount, description }, { new: true });
      res.status(200).json({ message: 'Transaction updated successfully', transaction });
    } catch (error) {
      res.status(400).json({ message: 'Error updating transaction', error });
    }
  };
exports.withdrawFromWallet = async (req, res) => {
  const { userId, amount, adminId } = req.body;
//   const adminId = req.admin._id;
// const adminId = '668e669e2df2923c9d5f27e7';
 


  if (!userId || !amount) {
    return res.status(400).json({ message: 'User ID and amount are required' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.walletBalance < amount) {
      throw new Error('Insufficient balance');
    }

    user.walletBalance -= amount;
    user.walletTransactions.push({
      amount: -amount,
      type: 'withdrawal',
      description: 'سحب رصيد من المحفظة',
      timestamp: new Date()
    });
    await user.save({ session });

    const transaction = new Transaction({
      userId: user._id,
      amount,
      type: 'withdrawal',
      description: 'Admin withdrawal',
      adminId
    });
    const title = "طلب استرداد";
    const body = ` تم سحب مبلغ  ${amount}من المحفظة وارساله اليكم بناء على الطلب المقدم والمتبقي فى المحفظة  ${user.walletBalance}.`;
    await sendFirebaseNotification(user, title, body);
    await transaction.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: 'Withdrawal successful', user, transaction });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

exports.addToWallet = async (req, res) => {
  const { userId, amount,adminId,subcategory } = req.body;
  // const adminId = req.admin._id;
  // const adminId = '668e669e2df2923c9d5f27e7';


  if (!userId || !amount) {
    return res.status(400).json({ message: 'User ID and amount are required' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);

    if (!user) {
      throw new Error('User not found');
    }

    user.walletBalance +=parseInt(amount);
    user.walletTransactions.push({
      amount,
      type: 'deposit',
      description: 'تم شحن رصيد الى المحفظة',
      timestamp: new Date()
    });
    await user.save({ session });

    const transaction = new Transaction({
      userId: user._id,
      subcategory,
      amount,
      type: 'deposit',
      description: 'Admin deposit',
      adminId
    });

    const notification = new Notification({
      userId: user._id,
      message: 'تم استرداد الرصيد المتبقي من التامين',
      itemId: null,
      type: 'admin deposit ',
    });
    await transaction.save({ session });
    await session.commitTransaction();
    await sendFirebaseNotification(user, 'تم استرداد الرصيد المتبقي من التامين', `لقد تم استرداد التامين الخاصة بك.`);

    session.endSession();

    res.status(200).json({ message: 'Deposit successful', user, transaction });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  const { id } = req.body;
  // const adminId = req.admin._id;
  const adminId = '668e669e2df2923c9d5f27e7';

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = await Transaction.findById(id).session(session);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const user = await User.findById(transaction.userId).session(session);

    if (!user) {
      throw new Error('User not found');
    }

    if (transaction.type === 'deposit') {
      user.walletBalance -= transaction.amount;
    } else if (transaction.type === 'withdrawal') {
      user.walletBalance += transaction.amount;
    }

    user.walletTransactions = user.walletTransactions.filter(
      trans => trans._id.toString() !== id
    );

    await user.save({ session });
    await transaction.remove({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: 'Transaction deleted and balance reverted', user });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};















// const User = require('../../models/User');
// const Transaction = require('../../models/Transaction');
// const mongoose = require('mongoose');
// exports.getAllTransactions = async (req, res) => {
//     try {
//       const transactions = await Transaction.find().populate('userId', 'name phoneNumber walletBalance walletTransactions').populate('adminId', 'username');
//       res.status(200).json({ message: 'Transactions fetched successfully', transactions });
//     } catch (error) {
//       res.status(500).json({ message: 'Server error', error:error.message });
//     }
//   };
  
//   exports.updateTransaction = async (req, res) => {
//     const { id, amount, description } = req.body;
  
//     try {
//       const transaction = await Transaction.findByIdAndUpdate(id, { amount, description }, { new: true });
//       res.status(200).json({ message: 'Transaction updated successfully', transaction });
//     } catch (error) {
//       res.status(400).json({ message: 'Error updating transaction', error });
//     }
//   };
// exports.withdrawFromWallet = async (req, res) => {
//   const { userId, amount,adminId } = req.body;
// //   const adminId = req.admin._id;
//   // const adminId = '668a4c6d7404b24fc8465be6';


//   if (!userId || !amount) {
//     return res.status(400).json({ message: 'User ID and amount are required' });
//   }

  

//   try {
//     const user = await User.findById(userId).select('name phoneNumber walletBalance walletTransactions');

//     if (!user) {
//       throw new Error('User not found');
//     }

//     if (user.walletBalance < amount) {
//       throw new Error('Insufficient balance');
//     }

//     user.walletBalance -= amount;
//     user.walletTransactions.push({
//       amount: -amount,
//       type: 'withdrawal',
//       description: 'Admin withdrawal',
//       timestamp: new Date()
//     });
//     await user.save({ validateBeforeSave: false });

//     const transaction = new Transaction({
//       userId: user._id,
//       amount,
//       type: 'withdrawal',
//       description: 'Admin withdrawal',
//       adminId
//     });

//     await transaction.save();


//     res.status(200).json({ message: 'Withdrawal successful', user, transaction });
//   } catch (error) {


//     res.status(400).json({ message: error.message });
//   }
// };

// exports.addToWallet = async (req, res) => {
//   const { userId, amount,adminId} = req.body;
// //   const adminId = req.admin._id;
//   // const adminId = '668a4c6d7404b24fc8465be6';

//   if (!userId || !amount) {
//     return res.status(400).json({ message: 'User ID and amount are required' });
//   }


//   try {
//     const user = await User.findById(userId).select('name phoneNumber walletBalance walletTransactions');

//     if (!user) {
//       throw new Error('User not found');
//     }

//     user.walletBalance += parseInt(amount);
//     user.walletTransactions.push({
//       amount,
//       type: 'deposit',
//       description: 'Admin deposit',
//       timestamp: new Date()
//     });
//     await user.save({validateBeforeSave: false });

//     const transaction = new Transaction({
//       userId: user._id,
//       amount,
//       type: 'deposit',
//       description: 'Admin deposit',
//       adminId
//     });

//     await transaction.save();

//     res.status(200).json({ message: 'Deposit successful', user, transaction });
//   } catch (error) {
  
//     res.status(400).json({ message: error.message });
//   }
// };

// exports.deleteTransaction = async (req, res) => {
//   const { id } = req.body;
// //   const adminId = req.admin._id;

// //   const session = await mongoose.startSession();
// //   session.startTransaction();

//   try {
//     const transaction = await Transaction.findById(id);

//     if (!transaction) {
//       throw new Error('Transaction not found');
//     }

//     const user = await User.findById(transaction.userId);

//     if (!user) {
//       throw new Error('User not found');
//     }

//     if (transaction.type === 'deposit') {
//       user.walletBalance -= transaction.amount;
//     } else if (transaction.type === 'withdrawal') {
//       user.walletBalance += transaction.amount;
//     }

//     user.walletTransactions = user.walletTransactions.filter(
//       trans => trans._id.toString() !== id
//     );

//     await user.save({  validateBeforeSave: false });
//     await transaction.deleteOne({_id: id});
 

//     res.status(200).json({ message: 'Transaction deleted and balance reverted', user });
//   } catch (error) {

//     res.status(400).json({ message: error.message });
//   }
// };






