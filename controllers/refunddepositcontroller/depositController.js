const { default: mongoose } = require('mongoose');
const Deposit = require('../../models/Deposit'); // Adjust the path as needed
const User = require('../../models/User'); // Adjust the path as needed
const Subcategory = require('../../models/subcategory');
const admin = require('../../firebase/firebaseAdmin'); // Firebase Admin SDK
 // Adjust the path as needed
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
// Get all users who paid a deposit for a subcategory

const getUsersBySubcategory = async (req, res) => {
    const { subcategoryId } = req.params;
    console.log(subcategoryId);
  
    try {
      // Filter deposits by subcategory and status 'approved'
      const deposits = await Deposit.find({
        item: new mongoose.Types.ObjectId(subcategoryId), // Ensure subcategoryId is a valid ObjectId
        status: 'approved', // Add the status filter here
      }).populate('userId', 'name phoneNumber');
  
      console.log(deposits);
  
    //   if (!deposits.length) {
    //     return res.status(404).json({ message: 'No users found with approved deposits for this subcategory.' });
    //   }
  
      
  
      res.status(200).json({ deposits });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error });
    }
  };

// const refundDeposit = async (req, res) => {
//     const { subcategoryId, userId } = req.params; // Subcategory and user ID (userId is optional if refunding all)
//     const refundAll = !userId; // Determine if refunding all users or a specific user
  
//     try {
//       let query = { item: subcategoryId, status: 'approved' }; // Only approved deposits should be refunded
//       if (userId) {
//         query.userId = userId;
//       }
  
//       // Find all deposits matching the query (either all users or a specific user)
//       const deposits = await Deposit.find(query).populate('userId', 'name phoneNumber walletTransactions walletBalance').exec();

//       if (!deposits.length) {
//         return res.status(404).json({ message: 'No deposits found to refund.' });
//       }
  
//       // Process refund for each deposit
//       const subcategory = await Subcategory.findById(subcategoryId).session(session);
//       for (const deposit of deposits) {
//         deposit.status = 'refunded not join'; // Update the deposit status to "refunded not join"
//         await deposit.save();
  
//         // Update the user's wallet balance
//         deposit.userId.walletBalance += deposit.amount;
  
//         // Add a record of the refund in the user's wallet transactions
//         deposit.userId.walletTransactions.push({
//           amount: deposit.amount,
//           type: 'refund',
//           description: ` تم رد تأمين مزاد ${subcategory?.name} بمبلغ ${deposit.amount} الى المحفظة`, // Log a descriptive transaction message
//           timestamp: new Date(), // Store the time of refund
//         });
  
//         // Save the updated user information with the new wallet balance and transaction log
//         await deposit.userId.save();
  
//         // Send a notification to the user about the refund
//         await sendFirebaseNotification(deposit.userId, 'استرداد التأمين ', ` تم رد تأمين مزاد ${subcategory?.name} بمبلغ ${deposit.amount} الى المحفظة`);
//       }
  
//       // Send success response back to admin
//       res.status(200).json({ message: `Successfully refunded ${refundAll ? 'all users' : 'the user'}.` });
//     } catch (error) {
//       console.log(error);
//       // Handle any errors that occur during the process
//       res.status(500).json({ message: 'Error processing refund', error });
//     }
//   };
  
  
const refundDeposit = async (req, res) => {
  const { subcategoryId, userId } = req.params; // Subcategory and user ID (userId is optional if refunding all)
  const refundAll = !userId; // Determine if refunding all users or a specific user

  const session = await mongoose.startSession(); // Initialize the session

  try {
    session.startTransaction(); // Start a transaction

    let query = { item: subcategoryId, status: 'approved' }; // Only approved deposits should be refunded
    if (userId) {
      query.userId = userId;
    }

    // Find all deposits matching the query (either all users or a specific user)
    const deposits = await Deposit.find(query).populate('userId', 'name phoneNumber walletTransactions walletBalance').session(session).exec();

    if (!deposits.length) {
      return res.status(404).json({ message: 'No deposits found to refund.' });
    }

    // Process refund for each deposit
    const subcategory = await Subcategory.findById(subcategoryId).session(session);
    for (const deposit of deposits) {
      deposit.status = 'refunded not join'; // Update the deposit status to "refunded not join"
      await deposit.save({ session });

      // Update the user's wallet balance
      deposit.userId.walletBalance += deposit.amount;

      // Add a record of the refund in the user's wallet transactions
      deposit.userId.walletTransactions.push({
        amount: deposit.amount,
        type: 'refund',
        description: ` تم رد تأمين مزاد ${subcategory?.name} بمبلغ ${deposit.amount} الى المحفظة`, // Log a descriptive transaction message
        timestamp: new Date(), // Store the time of refund
      });

      // Save the updated user information with the new wallet balance and transaction log
      await deposit.userId.save({ session });

      // Send a notification to the user about the refund
      await sendFirebaseNotification(deposit.userId, 'استرداد التأمين ', ` تم رد تأمين مزاد ${subcategory?.name} بمبلغ ${deposit.amount} الى المحفظة`);
    }

    // Commit the transaction if all operations succeed
    await session.commitTransaction();
    session.endSession();

    // Send success response back to admin
    res.status(200).json({ message: `Successfully refunded ${refundAll ? 'all users' : 'the user'}.` });
  } catch (error) {
    // Rollback the transaction in case of an error
    await session.abortTransaction();
    session.endSession();

    console.log(error);
    // Handle any errors that occur during the process
    res.status(500).json({ message: 'Error processing refund', error });
  }
};

  
  
module.exports = { getUsersBySubcategory,refundDeposit };
