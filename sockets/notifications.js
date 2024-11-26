









const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Subcategory = require('../models/subcategory');
const Item = require('../models/item');
const Bid = require('../models/Bid');
const Deposit = require('../models/Deposit');
const Notification = require('../models/notification');
const Winner = require('../models/Winner');
const authenticateSocket = async (socket, next) => {
  // const token = socket.handshake.auth.token;
  const token = socket.handshake.auth;
  console.log(token)

  // if (!token) {
  //   return next(new Error('Authentication error'));
  // }

  try {
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // const user = await User.findById(decoded.id);
    // if (!user || user.blocked || !user.verified) {
    //   return next(new Error('Authentication error'));
    // }
    // socket.userId = user._id;
  socket.userId = token.userId;

    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
};

const createNotificationNamespace = (io) => {
  const notificationNamespace = io.of('/notifications');

  notificationNamespace.use(authenticateSocket);

  notificationNamespace.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected to notifications namespace`);

    // Join user-specific room for notifications
    socket.join(`user_${socket.userId}`);

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected from notifications namespace`);
    });
  });

  return notificationNamespace;
};






































































const SubcategoryResult = require('../models/SubcategoryResult');


// const { startSession } = require('mongoose');


// const notifyAuctionEvents = async (notificationNamespace) => {
//   const now = new Date();

//   const session = await startSession();
//   session.startTransaction();

//   try {
//     // Step 1: Check for auctions that are starting
//     const startingSubcategories = await Subcategory.find({ startDate: { $lte: now }, notifiedStart: { $ne: true } });

//     for (const subcategory of startingSubcategories) {
//       const deposits = await Deposit.find({ item: subcategory._id });

//       // Send notification to each user with an approved deposit
//       const startNotifications = deposits.map(deposit => {
//         const notification = new Notification({
//           userId: deposit.userId,
//           message: `The auction for subcategory ${subcategory.name} has started.`,
//           itemId: subcategory._id,
//         });
//         return notification.save();
//       });
//       await Promise.all(startNotifications);

//       // Mark the subcategory as notified for the start
//       subcategory.notifiedStart = true;
//       await subcategory.save({ session });

//       // Emit real-time notification to each user
//       deposits.forEach(deposit => {
//         notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
//           message: `The auction for subcategory ${subcategory.name} has started and will end at ${subcategory.endDate.toLocaleTimeString()}.`,
//           subcategory: subcategory,
//         });
//       });
//     }

//     // Step 2: Check for auctions that are ending
//     const endingSubcategories = await Subcategory.find({ endDate: { $lte: now }, notifiedEnd: { $ne: true } });

//     for (const subcategory of endingSubcategories) {
//       const items = await Item.find({ subcategoryId: subcategory._id });
//       const deposits = await Deposit.find({ item: subcategory._id, status: 'approved' });

//       for (const item of items) {
//         // Find the highest bid for the item to determine the winner
//         const bids = await Bid.find({ item: item._id }).sort({ amount: -1 }).session(session);
//         const winnerBid = bids[0];

//         if (winnerBid) {
//           const userId = winnerBid.userId;
//           const depositAmount = deposits.find(deposit => deposit.userId.equals(userId))?.amount || 0;

//           // Calculate commission based on start price
//           const commission1 = item.startPrice * (item.commission1 / 100);
//           const commission2 = item.startPrice * (item.commission2 / 100);
//           const commission3 = item.startPrice * (item.commission3 / 100);
//           const totalAfterCommission = parseInt(item.startPrice) + commission1 + commission2 + commission3;
//           const winnerAmount = totalAfterCommission - depositAmount;

//           if (isNaN(winnerAmount)) {
//             console.error(`winnerAmount is NaN for item ${item._id}, user ${userId}`);
//             continue; // Skip this item if winnerAmount is NaN
//           }

//           if (!item.notifiedWinner) {
//             // Notify the winner
//             const winnerNotification = new Notification({
//               userId: winnerBid.userId,
//               message: `Congratulations! You have won the auction for item ${item.name} in subcategory ${subcategory.name} with a bid of ${winnerBid.amount}.`,
//               itemId: item._id,
//             });
//             await winnerNotification.save({ session });

//             // Emit real-time notification to the winner
//             notificationNamespace.to(`user_${winnerBid.userId}`).emit('notification', {
//               message: `Congratulations! You have won the auction for item ${item.name} in subcategory ${subcategory.name} with a bid of ${winnerBid.amount}.`,
//             });

//             // Save the winner details
//             const winnerEntry = new Winner({
//               userId: winnerBid.userId,
//               subcategory: item.subcategoryId,
//               itemId: item._id,
//               amount: winnerAmount,
//               status: 'winner',
//             });
//             await winnerEntry.save({ session });

//             // Update the winner's deposit status to 'winner'
//             const winnerDeposit = deposits.find(deposit => deposit.userId.equals(winnerBid.userId));
//             if (winnerDeposit) {
//               winnerDeposit.status = 'winner';
//               await winnerDeposit.save({ validateBeforeSave: false, session });
//             }

//             // Mark the item as notified for the winner
//             item.notifiedWinner = true;
//             item.status = 'completed';
//             await item.save({ session });
//           }
//         }

//         // Process all deposits to ensure losers are recorded
//         for (const deposit of deposits) {
//           const user = await User.findById(deposit.userId).session(session);
//           if (!winnerBid || !winnerBid.userId.equals(deposit.userId)) {
//             user.walletBalance += parseInt(deposit.amount);
//             user.walletTransactions.push({
//               amount: deposit.amount,
//               type: 'refund',
//               description: `Refund for item ${item.name} in subcategory ${subcategory.name}`,
//             });

//             console.log(`User ${user._id} wallet balance updated. New balance: ${user.walletBalance}`);
//             await user.save({ session, validateBeforeSave: false });

//             // Emit real-time notification about the refund
//             notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
//               message: `The auction for item ${item.name} in subcategory ${subcategory.name} has ended. Your deposit has been refunded.`,
//             });

//             const loserEntry = new Winner({
//               userId: deposit.userId,
//               subcategory: item.subcategoryId,
//               itemId: item._id,
//               amount: deposit.amount,
//               status: 'loser',
//             });
//             await loserEntry.save({ session });

//             item.notifiedLosers = true;
//             await item.save({ session });
//           }
//         }
//       }

//       // Mark the subcategory as notified for the end
//       subcategory.notifiedEnd = true;
//       await subcategory.save({ session });

//       // Emit real-time notification to all users about the auction end
//       deposits.forEach(deposit => {
//         notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
//           message: `The auction for subcategory ${subcategory.name} has ended.`,
//         });
//       });
//     }

//     await session.commitTransaction();
//     session.endSession();
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error('Transaction aborted due to error:', error);
//   }

//   // After processing the auctions, aggregate the results
//   // await aggregateSubcategoryResults();
// };

// const aggregateSubcategoryResults = async () => {
//   try {
//     // Aggregate winners and losers by user and subcategory
//     const results = await Winner.aggregate([
//       {
//         $group: {
//           _id: { userId: "$userId", subcategory: "$subcategory", status: "$status" },
//           winnerIds: { $push: "$_id" },
//           totalAmount: { $sum: { $cond: { if: { $eq: ["$status", "winner"] }, then: "$amount", else: 0 } } },
//         }
//       },
//       {
//         $group: {
//           _id: { userId: "$_id.userId", subcategory: "$_id.subcategory" },
//           results: {
//             $push: {
//               status: "$_id.status",
//               winnerIds: "$winnerIds",
//               totalAmount: "$totalAmount"
//             }
//           }
//         }
//       },
//       {
//         $project: {
//           userId: "$_id.userId",
//           subcategory: "$_id.subcategory",
//           results: 1
//         }
//       }
//     ]);

//     // Save the aggregated results to the SubcategoryResult collection
//     for (const result of results) {
//       for (const res of result.results) {
//         const subcategoryResult = new SubcategoryResult({
//           userId: result.userId,
//           subcategory: result.subcategory,
//           totalAmount: res.status === 'winner' ? res.totalAmount : null,
//           status: res.status,
//           results: res.winnerIds,
//         });
//         await subcategoryResult.save();
//       }
//     }

//     console.log('Subcategory results aggregation completed.');
//   } catch (error) {
//     console.error('Error aggregating subcategory results:', error);
//   }
// };

// const setupNotificationInterval = (notificationNamespace) => {
//   // setInterval(() => notifyAuctionEvents(notificationNamespace), 10 * 1000);
// };

// module.exports = {
//   createNotificationNamespace,
//   setupNotificationInterval,
//   notifyAuctionEvents
// };



// const { startSession } = require('mongoose');

// const SubcategoryResult = require('../models/SubcategoryResult');

// const notifyAuctionEvents = async (notificationNamespace) => {
//   const now = new Date();
//   const session = await startSession();
//   session.startTransaction();

//   try {
//     await processStartingSubcategories(now, notificationNamespace, session);
//     await processEndingSubcategories(now, notificationNamespace, session);
    
//     await session.commitTransaction();
//     session.endSession();
//     await aggregateSubcategoryResults();
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error('Transaction aborted due to error:', error);
//   }

// };

// const processStartingSubcategories = async (now, notificationNamespace, session) => {
//   const startingSubcategories = await Subcategory.find({ startDate: { $lte: now }, notifiedStart: { $ne: true } });

//   for (const subcategory of startingSubcategories) {
//     const deposits = await Deposit.find({ item: subcategory._id });

//     const startNotifications = deposits.map(deposit => {
//       const notification = new Notification({
//         userId: deposit.userId,
//         message: `The auction for subcategory ${subcategory.name} has started.`,
//         itemId: subcategory._id,
//       });
//       return notification.save();
//     });

//     await Promise.all(startNotifications);

//     subcategory.notifiedStart = true;
//     await subcategory.save({ session });

//     deposits.forEach(deposit => {
//       notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
//         message: `The auction for subcategory ${subcategory.name} has started and will end at ${subcategory.endDate.toLocaleTimeString()}.`,
//         subcategory: subcategory,
//       });
//     });
//   }
// };

// const processEndingSubcategories = async (now, notificationNamespace, session) => {
//   const endingSubcategories = await Subcategory.find({ endDate: { $lte: now }, notifiedEnd: { $ne: true } });

//   for (const subcategory of endingSubcategories) {
//     const items = await Item.find({ subcategoryId: subcategory._id });

//     for (const item of items) {
//       const bids = await Bid.find({ item: item._id }).sort({ amount: -1 }).session(session);
//       const winnerBid = bids[0];

//       if (winnerBid) {
//         await handleWinner(item, winnerBid, subcategory, notificationNamespace, session);
//       }

//       await handleLosers(item, winnerBid, subcategory, notificationNamespace, session);
//     }

//     subcategory.notifiedEnd = true;
//     await subcategory.save({ session });

//     const deposits = await Deposit.find({ item: subcategory._id, status: 'approved' });
//     deposits.forEach(deposit => {
//       notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
//         message: `The auction for subcategory ${subcategory.name} has ended.`,
//       });
//     });
//   }
// };

// const handleWinner = async (item, winnerBid, subcategory, notificationNamespace, session) => {
//   const deposits = await Deposit.find({ item: subcategory._id, status: 'approved' });
//   const depositAmount = deposits.find(deposit => deposit.userId.equals(winnerBid.userId))?.amount || 0;

//   const commission1 = item.startPrice * (item.commission1 / 100);
//   const commission2 = item.startPrice * (item.commission2 / 100);
//   const commission3 = item.startPrice * (item.commission3 / 100);
//   const totalAfterCommission = parseInt(item.startPrice) + commission1 + commission2 + commission3;
//   const winnerAmount = totalAfterCommission - depositAmount;

//   if (isNaN(winnerAmount)) {
//     console.error(`winnerAmount is NaN for item ${item._id}, user ${winnerBid.userId}`);
//     return;
//   }

//   if (!item.notifiedWinner) {
//     const winnerNotification = new Notification({
//       userId: winnerBid.userId,
//       message: `Congratulations! You have won the auction for item ${item.name} in subcategory ${subcategory.name} with a bid of ${winnerBid.amount}.`,
//       itemId: item._id,
//     });
//     await winnerNotification.save({ session });

//     notificationNamespace.to(`user_${winnerBid.userId}`).emit('notification', {
//       message: `Congratulations! You have won the auction for item ${item.name} in subcategory ${subcategory.name} with a bid of ${winnerBid.amount}.`,
//     });

//     const winnerEntry = new Winner({
//       userId: winnerBid.userId,
//       subcategory: item.subcategoryId,
//       itemId: item._id,
//       amount: winnerAmount,
//       status: 'winner',
//     });
//     await winnerEntry.save({ session });

//     const winnerDeposit = deposits.find(deposit => deposit.userId.equals(winnerBid.userId));
//     if (winnerDeposit) {
//       winnerDeposit.status = 'winner';
//       await winnerDeposit.save({ validateBeforeSave: false, session });
//     }

//     item.notifiedWinner = true;
//     item.status = 'completed';
//     await item.save({ session });
//   }
// };

// const handleLosers = async (item, winnerBid, subcategory, notificationNamespace, session) => {
//   const results = await Bid.aggregate([
//     {
//       $match: { 
//         item: item._id, 
//         userId: { $ne: winnerBid.userId } // Ensure the winnerBid is excluded in the aggregation
//       }
//     },
//     {
//       $group: {
//         _id: { userId: "$userId", item: "$item" },
//         totalAmount: { $sum: "$amount" },
//       }
//     },
//     {
//       $sort: { totalAmount: -1 }
//     },
//     {
//       $project: {
//         totalAmount: 1
//       }
//     }
//   ]);

//   for (const result of results) {
//     const deposit = await Deposit.findOne({ userId: result._id.userId, item: item._id, status: 'approved' }).session(session);
//     const loserEntry = new Winner({
//       userId: result._id.userId,
//       subcategory: item.subcategoryId,
//       itemId: item._id,
//       amount: result.totalAmount,
//       status: 'loser',
//     });
//     await loserEntry.save({ session });
//     if (deposit) {
//       const user = await User.findById(result._id.userId).session(session);

//       user.walletBalance += parseInt(deposit.amount);
//       user.walletTransactions.push({
//         amount: deposit.amount,
//         type: 'refund',
//         description: `Refund for item ${item.name} in subcategory ${subcategory.name}`,
//       });
// //  Update deposit status to 'refunded'
// deposit.status = 'refunded';
//  await deposit.save({ validateBeforeSave: false });
//       await user.save({ session, validateBeforeSave: false });

//       notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
//         message: `The auction for item ${item.name} in subcategory ${subcategory.name} has ended. Your deposit has been refunded.`,
//       });


//     }
//   }

//   item.notifiedLosers = true;
//   await item.save({ session });
// };
// const aggregateSubcategoryResults = async () => {
//   try {
//     // Find all unprocessed results
//     const results = await Winner.aggregate([
//       { $match: { processed: false } }, // Only include unprocessed results
//       {
//         $group: {
//           _id: { userId: "$userId", subcategory: "$subcategory", status: "$status" },
//           winnerIds: { $push: "$_id" },
//           totalAmount: { $sum: { $cond: { if: { $eq: ["$status", "winner"] }, then: "$amount", else: 0 } } },
//         }
//       },
//       {
//         $group: {
//           _id: { userId: "$_id.userId", subcategory: "$_id.subcategory" },
//           results: {
//             $push: {
//               status: "$_id.status",
//               winnerIds: "$winnerIds",
//               totalAmount: "$totalAmount"
//             }
//           }
//         }
//       },
//       {
//         $project: {
//           userId: "$_id.userId",
//           subcategory: "$_id.subcategory",
//           results: 1
//         }
//       }
//     ]);

//     for (const result of results) {
//       for (const res of result.results) {
//         const subcategoryResult = new SubcategoryResult({
//           userId: result.userId,
//           subcategory: result.subcategory,
//           totalAmount: res.status === 'winner' ? res.totalAmount : null,
//           status: res.status,
//           results: res.winnerIds,
//         });
//         await subcategoryResult.save();

//         // Mark processed winners as processed
//         await Winner.updateMany(
//           { _id: { $in: res.winnerIds } },
//           { $set: { processed: true } }
//         );
//       }
//     }

//     console.log('Subcategory results aggregation completed.');
//   } catch (error) {
//     console.error('Error aggregating subcategory results:', error);
//   }
// };


// const setupNotificationInterval = (notificationNamespace) => {
//   setInterval(() => notifyAuctionEvents(notificationNamespace), 10 * 1000);
// };

// module.exports = {
//   createNotificationNamespace,
//   setupNotificationInterval,
//   notifyAuctionEvents
// };






// const { startSession } = require('mongoose');
// const admin = require('../firebase/firebaseAdmin'); 
//  // Assuming you have a User model

// const notifyAuctionEvents = async (notificationNamespace) => {
//   const now = new Date();
//   const session = await startSession();
//   session.startTransaction();

//   try {
//     await processStartingSubcategories(now, notificationNamespace, session);
//     await processEndingSubcategories(now, notificationNamespace, session);
    
//     await session.commitTransaction();
//     session.endSession();
//     await aggregateSubcategoryResults();
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error('Transaction aborted due to error:', error);
//   }
// };

// const processStartingSubcategories = async (now, notificationNamespace, session) => {
//   const startingSubcategories = await Subcategory.find({ startDate: { $lte: now }, notifiedStart: { $ne: true } });

//   for (const subcategory of startingSubcategories) {
//     const deposits = await Deposit.find({ item: subcategory._id });

//     const startNotifications = deposits.map(async (deposit) => {
//       const notification = new Notification({
//         userId: deposit.userId,
//         message: `The auction for subcategory ${subcategory.name} has started.`,
//         itemId: subcategory._id,
//       });
//       await notification.save();
// console.log("object")
//       // Send Socket.IO notification
//       notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
//         message: `The auction for subcategory ${subcategory.name} has started and will end at ${subcategory.endDate.toLocaleTimeString()}.`,
//         subcategory: subcategory,
//       });

//       // Send Firebase notification
//       const user = await User.findById(deposit.userId);
//       console.log(user)
//       if (user && user.fcmToken) {
//         const message = {
//           notification: {
//             title: 'Auction Started',
//             body: `The auction for subcategory ${subcategory.name} has started and will end at ${subcategory.endDate.toLocaleTimeString()}.`,
//           },
//           token: user.fcmToken,
//         };
//         await admin.messaging().send(message);
//       }
//     });

//     await Promise.all(startNotifications);

//     subcategory.notifiedStart = true;
//     await subcategory.save({ session });
//   }
// };

// const processEndingSubcategories = async (now, notificationNamespace, session) => {
//   const endingSubcategories = await Subcategory.find({ endDate: { $lte: now }, notifiedEnd: { $ne: true } });

//   for (const subcategory of endingSubcategories) {
//     const items = await Item.find({ subcategoryId: subcategory._id });

//     for (const item of items) {
//       const bids = await Bid.find({ item: item._id }).sort({ amount: -1 }).session(session);
//       const winnerBid = bids[0];

//       if (winnerBid) {
//         await handleWinner(item, winnerBid, subcategory, notificationNamespace, session);
//       }

//       await handleLosers(item, winnerBid, subcategory, notificationNamespace, session);
//     }

//     subcategory.notifiedEnd = true;
//     await subcategory.save({ session });

//     const deposits = await Deposit.find({ item: subcategory._id, status: 'approved' });
//     deposits.forEach(async (deposit) => {
//       notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
//         message: `The auction for subcategory ${subcategory.name} has ended.`,
//       });

//       // Send Firebase notification
//       const user = await User.findById(deposit.userId);



//       const auctionEnded = new Notification({
//         userId: deposit.userId,
//         message: `The auction for subcategory ${subcategory.name} has ended.`,
     
//         itemId: subcategory._id,
//       });
//       await auctionEnded.save({ session });
//       if (user && user.fcmToken) {
//         const message = {
//           notification: {
//             title: 'Auction Ended',
//             body: `The auction for subcategory ${subcategory.name} has ended.`,
//           },
//           token: user.fcmToken,
//         };
//         await admin.messaging().send(message);
//       }
//     });
//   }
// };

// const handleWinner = async (item, winnerBid, subcategory, notificationNamespace, session) => {
//   const deposits = await Deposit.find({ item: subcategory._id, status: 'approved' });
//   const depositAmount = deposits.find(deposit => deposit.userId.equals(winnerBid.userId))?.amount || 0;

//   const commission1 = item.startPrice * (item.commission1 / 100);
//   const commission2 = item.startPrice * (item.commission2 / 100);
//   const commission3 = item.startPrice * (item.commission3 / 100);
//   const totalAfterCommission = parseInt(item.startPrice) + commission1 + commission2 + commission3;
//   const winnerAmount = totalAfterCommission - depositAmount;

//   if (isNaN(winnerAmount)) {
//     console.error(`winnerAmount is NaN for item ${item._id}, user ${winnerBid.userId}`);
//     return;
//   }

//   if (!item.notifiedWinner) {
//     const winnerNotification = new Notification({
//       userId: winnerBid.userId,
//       message: `Congratulations! You have won the auction for item ${item.name} in subcategory ${subcategory.name} with a bid of ${winnerBid.amount}.`,
//       itemId: item._id,
//     });
//     await winnerNotification.save({ session });

//     // Send Socket.IO notification
//     notificationNamespace.to(`user_${winnerBid.userId}`).emit('notification', {
//       message: `Congratulations! You have won the auction for item ${item.name} in subcategory ${subcategory.name} with a bid of ${winnerBid.amount}.`,
//     });

//     // Send Firebase notification
//     const user = await User.findById(winnerBid.userId);
//     if (user && user.fcmToken) {
//       const message = {
//         notification: {
//           title: 'You Won!',
//           body: `You have won the auction for item ${item.name} in subcategory ${subcategory.name} with a bid of ${winnerBid.amount}.`,
//         },
//         token: user.fcmToken,
//       };
//       await admin.messaging().send(message);
//     }

//     const winnerEntry = new Winner({
//       userId: winnerBid.userId,
//       subcategory: item.subcategoryId,
//       itemId: item._id,
//       amount: winnerAmount,
//       status: 'winner',
//     });
//     await winnerEntry.save({ session });

//     const winnerDeposit = deposits.find(deposit => deposit.userId.equals(winnerBid.userId));
//     if (winnerDeposit) {
//       winnerDeposit.status = 'winner';
//       await winnerDeposit.save({ validateBeforeSave: false, session });
//     }

//     item.notifiedWinner = true;
//     item.status = 'completed';
//     await item.save({ session });
//   }
// };

// const handleLosers = async (item, winnerBid, subcategory, notificationNamespace, session) => {
//   const results = await Bid.aggregate([
//     {
//       $match: { 
//         item: item._id, 
//         userId: { $ne: winnerBid.userId } // Ensure the winnerBid is excluded in the aggregation
//       }
//     },
//     {
//       $group: {
//         _id: { userId: "$userId", item: "$item" },
//         totalAmount: { $sum: "$amount" },
//       }
//     },
//     {
//       $sort: { totalAmount: -1 }
//     },
//     {
//       $project: {
//         totalAmount: 1
//       }
//     }
//   ]);

//   for (const result of results) {
//     const deposit = await Deposit.findOne({ userId: result._id.userId, item: item._id, status: 'approved' }).session(session);
//     const loserEntry = new Winner({
//       userId: result._id.userId,
//       subcategory: item.subcategoryId,
//       itemId: item._id,
//       amount: result.totalAmount,
//       status: 'loser',
//     });
//     await loserEntry.save({ session });

//     if (deposit) {
//       const user = await User.findById(result._id.userId).session(session);

//       user.walletBalance += parseInt(deposit.amount);
//       user.walletTransactions.push({
//         amount: deposit.amount,
//         type: 'refund',
//         description: `Refund for item ${item.name} in subcategory ${subcategory.name}`,
//       });

//       // Update deposit status to 'refunded'
//       deposit.status = 'refunded';
//       await deposit.save({ validateBeforeSave: false });
//       await user.save({ session, validateBeforeSave: false });

//       // Send Socket.IO notification
//       notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
//         message: `The auction for item ${item.name} in subcategory ${subcategory.name} has ended. Your deposit has been refunded.`,
//       });


      
//       // Send Firebase notification
//       if (user && user.fcmToken) {
//         const message = {
//           notification: {
//             title: 'Auction Ended',
//             body: `The auction for item ${item.name} in subcategory ${subcategory.name} has ended. Your deposit has been refunded.`,
//           },
//           token: user.fcmToken,
//         };
//         await admin.messaging().send(message);
//       }
//     }
//   }

//   item.notifiedLosers = true;
//   await item.save({ session });
// };

// const aggregateSubcategoryResults = async () => {
//   try {
//     // Find all unprocessed results
//     const results = await Winner.aggregate([
//       { $match: { processed: false } }, // Only include unprocessed results
//       {
//         $group: {
//           _id: { userId: "$userId", subcategory: "$subcategory", status: "$status" },
//           winnerIds: { $push: "$_id" },
//           totalAmount: { $sum: { $cond: { if: { $eq: ["$status", "winner"] }, then: "$amount", else: 0 } } },
//         }
//       },
//       {
//         $group: {
//           _id: { userId: "$_id.userId", subcategory: "$_id.subcategory" },
//           results: {
//             $push: {
//               status: "$_id.status",
//               winnerIds: "$winnerIds",
//               totalAmount: "$totalAmount"
//             }
//           }
//         }
//       },
//       {
//         $project: {
//           userId: "$_id.userId",
//           subcategory: "$_id.subcategory",
//           results: 1
//         }
//       }
//     ]);

//     for (const result of results) {
//       for (const res of result.results) {
//         const subcategoryResult = new SubcategoryResult({
//           userId: result.userId,
//           subcategory: result.subcategory,
//           totalAmount: res.status === 'winner' ? res.totalAmount : null,
//           status: res.status,
//           results: res.winnerIds,
//         });
//         await subcategoryResult.save();

//         // Mark processed winners as processed
//         await Winner.updateMany(
//           { _id: { $in: res.winnerIds } },
//           { $set: { processed: true } }
//         );
//       }
//     }

//     console.log('Subcategory results aggregation completed.');
//   } catch (error) {
//     console.error('Error aggregating subcategory results:', error);
//   }
// };

// const setupNotificationInterval = (notificationNamespace) => {
//   setInterval(() => notifyAuctionEvents(notificationNamespace), 10 * 1000);
// };

// module.exports = {
//   createNotificationNamespace,
//   setupNotificationInterval,
//   notifyAuctionEvents
// };
























































/////////////////////////////without session

// const { startSession } = require('mongoose');
// const admin = require('../firebase/firebaseAdmin'); 
//  // Assuming you have a User model

// const notifyAuctionEvents = async (notificationNamespace) => {
//   const now = new Date();
//   // const session = await startSession();
//   // session.startTransaction();

//   try {
//     await processStartingSubcategories(now, notificationNamespace);
//     await processEndingSubcategories(now, notificationNamespace);
    
//     // await session.commitTransaction();
//     // session.endSession();
//     await aggregateSubcategoryResults();
//   } catch (error) {
//     // await session.abortTransaction();
//     // session.endSession();
//     console.error('Transaction aborted due to error:', error);
//   }
// };

// const processStartingSubcategories = async (now, notificationNamespace) => {
//   const startingSubcategories = await Subcategory.find({ startDate: { $lte: now }, notifiedStart: { $ne: true } });

//   for (const subcategory of startingSubcategories) {
//     const deposits = await Deposit.find({ item: subcategory._id });

//     const startNotifications = deposits.map(async (deposit) => {
//       const notification = new Notification({
//         userId: deposit.userId,
//         message: `The auction for subcategory ${subcategory.name} has started.`,
//         itemId: subcategory._id,
//       });
//       await notification.save();
//        console.log("object")
//       // Send Socket.IO notification
//       notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
//         message: `The auction for subcategory ${subcategory.name} has started and will end at ${subcategory.endDate.toLocaleTimeString()}.`,
//         subcategory: subcategory,
//       });

//       // Send Firebase notification
//       const user = await User.findById(deposit.userId);
//       console.log(user)
//       if (user && user.fcmToken) {
//         const message = {
//           notification: {
//             title: 'Auction Started',
//             body: `The auction for subcategory ${subcategory.name} has started and will end at ${subcategory.endDate.toLocaleTimeString()}.`,
//           },
//           token: user.fcmToken,
//         };
//         await admin.messaging().send(message);
//       }
//     });

//     await Promise.all(startNotifications);

//     subcategory.notifiedStart = true;
//     await subcategory.save();
//   }
// };

// const processEndingSubcategories = async (now, notificationNamespace) => {
//   const endingSubcategories = await Subcategory.find({ endDate: { $lte: now }, notifiedEnd: { $ne: true } });

//   for (const subcategory of endingSubcategories) {
//     const items = await Item.find({ subcategoryId: subcategory._id });

//     for (const item of items) {
//       const bids = await Bid.find({ item: item._id }).sort({ createdAt: -1 });
//       const winnerBid = bids[0];

//       if (winnerBid) {
//         await handleWinner(item, winnerBid, subcategory, notificationNamespace);
//       }

//       await handleLosers(item, winnerBid, subcategory, notificationNamespace);
//     }

//     subcategory.notifiedEnd = true;
//     await subcategory.save();

//     const deposits = await Deposit.find({ item: subcategory._id, status: 'approved' });
//     deposits.forEach(async (deposit) => {
//       notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
//         message: `The auction for subcategory ${subcategory.name} has ended.`,
//       });

//       // Send Firebase notification
//       const user = await User.findById(deposit.userId);



//       const auctionEnded = new Notification({
//         userId: deposit.userId,
//         message: `The auction for subcategory ${subcategory.name} has ended.`,
     
//         itemId: subcategory._id,
//       });
//       await auctionEnded.save();
//       if (user && user.fcmToken) {
//         const message = {
//           notification: {
//             title: 'Auction Ended',
//             body: `The auction for subcategory ${subcategory.name} has ended.`,
//           },
//           token: user.fcmToken,
//         };
//         await admin.messaging().send(message);
//       }
//     });
//   }
// };

// const handleWinner = async (item, winnerBid, subcategory, notificationNamespace, session) => {
//   const deposits = await Deposit.find({ item: subcategory._id, status: 'approved' });
//   const depositAmount = deposits.find(deposit => deposit.userId.equals(winnerBid.userId))?.amount || 0;

//   const commission1 = item.startPrice * (item.commission1 / 100);
//   const commission2 = item.startPrice * (item.commission2 / 100);
//   const commission3 = item.startPrice * (item.commission3 / 100);
//   const totalAfterCommission = parseInt(item.startPrice) + commission1 + commission2 + commission3;
//   const winnerAmount = totalAfterCommission - depositAmount;

//   if (isNaN(winnerAmount)) {
//     console.error(`winnerAmount is NaN for item ${item._id}, user ${winnerBid.userId}`);
//     return;
//   }

//   if (!item.notifiedWinner) {
//     const winnerNotification = new Notification({
//       userId: winnerBid.userId,
//       message: `Congratulations! You have won the auction for item ${item.name} in subcategory ${subcategory.name} with a bid of ${winnerBid.amount}.`,
//       itemId: item._id,
//     });
//     await winnerNotification.save();

//     // Send Socket.IO notification
//     notificationNamespace.to(`user_${winnerBid.userId}`).emit('notification', {
//       message: `Congratulations! You have won the auction for item ${item.name} in subcategory ${subcategory.name} with a bid of ${winnerBid.amount}.`,
//     });

//     // Send Firebase notification
//     const user = await User.findById(winnerBid.userId);
//     if (user && user.fcmToken) {
//       const message = {
//         notification: {
//           title: 'You Won!',
//           body: `You have won the auction for item ${item.name} in subcategory ${subcategory.name} with a bid of ${winnerBid.amount}.`,
//         },
//         token: user.fcmToken,
//       };
//       await admin.messaging().send(message);
//     }

//     const winnerEntry = new Winner({
//       userId: winnerBid.userId,
//       subcategory: item.subcategoryId,
//       itemId: item._id,
//       amount: winnerAmount,
//       status: 'winner',
//     });
//     await winnerEntry.save();

//     const winnerDeposit = deposits.find(deposit => deposit.userId.equals(winnerBid.userId));
//     if (winnerDeposit) {
//       winnerDeposit.status = 'winner';
//       await winnerDeposit.save({ validateBeforeSave: false });
//     }

//     item.notifiedWinner = true;
//     item.status = 'completed';
//     await item.save();
//   }
// };

// const handleLosers = async (item, winnerBid, subcategory, notificationNamespace, session) => {
//   const results = await Bid.aggregate([
//     {
//       $match: { 
//         item: item._id, 
//         userId: { $ne: winnerBid.userId } // Ensure the winnerBid is excluded in the aggregation
//       }
//     },
//     {
//       $group: {
//         _id: { userId: "$userId", item: "$item" },
//         totalAmount: { $sum: "$amount" },
//       }
//     },
//     {
//       $sort: { totalAmount: -1 }
//     },
//     {
//       $project: {
//         totalAmount: 1
//       }
//     }
//   ]);

//   for (const result of results) {
//     const deposit = await Deposit.findOne({ userId: result._id.userId, item: item._id, status: 'approved' })
//     const loserEntry = new Winner({
//       userId: result._id.userId,
//       subcategory: item.subcategoryId,
//       itemId: item._id,
//       amount: result.totalAmount,
//       status: 'loser',
//     });
//     await loserEntry.save();

//     if (deposit) {
//       const user = await User.findById(result._id.userId)

//       user.walletBalance += parseInt(deposit.amount);
//       user.walletTransactions.push({
//         amount: deposit.amount,
//         type: 'refund',
//         description: `Refund for item ${item.name} in subcategory ${subcategory.name}`,
//       });

//       // Update deposit status to 'refunded'
//       deposit.status = 'refunded';
//       await deposit.save({ validateBeforeSave: false });
//       await user.save({ validateBeforeSave: false });

//       // Send Socket.IO notification
//       notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
//         message: `The auction for item ${item.name} in subcategory ${subcategory.name} has ended. Your deposit has been refunded.`,
//       });


      
//       // Send Firebase notification
//       if (user && user.fcmToken) {
//         const message = {
//           notification: {
//             title: 'Auction Ended',
//             body: `The auction for item ${item.name} in subcategory ${subcategory.name} has ended. Your deposit has been refunded.`,
//           },
//           token: user.fcmToken,
//         };
//         await admin.messaging().send(message);
//       }
//     }
//   }

//   item.notifiedLosers = true;
//   await item.save();
// };

// const aggregateSubcategoryResults = async () => {
//   try {
//     // Find all unprocessed results
//     const results = await Winner.aggregate([
//       { $match: { processed: false } }, // Only include unprocessed results
//       {
//         $group: {
//           _id: { userId: "$userId", subcategory: "$subcategory", status: "$status" },
//           winnerIds: { $push: "$_id" },
//           totalAmount: { $sum: { $cond: { if: { $eq: ["$status", "winner"] }, then: "$amount", else: 0 } } },
//         }
//       },
//       {
//         $group: {
//           _id: { userId: "$_id.userId", subcategory: "$_id.subcategory" },
//           results: {
//             $push: {
//               status: "$_id.status",
//               winnerIds: "$winnerIds",
//               totalAmount: "$totalAmount"
//             }
//           }
//         }
//       },
//       {
//         $project: {
//           userId: "$_id.userId",
//           subcategory: "$_id.subcategory",
//           results: 1
//         }
//       }
//     ]);

//     for (const result of results) {
//       for (const res of result.results) {
//         const subcategoryResult = new SubcategoryResult({
//           userId: result.userId,
//           subcategory: result.subcategory,
//           totalAmount: res.status === 'winner' ? res.totalAmount : null,
//           status: res.status,
//           results: res.winnerIds,
//         });
//         await subcategoryResult.save();

//         // Mark processed winners as processed
//         await Winner.updateMany(
//           { _id: { $in: res.winnerIds } },
//           { $set: { processed: true } }
//         );
//       }
//     }

//     console.log('Subcategory results aggregation completed.');
//   } catch (error) {
//     console.error('Error aggregating subcategory results:', error);
//   }
// };

// const setupNotificationInterval = (notificationNamespace) => {
//   setInterval(() => notifyAuctionEvents(notificationNamespace), 10 * 1000);
// };

// module.exports = {
//   createNotificationNamespace,
//   setupNotificationInterval,
//   notifyAuctionEvents
// };





































///////////////////////////////////with sesion

// const mongoose = require('mongoose');
// const admin = require('../firebase/firebaseAdmin'); 
// const logger = require('../logger'); // Import the logger
// // const { Subcategory, Deposit, User, Notification, Item, Bid, Winner, SubcategoryResult } = require('../models'); // Import your models

// const notifyAuctionEvents = async (notificationNamespace) => {
//   const now = new Date();
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     await processStartingSubcategories(now, notificationNamespace, session);
//     await processEndingSubcategories(now, notificationNamespace, session);
    
//     await session.commitTransaction();
//     await aggregateSubcategoryResults();
//   } catch (error) {
//     await session.abortTransaction();
//     logger.error('Transaction aborted due to error:', error);
//     throw error;
//   } finally {
//     session.endSession();
//   }
// };

// const processStartingSubcategories = async (now, notificationNamespace, session) => {
//   const startingSubcategories = await Subcategory.find({ startDate: { $lte: now }, notifiedStart: { $ne: true } }).session(session);

//   for (const subcategory of startingSubcategories) {
//     const deposits = await Deposit.find({ item: subcategory._id,status: 'approved' }).session(session);

//     const startNotifications = deposits.map(async (deposit) => {
//       const notification = new Notification({
//         userId: deposit.userId,
//         message: `The auction for subcategory ${subcategory.name} has started.`,
//         itemId: subcategory._id,
//       });
//       await notification.save({ session });

//       notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
//         message: `The auction for subcategory ${subcategory.name} has started and will end at ${subcategory.endDate.toLocaleTimeString()}.`,
//         subcategory: subcategory,
//       });

//       const user = await User.findById(deposit.userId).session(session);
//       if (user && user.fcmToken &&isLogin) {
//         const message = {
//           notification: {
//             title: 'Auction Started',
//             body: `The auction for subcategory ${subcategory.name} has started and will end at ${subcategory.endDate.toLocaleTimeString()}.`,
//           },
//           token: user.fcmToken,
//         };
//         await admin.messaging().send(message);
//       }
//     });

//     await Promise.all(startNotifications);

//     subcategory.notifiedStart = true;
//     await subcategory.save({ session });
//   }
// };

// const processEndingSubcategories = async (now, notificationNamespace, session) => {
//   const endingSubcategories = await Subcategory.find({ endDate: { $lte: now }, notifiedEnd: { $ne: true } }).session(session);

//   for (const subcategory of endingSubcategories) {
//     const items = await Item.find({ subcategoryId: subcategory._id }).session(session);

//     for (const item of items) {
//       const bids = await Bid.find({ item: item._id }).sort({ createdAt: -1 }).session(session);
//       const winnerBid = bids[0];

//       if (winnerBid) {
//         await handleWinner(item, winnerBid, subcategory, notificationNamespace, session);
//       }

//       await handleLosers(item, winnerBid, subcategory, notificationNamespace, session);
//     }

//     subcategory.notifiedEnd = true;
//     await subcategory.save({ session });

//     const deposits = await Deposit.find({ item: subcategory._id, status: 'approved' }).session(session);
//     for (const deposit of deposits) {
//       notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
//         message: `The auction for subcategory ${subcategory.name} has ended.`,
//       });

//       const user = await User.findById(deposit.userId).session(session);
//       const auctionEnded = new Notification({
//         userId: deposit.userId,
//         message: `The auction for subcategory ${subcategory.name} has ended.`,
//         itemId: subcategory._id,
//       });
//       await auctionEnded.save({ session });

//       if (user && user.fcmToken) {
//         const message = {
//           notification: {
//             title: 'Auction Ended',
//             body: `The auction for subcategory ${subcategory.name} has ended.`,
//           },
//           token: user.fcmToken,
//         };
//         await admin.messaging().send(message);
//       }
//     }
//   }
// };

// const handleWinner = async (item, winnerBid, subcategory, notificationNamespace, session) => {
//   const deposits = await Deposit.find({ item: subcategory._id, status: 'approved' }).session(session);
//   const depositAmount = deposits.find(deposit => deposit.userId.equals(winnerBid.userId))?.amount || 0;

//   const commission1 = item.startPrice * (item.commission1 / 100);
//   const commission2 = item.startPrice * (item.commission2 / 100);
//   const commission3 = item.startPrice * (item.commission3 / 100);
//   const totalAfterCommission = parseInt(item.startPrice) + commission1 + commission2 + commission3;
//   const winnerAmount = totalAfterCommission - depositAmount;

//   if (isNaN(winnerAmount)) {
//     logger.error(`winnerAmount is NaN for item ${item._id}, user ${winnerBid.userId}`);
//     return;
//   }

//   if (!item.notifiedWinner) {
//     const winnerNotification = new Notification({
//       userId: winnerBid.userId,
//       message: `Congratulations! You have won the auction for item ${item.name} in subcategory ${subcategory.name} with a bid of ${winnerBid.amount}.`,
//       itemId: item._id,
//     });
//     await winnerNotification.save({ session });

//     notificationNamespace.to(`user_${winnerBid.userId}`).emit('notification', {
//       message: `Congratulations! You have won the auction for item ${item.name} in subcategory ${subcategory.name} with a bid of ${winnerBid.amount}.`,
//     });

//     const user = await User.findById(winnerBid.userId).session(session);
//     if (user && user.fcmToken) {
//       const message = {
//         notification: {
//           title: 'You Won!',
//           body: `You have won the auction for item ${item.name} in subcategory ${subcategory.name} with a bid of ${winnerBid.amount}.`,
//         },
//         token: user.fcmToken,
//       };
//       await admin.messaging().send(message);
//     }

//     const winnerEntry = new Winner({
//       userId: winnerBid.userId,
//       subcategory: item.subcategoryId,
//       itemId: item._id,
//       amount: winnerAmount,
//       status: 'winner',
//     });
//     await winnerEntry.save({ session });

//     const winnerDeposit = deposits.find(deposit => deposit.userId.equals(winnerBid.userId));
//     if (winnerDeposit) {
//       winnerDeposit.status = 'winner';
//       await winnerDeposit.save({ session, validateBeforeSave: false });
//     }

//     item.notifiedWinner = true;
//     item.status = 'completed';
//     await item.save({ session });
//   }
// };

// const handleLosers = async (item, winnerBid, subcategory, notificationNamespace, session) => {
//   const results = await Bid.aggregate([
//     {
//       $match: { 
//         item: item._id, 
//         userId: { $ne: winnerBid.userId } // Ensure the winnerBid is excluded in the aggregation
//       }
//     },
//     {
//       $group: {
//         _id: { userId: "$userId", item: "$item" },
//         totalAmount: { $sum: "$amount" },
//       }
//     },
//     {
//       $sort: { totalAmount: -1 }
//     },
//     {
//       $project: {
//         totalAmount: 1
//       }
//     }
//   ]).session(session);

//   for (const result of results) {
//     const deposit = await Deposit.findOne({ userId: result._id.userId, item: item._id, status: 'approved' }).session(session);
//     const loserEntry = new Winner({
//       userId: result._id.userId,
//       subcategory: item.subcategoryId,
//       itemId: item._id,
//       amount: result.totalAmount,
//       status: 'loser',
//     });
//     await loserEntry.save({ session });

//     if (deposit) {
//       const user = await User.findById(result._id.userId).session(session);
//       user.walletBalance += parseInt(deposit.amount);
//       user.walletTransactions.push({
//         amount: deposit.amount,
//         type: 'refund',
//         description: `Refund for item ${item.name} in subcategory ${subcategory.name}`,
//       });

//       deposit.status = 'refunded';
//       await deposit.save({ session, validateBeforeSave: false });
//       await user.save({ session, validateBeforeSave: false });

//       notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
//         message: `The auction for item ${item.name} in subcategory ${subcategory.name} has ended. Your deposit has been refunded.`,
//       });

//       if (user && user.fcmToken) {
//         const message = {
//           notification: {
//             title: 'Auction Ended',
//             body: `The auction for item ${item.name} in subcategory ${subcategory.name} has ended. Your deposit has been refunded.`,
//           },
//           token: user.fcmToken,
//         };
//         await admin.messaging().send(message);
//       }
//     }
//   }

//   item.notifiedLosers = true;
//   await item.save({ session });
// };

// const aggregateSubcategoryResults = async () => {
//   try {
//     const results = await Winner.aggregate([
//       { $match: { processed: false } },
//       {
//         $group: {
//           _id: { userId: "$userId", subcategory: "$subcategory", status: "$status" },
//           winnerIds: { $push: "$_id" },
//           totalAmount: { $sum: { $cond: { if: { $eq: ["$status", "winner"] }, then: "$amount", else: 0 } } },
//         }
//       },
//       {
//         $group: {
//           _id: { userId: "$_id.userId", subcategory: "$_id.subcategory" },
//           results: {
//             $push: {
//               status: "$_id.status",
//               winnerIds: "$winnerIds",
//               totalAmount: "$totalAmount"
//             }
//           }
//         }
//       },
//       {
//         $project: {
//           userId: "$_id.userId",
//           subcategory: "$_id.subcategory",
//           results: 1
//         }
//       }
//     ]);

//     for (const result of results) {
//       for (const res of result.results) {
//         const subcategoryResult = new SubcategoryResult({
//           userId: result.userId,
//           subcategory: result.subcategory,
//           totalAmount: res.status === 'winner' ? res.totalAmount : null,
//           status: res.status,
//           results: res.winnerIds,
//         });
//         await subcategoryResult.save();

//         await Winner.updateMany(
//           { _id: { $in: res.winnerIds } },
//           { $set: { processed: true } }
//         );
//       }
//     }

//     logger.info('Subcategory results aggregation completed.');
//   } catch (error) {
//     logger.error('Error aggregating subcategory results:', error);
//   }
// };

// const setupNotificationInterval = (notificationNamespace) => {
//   setInterval(() => notifyAuctionEvents(notificationNamespace), 10 * 1000);
// };

// module.exports = {
//   createNotificationNamespace,
//   setupNotificationInterval,
//   notifyAuctionEvents
// };






















//////////////////////////////////////////////////////////////////////



























































//////////////////////////////////////////////////////////////////////////final version /////////////////////////////////////////////////////////////
// const mongoose = require('mongoose');
// const admin = require('../firebase/firebaseAdmin'); 
// const logger = require('../logger'); // Import the logger

// const notifyAuctionEvents = async (notificationNamespace) => {
//   const now = new Date();

//   try {
//     await processStartingSubcategories(now, notificationNamespace);
//     await processEndingSubcategories(now, notificationNamespace);
    
//     await aggregateSubcategoryResults();
//   } catch (error) {
//     logger.error('Error during notifyAuctionEvents:', error);
//     throw error;
//   }
// };

// const processStartingSubcategories = async (now, notificationNamespace) => {
//   const startingSubcategories = await Subcategory.find({ startDate: { $lte: now }, notifiedStart: { $ne: true } });
//   console.log(startingSubcategories)

//   for (const subcategory of startingSubcategories) {
//     const deposits = await Deposit.find({ item: subcategory._id, status: 'approved' });
//     const fcmTokens = deposits.map(deposit => deposit.userId.fcmToken).filter(token => token);
//     console.log(fcmTokens)
//     if (fcmTokens.length > 0) {

//       const message = {
//         notification: {
//           title: 'Auction Started',
//           body: `The auction for subcategory ${subcategory.name} has started and will end at ${subcategory.endDate.toLocaleTimeString()}.`,
//         },
//         tokens: fcmTokens,
//       };

//       admin.messaging().sendMulticast(message)
//         .then((response) => {
//           console.log(`${response.successCount} messages were sent successfully`);
//         })
//         .catch((error) => {
//           console.error('Error sending multicast message:', error);
//         });
//     }
//     const startNotifications = deposits.map(async (deposit) => {
//       const notification = new Notification({
//         userId: deposit.userId,
//         message: `The auction for subcategory ${subcategory.name} has started.`,
//         itemId: subcategory._id,
//         type:'auction'

//       });
//       await notification.save();

//       notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
//         message: `The auction for subcategory ${subcategory.name} has started and will end at ${subcategory.endDate.toLocaleTimeString()}.`,
//         subcategory: subcategory,
//       });



//     });

//     await Promise.all(startNotifications);

//     subcategory.notifiedStart = true;
//     await subcategory.save();
//   }
// };

// const processEndingSubcategories = async (now, notificationNamespace) => {
//   const endingSubcategories = await Subcategory.find({ endDate: { $lte: now }, notifiedEnd: { $ne: true } });
//   console.log(endingSubcategories)

//   for (const subcategory of endingSubcategories) {
//     const items = await Item.find({ subcategoryId: subcategory._id });

//     for (const item of items) {
//       const bids = await Bid.find({ item: item._id }).sort({ createdAt: -1 });
//       const winnerBid = bids[0];

//       if (winnerBid) {
//         await handleWinner(item, winnerBid, subcategory, notificationNamespace);
//         await handleLosers(item, winnerBid, subcategory, notificationNamespace);
//       }

//     }

//     subcategory.notifiedEnd = true;
//     await subcategory.save();

//     const deposits = await Deposit.find({ item: subcategory._id, status: 'approved' });

//     const fcmTokens = deposits.map(deposit => deposit.userId.fcmToken).filter(token => token);
//     console.log(fcmTokens)
//     if (fcmTokens.length > 0) {

//       const message = {
//          notification: {
//             title: 'Auction Ended',
//             body: `The auction for subcategory ${subcategory.name} has ended.`,
//           },
//         tokens: fcmTokens,
//       };

//       admin.messaging().sendMulticast(message)
//         .then((response) => {
//           console.log(`${response.successCount} messages were sent successfully`);
//         })
//         .catch((error) => {
//           console.error('Error sending multicast message:', error);
//         });
//     }
//     for (const deposit of deposits) {
//       notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
//         message: `The auction for subcategory ${subcategory.name} has ended.`,
//       });

//       const user = await User.findById(deposit.userId);
//       const auctionEnded = new Notification({
//         userId: deposit.userId,
//         message: `The auction for subcategory ${subcategory.name} has ended.`,
//         itemId: subcategory._id,
//         type:'auction'

//       });
//       await auctionEnded.save();

//     }
//   }
// };




// const handleWinner = async (item, winnerBid, subcategory, notificationNamespace) => {
//   console.log('handleWinner')
//   const deposits = await Deposit.find({ item: subcategory._id, status: 'approved' });
//   const depositAmount = deposits.find(deposit => deposit.userId.equals(winnerBid.userId))?.amount || 0;

//   const commission1 = item.startPrice * (item.commission1 / 100);
//   const commission2 = item.startPrice * (item.commission2 / 100);
//   const commission3 = item.startPrice * (item.commission3 / 100);
//   const totalAfterCommission = parseInt(item.startPrice) + commission1 + commission2 + commission3;
//   const winnerAmount = totalAfterCommission - depositAmount;

//   if (isNaN(winnerAmount)) {
//     logger.error(`winnerAmount is NaN for item ${item._id}, user ${winnerBid.userId}`);
//     return;
//   }

//   if (!item.notifiedWinner) {
//     const winnerNotification = new Notification({
//       userId: winnerBid.userId,
//       message: `Congratulations! You have won the auction for item ${item.name} in subcategory ${subcategory.name} with a bid of ${winnerBid.amount}.`,
//       itemId: item._id,
//       type:'winner'

//     });
//     await winnerNotification.save();

//     notificationNamespace.to(`user_${winnerBid.userId}`).emit('notification', {
//       message: `Congratulations! You have won the auction for item ${item.name} in subcategory ${subcategory.name} with a bid of ${winnerBid.amount}.`,
//     });

//     const user = await User.findById(winnerBid.userId);
//     if (user && user.fcmToken) {
//       const message = {
//         notification: {
//           title: 'You Won!',
//           body: `You have won the auction for item ${item.name} in subcategory ${subcategory.name} with a bid of ${winnerBid.amount}.`,
//         },
//         token: user.fcmToken,
//       };
//       await admin.messaging().send(message);
//     }

//     const winnerEntry = new Winner({
//       userId: winnerBid.userId,
//       subcategory: item.subcategoryId,
//       itemId: item._id,
//       amount: winnerAmount,
//       status: 'winner',
//     });
//     await winnerEntry.save();

//     const winnerDeposit = deposits.find(deposit => deposit.userId.equals(winnerBid.userId));
//     if (winnerDeposit) {
//       winnerDeposit.status = 'winner';
//       await winnerDeposit.save({ validateBeforeSave: false });
//     }

//     item.notifiedWinner = true;
//     item.status = 'completed';
//     await item.save();
//   }
// };












// const handleLosers = async (item, winnerBid, subcategory, notificationNamespace) => {

//   console.log(winnerBid)
//   const results = await Bid.aggregate([
//     {
//       $match: { 
//         item: item._id, 
//         userId: { $ne: winnerBid.userId } // Ensure the winnerBid is excluded in the aggregation
//       }
//     },
//     {
//       $group: {
//         _id: { userId: "$userId", item: "$item" },
//         totalAmount: { $sum: "$amount" },
//       }
//     },
//     {
//       $sort: { totalAmount: -1 }
//     },
//     {
//       $project: {
//         totalAmount: 1
//       }
//     }
//   ]);

//   for (const result of results) {
//     const deposit = await Deposit.findOne({ userId: result._id.userId, item: item.subcategoryId, status: 'approved' });
//     console.log("deposit",deposit)
//     console.log("result",result)
//     console.log("item",item)



//     if (deposit) {
//       const user = await User.findById(result._id.userId);
//       user.walletBalance += parseInt(deposit.amount);
//       user.walletTransactions.push({
//         amount: deposit.amount,
//         type: 'refund',
//         description: `Refund for item ${item.name} in subcategory ${subcategory.name}`,
//       });

//       deposit.status = 'refunded';
//       await deposit.save({ validateBeforeSave: false });
//       await user.save({ validateBeforeSave: false });
//       const loserEntry = new Winner({
//         userId: result._id.userId,
//         subcategory: item.subcategoryId,
//         itemId: item._id,
//         amount: result.totalAmount,
//         status: 'loser',
//       });
//       await loserEntry.save();
//       notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
//         message: `The auction for item ${item.name} in subcategory ${subcategory.name} has ended. Your deposit has been refunded.`,
//       });

//       if (user && user.fcmToken) {
//         const message = {
//           notification: {
//             title: 'Auction Ended',
//             body: `The auction for item ${item.name} in subcategory ${subcategory.name} has ended. Your deposit has been refunded.`,
//           },
//           token: user.fcmToken,
//         };
//         await admin.messaging().send(message);
//       }
//     }
//   }

//   item.notifiedLosers = true;
//   await item.save();
// };

// const aggregateSubcategoryResults = async () => {
//   try {
//     const results = await Winner.aggregate([
//       { $match: { processed: false } },
//       {
//         $group: {
//           _id: { userId: "$userId", subcategory: "$subcategory", status: "$status" },
//           winnerIds: { $push: "$_id" },
//           totalAmount: { $sum: { $cond: { if: { $eq: ["$status", "winner"] }, then: "$amount", else: 0 } } },
//         }
//       },
//       {
//         $group: {
//           _id: { userId: "$_id.userId", subcategory: "$_id.subcategory" },
//           results: {
//             $push: {
//               status: "$_id.status",
//               winnerIds: "$winnerIds",
//               totalAmount: "$totalAmount"
//             }
//           }
//         }
//       },
//       {
//         $project: {
//           userId: "$_id.userId",
//           subcategory: "$_id.subcategory",
//           results: 1
//         }
//       }
//     ]);

//     for (const result of results) {
//       for (const res of result.results) {
//         const subcategoryResult = new SubcategoryResult({
//           userId: result.userId,
//           subcategory: result.subcategory,
//           totalAmount: res.status === 'winner' ? res.totalAmount : null,
//           status: res.status,
//           results: res.winnerIds,
//         });
//         await subcategoryResult.save();

//         await Winner.updateMany(
//           { _id: { $in: res.winnerIds } },
//           { $set: { processed: true } }
//         );
//       }
//     }

//     logger.info('Subcategory results aggregation completed.');
//   } catch (error) {
//     logger.error('Error aggregating subcategory results:', error);
//   }
// };

// const setupNotificationInterval = (notificationNamespace) => {
//   setInterval(() => notifyAuctionEvents(notificationNamespace), 10 * 1000);
// };

// module.exports = {
//   createNotificationNamespace,
//   setupNotificationInterval,
//   notifyAuctionEvents
// };
////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////




























//////////////////////////////////////////////////////////////////////////with transaction /////////////////////////////////////////////////////////////














const mongoose = require('mongoose');
const admin = require('../firebase/firebaseAdmin'); 
const logger = require('../logger'); // Import the logger
const AdminNotification = require('../models/adminNotificationModel');

const notifyAuctionEvents = async (notificationNamespace) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const now = new Date();

    await processStartingSubcategories(now, notificationNamespace, session);
    await processEndingSubcategories(now, notificationNamespace, session);
    
    await aggregateSubcategoryResults(session);

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error('Error during notifyAuctionEvents:', error);
    throw error;
  }
};

const processStartingSubcategories = async (now, notificationNamespace, session) => {
  const startingSubcategories = await Subcategory.find({ startDate: { $lte: now }, notifiedStart: { $ne: true } }).session(session);

  for (const subcategory of startingSubcategories) {
    const deposits = await Deposit.find({ item: subcategory._id, status: 'approved' }).session(session).populate('userId', 'fcmToken');
    const fcmTokens = deposits.map(deposit => deposit.userId.fcmToken).filter(token => token);

    if (fcmTokens.length > 0) {
      const message = {
        notification: {
          title: 'المزاد بداء',
          body: `اللوط بمزاد ${subcategory.name} بداء وسيتم انتهاء المزاد فى  ${subcategory.endDate.toLocaleTimeString()}.`,
        },
        tokens: fcmTokens,
      };

      try {
        await admin.messaging().sendEachForMulticast(message);
        console.log(`${response.successCount} messages were sent successfully`);
      } catch (error) {
        console.error('Error sending multicast message:', error);
      }
    }

    const startNotifications = deposits.map(async (deposit) => {
      const notification = new Notification({
        userId: deposit.userId,
        message: `اللوط بمزاد ${subcategory.name} بداء الان.`,
        itemId: subcategory._id,
        type: 'auction'
      });
      await notification.save({ session });

      notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
        message: `بدأت المزاد الفرعي  ${subcategory.name} الآن وسينتهي في  ${subcategory.endDate.toLocaleTimeString()}.`,
        subcategory: subcategory,
      });
    });

    await Promise.all(startNotifications);
    const adminNotificationMessage = `بدأت المزاد الفرعي ${subcategory.name} الآن وسينتهي في ${subcategory.endDate.toLocaleTimeString()}.`;
    const adminNotification = new AdminNotification({
      title: 'إشعار بدء مزاد فرعي',
      message: adminNotificationMessage,
    });
console.log("adminNotification",adminNotification);
    await adminNotification.save({validateBeforeSave:false  });
    subcategory.notifiedStart = true;
    await subcategory.save({ session });
  }
};











///////////////////////////////////////this work
// const processEndingSubcategories = async (now, notificationNamespace, session) => {
//   const endingSubcategories = await Subcategory.find({ endDate: { $lte: now }, notifiedEnd: { $ne: true } }).session(session);

//   for (const subcategory of endingSubcategories) {
//     const items = await Item.find({ subcategoryId: subcategory._id }).session(session);
//     const winners = [];

//     // First loop: Collect all winners and handle them
//     for (const item of items) {
//       const bids = await Bid.find({ item: item._id }).sort({ createdAt: -1 }).session(session);
//       const winnerBid = bids[0];

//       if (winnerBid) {
//         // Add the item and the winnerBid to the winners array
//         winners.push({ item, winnerBid });

//         // Fire handleWinner for each winner
//         await handleWinner(item, winnerBid, subcategory, notificationNamespace, session);
//       }
//     }

//     // Second loop: Now handle losers for each item
//     for (const { item, winnerBid } of winners) {
//       await handleLosers(item, winnerBid, subcategory, notificationNamespace, session);
//     }

//     // Mark subcategory as notified
//     subcategory.notifiedEnd = true;
//     await subcategory.save({ session });

//     // Handle notifications and messages
//     const deposits = await Deposit.find({ item: subcategory._id, status: 'approved' }).session(session).populate('userId', 'fcmToken');
//     const fcmTokens = deposits.map(deposit => deposit.userId.fcmToken).filter(token => token);

//     if (fcmTokens.length > 0) {
//       const message = {
//         notification: {
//           title: 'Auction Ended',
//           body: `The auction for subcategory ${subcategory.name} has ended.`,
//         },
//         tokens: fcmTokens,
//       };

//       try {
//         const response = await admin.messaging().sendEachForMulticast(message);
//         console.log(`${response.successCount} messages were sent successfully`);
//       } catch (error) {
//         console.error('Error sending multicast message:', error);
//       }
//     }

//     // Send end notifications
//     const endNotifications = deposits.map(async (deposit) => {
//       const auctionEnded = new Notification({
//         userId: deposit.userId,
//         message: `The auction for subcategory ${subcategory.name} has ended.`,
//         itemId: subcategory._id,
//         type: 'auction'
//       });
//       await auctionEnded.save({ session });

//       notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
//         message: `The auction for subcategory ${subcategory.name} has ended.`,
//       });
//     });

//     await Promise.all(endNotifications);
//   }
// };

// const processEndingSubcategories = async (now, notificationNamespace, session) => {
//   const endingSubcategories = await Subcategory.find({ endDate: { $lte: now }, notifiedEnd: { $ne: true } }).session(session);

//   for (const subcategory of endingSubcategories) {
//     const items = await Item.find({ subcategoryId: subcategory._id }).session(session);

//     for (const item of items) {
//       const bids = await Bid.find({ item: item._id }).sort({ createdAt: -1 }).session(session);
//       const winnerBid = bids[0];

//       if (winnerBid) {
//         await handleWinner(item, winnerBid, subcategory, notificationNamespace, session);
//         await handleLosers(item, winnerBid, subcategory, notificationNamespace, session);
//       }
//     }

//     subcategory.notifiedEnd = true;
//     await subcategory.save({ session });

//     const deposits = await Deposit.find({ item: subcategory._id, status: 'approved' }).session(session).populate('userId', 'fcmToken');
//     const fcmTokens = deposits.map(deposit => deposit.userId.fcmToken).filter(token => token);

//     if (fcmTokens.length > 0) {
//       const message = {
//         notification: {
//           title: 'Auction Ended',
//           body: `The auction for subcategory ${subcategory.name} has ended.`,
//         },
//         tokens: fcmTokens,
//       };

//       try {
//         await admin.messaging().sendMulticast(message);
//         console.log(`${response.successCount} messages were sent successfully`);
//       } catch (error) {
//         console.error('Error sending multicast message:', error);
//       }
//     }

//     const endNotifications = deposits.map(async (deposit) => {
//       const auctionEnded = new Notification({
//         userId: deposit.userId,
//         message: `The auction for subcategory ${subcategory.name} has ended.`,
//         itemId: subcategory._id,
//         type: 'auction'
//       });
//       await auctionEnded.save({ session });

//       notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
//         message: `The auction for subcategory ${subcategory.name} has ended.`,
//       });
//     });

//     await Promise.all(endNotifications);
//   }
// };

///////////////////////////////////////////////////////////////////////////////////////

const processEndingSubcategories = async (now, notificationNamespace, session) => {
  try {
    const endingSubcategories = await Subcategory.find({
      endDate: { $lte: now },
      notifiedEnd: { $ne: true }
    }).session(session);

    for (const subcategory of endingSubcategories) {
      const items = await Item.find({ subcategoryId: subcategory._id }).session(session);
      const winnersMap = new Map();

      // First loop: Collect all winners and deposits
      for (const item of items) {
        const bids = await Bid.find({ item: item._id }).sort({ createdAt: -1 }).session(session);
        const winnerBid = bids[0];

        if (winnerBid) {
          const userId = winnerBid.userId.toString();
          if (!winnersMap.has(userId)) {
            winnersMap.set(userId, { items: [], totalUsedDeposit: 0 });
          }
          winnersMap.get(userId).items.push({ item, winnerBid });
        }
      }

      // Second loop: Handle winners and update deposits
      for (const [userId, winnerData] of winnersMap) {
        let depositAmount = 0;
        const deposits = await Deposit.find({
          item: subcategory._id,
          status: 'approved'
        }).session(session).populate('userId', 'fcmToken');
        const winnerDeposit = deposits.find(deposit => deposit.userId.equals(userId));

        if (winnerDeposit) {
          depositAmount = winnerDeposit.amount || 0;
          winnerDeposit.status = 'winner'; // Mark the winner's deposit as "winner"
          await winnerDeposit.save({ validateBeforeSave: false, session });
        }

        for (const { item, winnerBid } of winnerData.items) {
          const depositUsedForItem = await handleWinner(item, winnerBid, subcategory, notificationNamespace, session, depositAmount);
          winnerData.totalUsedDeposit += depositUsedForItem;
          depositAmount -= depositUsedForItem;
        }

        // if (depositAmount > 0) {
        //   const user = await User.findById(userId).session(session);
        //   user.walletBalance += depositAmount;
        //   user.walletTransactions.push({
        //     amount: depositAmount,
        //     type: 'refund',
        //     description: `Remaining deposit refund for subcategory ${subcategory.name}.`,
        //   });
        //   await user.save({ validateBeforeSave: false, session });

        //   winnerDeposit.status = 'refunded';
        //   await winnerDeposit.save({ validateBeforeSave: false, session });
        // }
      }

      // Handle losers
      for (const item of items) {
        const bids = await Bid.find({ item: item._id }).sort({ createdAt: -1 }).session(session);
        const winnerBid = bids[0];

        if (winnerBid) {
          await handleLosers(item, winnerBid, subcategory, notificationNamespace, session);
        }
      }

      subcategory.notifiedEnd = true;
      await subcategory.save({ session });

      // Send notifications for auction end
      const depositsForNotifications = await Deposit.find({
        item: subcategory._id,
        status: 'approved'
      }).session(session).populate('userId', 'fcmToken');

      const fcmTokens = depositsForNotifications
        .map(deposit => deposit.userId.fcmToken)
        .filter(token => token); // Filter out null or undefined tokens

      if (fcmTokens.length > 0) {
        const message = {
          notification: {
            title: 'المزاد انتهى',
            body: `انتهى مزاد ${subcategory.name} وجارى اعتماد الاسعار للترسية.`,
          },
          tokens: fcmTokens,
        };

        try {
          const response = await admin.messaging().sendEachForMulticast(message);
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              console.error(`Failed to send message to ${fcmTokens[idx]}: ${resp.error.message}`);
              // Optionally: remove invalid FCM token from user data
            }
          });
          console.log(`${response.successCount} messages were sent successfully`);
        } catch (error) {
          console.error('Error sending multicast message:', error);
        }
      }

      const endNotifications = depositsForNotifications.map(async (deposit) => {
        const auctionEnded = new Notification({
          userId: deposit.userId,
          message: `انتهى المزاد ${subcategory.name} وجارى اعتماد الاسعار للترسية.`,
          itemId: subcategory._id,
          type: 'auction'
        });
        await auctionEnded.save({ session });

        notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
          message: `انتهى المزاد  ${subcategory.name} وجارى اعتماد الاسعار للترسية.`,
        });
      });

      await Promise.all(endNotifications);
      const adminNotificationMessage = `انتهى المزاد الفرعي ${subcategory.name}.`;
      const adminNotification = new AdminNotification({
        title: 'إشعار انتهاء مزاد فرعي',
        message: adminNotificationMessage,
      });

      await adminNotification.save({ session });
    }
  } catch (error) {
    console.error('Error processing ending subcategories:', error);
    // You can optionally decide to handle this error further
  }
};

// const processEndingSubcategories = async (now, notificationNamespace, session) => {
//   const endingSubcategories = await Subcategory.find({ endDate: { $lte: now }, notifiedEnd: { $ne: true } }).session(session);

//   for (const subcategory of endingSubcategories) {
//     const items = await Item.find({ subcategoryId: subcategory._id }).session(session);
//     const winnersMap = new Map();

//     // First loop: Collect all winners and deposits
//     for (const item of items) {
//       const bids = await Bid.find({ item: item._id }).sort({ createdAt: -1 }).session(session);
//       const winnerBid = bids[0];

//       if (winnerBid) {
//         const userId = winnerBid.userId.toString();
//         if (!winnersMap.has(userId)) {
//           winnersMap.set(userId, { items: [], totalUsedDeposit: 0 });
//         }
//         winnersMap.get(userId).items.push({ item, winnerBid });
//       }
//     }

//     // Second loop: Handle winners and update deposits
//     for (const [userId, winnerData] of winnersMap) {
//       let depositAmount = 0;
//       const deposits = await Deposit.find({ item: subcategory._id, status: 'approved' }).session(session).populate('userId', 'fcmToken');
//       const winnerDeposit = deposits.find(deposit => deposit.userId.equals(userId));

//       if (winnerDeposit) {
//         depositAmount = winnerDeposit.amount || 0;
//         winnerDeposit.status = 'winner'; // Mark the winner's deposit as "winner"
//         await winnerDeposit.save({ validateBeforeSave: false, session });
//       }

//       for (const { item, winnerBid } of winnerData.items) {
//         const depositUsedForItem = await handleWinner(item, winnerBid, subcategory, notificationNamespace, session, depositAmount);
//         winnerData.totalUsedDeposit += depositUsedForItem;
//         depositAmount -= depositUsedForItem;
//       }

//       if (depositAmount > 0) {
//         const user = await User.findById(userId).session(session);
//         user.walletBalance += depositAmount;
//         user.walletTransactions.push({
//           amount: depositAmount,
//           type: 'refund',
//           description: `Remaining deposit refund for subcategory ${subcategory.name}.`,
//         });
//         await user.save({ validateBeforeSave: false, session });

//         winnerDeposit.status = 'refunded';
//         await winnerDeposit.save({ validateBeforeSave: false, session });
//       }
//     }

//     // Handle losers
//     for (const item of items) {
//       const bids = await Bid.find({ item: item._id }).sort({ amount: -1 }).session(session);
//       const winnerBid = bids[0];

//       if (winnerBid) {
//         await handleLosers(item, winnerBid, subcategory, notificationNamespace, session);
//       }
//     }

//     subcategory.notifiedEnd = true;
//     await subcategory.save({ session });

//     // Send notifications for auction end
//     const deposits = await Deposit.find({ item: subcategory._id, status: 'approved' }).session(session).populate('userId', 'fcmToken');
//     const fcmTokens = deposits.map(deposit => deposit.userId.fcmToken).filter(token => token);

//     if (fcmTokens.length > 0) {
//       const message = {
//         notification: {
//           title: 'Auction Ended',
//           body: `The auction for subcategory ${subcategory.name} has ended.`,
//         },
//         tokens: fcmTokens,
//       };

//       try {
//         const response = await admin.messaging().sendEachForMulticast(message);
//         console.log(`${response.successCount} messages were sent successfully`);
//       } catch (error) {
//         console.error('Error sending multicast message:', error);
//       }
//     }

//     const endNotifications = deposits.map(async (deposit) => {
//       const auctionEnded = new Notification({
//         userId: deposit.userId,
//         message: `The auction for subcategory ${subcategory.name} has ended.`,
//         itemId: subcategory._id,
//         type: 'auction'
//       });
//       await auctionEnded.save({ session });

//       notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
//         message: `The auction for subcategory ${subcategory.name} has ended.`,
//       });
//     });

//     await Promise.all(endNotifications);
//   }
// };

// handleWinner and handleLosers functions remain the same.
const handleWinner = async (item, winnerBid, subcategory, notificationNamespace, session, depositAmount) => {
  // Calculate the total after commission
  const commission1 = item.startPrice * (item.commission1 / 100);
  const commission2 = item.startPrice * (item.commission2 / 100);
  const commission3 = item.startPrice * (item.commission3 / 100);
  const totalAfterCommission = parseInt(item.startPrice) + commission1 + commission2 + commission3;

  // Adjust the deposit to be used
  let adjustedDeposit = Math.min(depositAmount, totalAfterCommission);
  let paidFromDeposit = adjustedDeposit > 0;
  const remainingAmount = totalAfterCommission - adjustedDeposit;

  // Check if remainingAmount is NaN (just in case)
  if (isNaN(remainingAmount)) {
    logger.error(`remainingAmount is NaN for item ${item._id}, user ${winnerBid.userId}`);
    return 0;
  }

  // Notify the winner if they haven't been notified yet
  if (!item.notifiedWinner) {
    const winnerNotification = new Notification({
      userId: winnerBid.userId,
      // message: `مبرووك لقد فزت باللوط ${item.name} بمزاد  ${subcategory.name} بسعر ${winnerBid.amount}.`,
      message: `انتهى المزاد ${subcategory.name}  وانت اعلى سعر فى  ${item.name} وجارى اعتماد الاسعار `,
      
      itemId: item._id,
      type: 'winner'
    });
    await winnerNotification.save({ session });

    // Emit notification to the user's socket channel
    notificationNamespace.to(`user_${winnerBid.userId}`).emit('notification', {
      // message: `مبرووك لقد فزت باللوط  ${item.name} بمزاد ${subcategory.name} بسعر ${winnerBid.amount}.`,
      message: `انتهى المزاد ${subcategory.name}  وانت اعلى سعر فى  ${item.name} وجارى اعتماد الاسعار `,

    });

    // If the user has an FCM token, send a push notification
    const user = await User.findById(winnerBid.userId).session(session);
    if (user && user.fcmToken) {
      const message = {
        notification: {
          title: `انتهى المزاد ${subcategory.name} `,
          body: `انت اعلى سعر فى ${item.name} مزاد ${subcategory.name} وجارى اعتماد الاسعار`

          // body: `مبرووك لقد فزت باللوط ${item.name} بمزاد ${subcategory.name} بسعر ${winnerBid.amount}.`,
        },
        token: user.fcmToken,
      };
      // await admin.messaging().send(message);
    }

    // Create a Winner entry in the database
    const winnerEntry = new Winner({
      userId: winnerBid.userId,
      subcategory: item.subcategoryId,
      itemId: item._id,
      amount: remainingAmount,
      totalPaid: totalAfterCommission,
      paidFromDeposit: paidFromDeposit,
      status: 'winner',
    });
    await winnerEntry.save({ session });




    const adminNotificationMessage = `فاز المستخدم ${user?.phoneNumber} بالمزاد للبند ${item.name} في الفئة الفرعية ${subcategory.name}.`;
    const adminNotification = new AdminNotification({
      title: 'إشعار فوز جديد بالمزاد',
      message: adminNotificationMessage,
    });
    await adminNotification.save({ session });
    // Update item status and mark as notified
    item.notifiedWinner = true;
    item.status = 'completed';
    await item.save({ session });
  }

  // Return the amount of deposit used for this item
  return adjustedDeposit;
};


// const handleWinner = async (item, winnerBid, subcategory, notificationNamespace, session) => {
//   const deposits = await Deposit.find({ item: subcategory._id, status: 'approved' }).session(session).populate('userId', 'fcmToken');
//   const winnerDeposit = deposits.find(deposit => deposit.userId.equals(winnerBid.userId));
//   const depositAmount = winnerDeposit?.amount || 0;

//   const commission1 = item.startPrice * (item.commission1 / 100);
//   const commission2 = item.startPrice * (item.commission2 / 100);
//   const commission3 = item.startPrice * (item.commission3 / 100);
//   const totalAfterCommission = parseInt(item.startPrice) + commission1 + commission2 + commission3;

//   // Adjust the deposit amount
//   let adjustedDeposit = depositAmount;
//   let paidFromDeposit = false;  // Track if payment came from deposit

//   if (depositAmount > totalAfterCommission) {
//     const remainingDeposit = depositAmount - totalAfterCommission;
    
//     // Add the remaining deposit to the user's wallet balance
//     const user = await User.findById(winnerBid.userId).session(session);
//     user.walletBalance += remainingDeposit;
    
//     // Log the transaction in the user's wallet transactions
//     user.walletTransactions.push({
//       amount: remainingDeposit,
//       type: 'refund',
//       description: `Refund for item ${item.name} in subcategory ${subcategory.name} due to excess deposit.`,
//     });
    
//     // Save the updated user details
//     await user.save({ validateBeforeSave: false, session });
    
//     // Adjust the deposit to be equal to the totalAfterCommission
//     adjustedDeposit = totalAfterCommission;
//     paidFromDeposit = true;
//   }

//   const winnerAmount = totalAfterCommission - adjustedDeposit;

//   if (isNaN(winnerAmount)) {
//     logger.error(`winnerAmount is NaN for item ${item._id}, user ${winnerBid.userId}`);
//     return;
//   }

//   if (!item.notifiedWinner) {
//     const winnerNotification = new Notification({
//       userId: winnerBid.userId,
//       message: `Congratulations! You have won the auction for item ${item.name} in subcategory ${subcategory.name} with a bid of ${winnerBid.amount}.`,
//       itemId: item._id,
//       type: 'winner'
//     });
//     await winnerNotification.save({ session });

//     notificationNamespace.to(`user_${winnerBid.userId}`).emit('notification', {
//       message: `Congratulations! You have won the auction for item ${item.name} in subcategory ${subcategory.name} with a bid of ${winnerBid.amount}.`,
//     });

//     const user = await User.findById(winnerBid.userId).session(session);
//     if (user && user.fcmToken) {
//       const message = {
//         notification: {
//           title: 'You Won!',
//           body: `You have won the auction for item ${item.name} in subcategory ${subcategory.name} with a bid of ${winnerBid.amount}.`,
//         },
//         token: user.fcmToken,
//       };
//       await admin.messaging().send(message);
//     }

//     const winnerEntry = new Winner({
//       userId: winnerBid.userId,
//       subcategory: item.subcategoryId,
//       itemId: item._id,
//       amount: winnerAmount,
//       totalPaid: totalAfterCommission,  // Store how much the user paid in total
//       paidFromDeposit: paidFromDeposit,  // Mark if it was paid from deposit
//       status: 'winner',
//     });
//     await winnerEntry.save({ session });

//     if (winnerDeposit) {
//       winnerDeposit.status = 'winner';
//       await winnerDeposit.save({ validateBeforeSave: false, session });
//     }

//     item.notifiedWinner = true;
//     item.status = 'completed';
//     await item.save({ session });
//   }
// };






















// const handleLosers = async (item, winnerBid, subcategory, notificationNamespace, session) => {
//   const results = await Bid.aggregate([
//     {
//       $match: { 
//         item: item._id, 
//         userId: { $ne: winnerBid.userId } // Ensure the winnerBid is excluded in the aggregation
//       }
//     },
//     {
//       $group: {
//         _id: { userId: "$userId", item: "$item" },
//         totalAmount: { $sum: "$amount" },
//       }
//     },
//     {
//       $sort: { totalAmount: -1 }
//     },
//     {
//       $project: {
//         totalAmount: 1
//       }
//     }
//   ]).session(session);

//   for (const result of results) {
//     const deposit = await Deposit.findOne({ userId: result._id.userId, item: item.subcategoryId, status: { $in: ['approved', 'winner', 'refunded'] } }).session(session);
    
//     if (deposit) {
//       const user = await User.findById(result._id.userId).session(session);
//       if (deposit.status == 'approved'){
//       user.walletBalance += parseInt(deposit.amount);
//       user.walletTransactions.push({
//         amount: deposit.amount,
//         type: 'refund',
//         description: `Refund for item ${item.name} in subcategory ${subcategory.name}`,
//       });

//       deposit.status = 'refunded';
//       await deposit.save({ validateBeforeSave: false, session });
//       await user.save({ validateBeforeSave: false, session });
//     }
//       const loserEntry = new Winner({
//         userId: result._id.userId,
//         subcategory: item.subcategoryId,
//         itemId: item._id,
//         amount: result.totalAmount,
//         status: 'loser',
//       });
//       await loserEntry.save({ session });

//       notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
//         message: `The auction for item ${item.name} in subcategory ${subcategory.name} has ended. Your deposit has been refunded.`,
//       });

//       if (user && user.fcmToken) {
//         const message = {
//           notification: {
//             title: 'Auction Ended',
//             body: `The auction for item ${item.name} in subcategory ${subcategory.name} has ended. Your deposit has been refunded.`,
//           },
//           token: user.fcmToken,
//         };
//         try {
//           await admin.messaging().send(message);
//         } catch (error) {
//           console.error(`Failed to send notification to user ${user._id}: ${error.message}`);
//           // Optionally, remove the invalid token or take other action
//         }
//       }
//     }
//   }

//   item.notifiedLosers = true;
//   await item.save({ session });
// };





const handleLosers = async (item, winnerBid, subcategory, notificationNamespace, session) => {
  const results = await Bid.aggregate([
    {
      $match: { 
        item: item._id, 
        userId: { $ne: winnerBid.userId } // Exclude all bids from the winner
      }
    },
    {
      $group: {
        _id: { userId: "$userId", item: "$item" },
        totalAmount: { $sum: "$amount" },
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $project: {
        totalAmount: 1
      }
    }
  ]).session(session);

  for (const result of results) {
    const deposit = await Deposit.findOne({ userId: result._id.userId, item: item.subcategoryId, status: { $in: ['approved', 'winner', 'refunded'] } }).session(session);
    
    if (deposit) {
      const user = await User.findById(result._id.userId).session(session);
      
      if (deposit.status == 'approved') {
        user.walletBalance += parseInt(deposit.amount);
        user.walletTransactions.push({
          amount: deposit.amount,
          type: 'refund',
          description: `استرداد باقى التامين  ${item.name} فى مزاد ${subcategory.name}`,
        });

        deposit.status = 'refunded';
        await deposit.save({ validateBeforeSave: false, session });
        await user.save({ validateBeforeSave: false, session });
      }

      const loserEntry = new Winner({
        userId: result._id.userId,
        subcategory: item.subcategoryId,
        itemId: item._id,
        amount: result.totalAmount,
        status: 'loser',
      });
      await loserEntry.save({ session });

      notificationNamespace.to(`user_${deposit.userId._id}`).emit('notification', {
        message: `انتهى المزاد  ${subcategory.name} وجارى اعتماد الاسعار للترسية.`,
      });

      if (user && user.fcmToken) {
        const message = {
          notification: {
            title: 'انتهي المزاد',
            body: `انتهى المزاد  ${subcategory.name} وجارى اعتماد الاسعار للترسية.`,
          },
          token: user.fcmToken,
        };
        try {
          await admin.messaging().send(message);
        } catch (error) {
          console.error(`Failed to send notification to user ${user._id}: ${error.message}`);
        }
      }
    }
  }

  item.notifiedLosers = true;
  await item.save({ session });
};

const aggregateSubcategoryResults = async (session) => {
  try {
    const results = await Winner.aggregate([
      { $match: { processed: false } },
      {
        $group: {
          _id: { userId: "$userId", subcategory: "$subcategory", status: "$status" },
          winnerIds: { $push: "$_id" },
          totalAmount: { $sum: { $cond: { if: { $eq: ["$status", "winner"] }, then: "$amount", else: 0 } } },
        }
      },
      {
        $group: {
          _id: { userId: "$_id.userId", subcategory: "$_id.subcategory" },
          results: {
            $push: {
              status: "$_id.status",
              winnerIds: "$winnerIds",
              totalAmount: "$totalAmount"
            }
          }
        }
      },
      {
        $project: {
          userId: "$_id.userId",
          subcategory: "$_id.subcategory",
          results: 1
        }
      }
    ]).session(session);

    for (const result of results) {
      for (const res of result.results) {
        const subcategoryResult = new SubcategoryResult({
          userId: result.userId,
          subcategory: result.subcategory,
          totalAmount: res.status === 'winner' ? res.totalAmount : null,
          status: res.status,
          results: res.winnerIds,
        });
        await subcategoryResult.save({ session });

        await Winner.updateMany(
          { _id: { $in: res.winnerIds } },
          { $set: { processed: true } },
          { session }
        );
      }
    }

    logger.info('Subcategory results aggregation completed.');
  } catch (error) {
    logger.error('Error aggregating subcategory results:', error);
    throw error;
  }
};

const setupNotificationInterval = (notificationNamespace) => {
  setInterval(() => notifyAuctionEvents(notificationNamespace), 10 * 1000);
};

module.exports = {
  createNotificationNamespace,
  setupNotificationInterval,
  notifyAuctionEvents
};