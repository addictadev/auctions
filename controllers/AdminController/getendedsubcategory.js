
const mongoose = require('mongoose');
const Bid = require('../../models/Bid');
const Item = require('../../models/item');
const Winner = require('../../models/Winner');
const Subcategory = require('../../models/subcategory');
const SubcategoryResult =require('../../models/SubcategoryResult');
const Payment = require('../../models/Payment');
const { ObjectId } = require('mongodb');
const Notification = require('../../models/notification');
const admin = require('../../firebase/firebaseAdmin');  
const Deposit = require('../../models/Deposit');
exports.getEndedSubcategories = async (req, res) => {
  try {
    const endedSubcategories = await Subcategory.aggregate([
      {
        $match: {
          endDate: { $lt: new Date() },
        },
      },
      {
        $lookup: {
          from: 'bids',
          localField: '_id',
          foreignField: 'subcategory',
          as: 'bids',
        },
      },
      {
        $lookup: {
          from: 'items',
          localField: '_id',
          foreignField: 'subcategoryId',
          as: 'items',
        },
      },
      {
        $lookup: {
          from: 'winners',
          localField: '_id',
          foreignField: 'subcategory',
          as: 'winners',
        },
      },
      {
        $addFields: {
          totalBids: { $size: '$bids' },
          totalBidAmount: { $sum: '$bids.amount' },
          totalWinners: {
            $size: {
              $filter: {
                input: '$winners',
                as: 'winner',
                cond: { $eq: ['$$winner.status', 'winner'] },
              },
            },
          },
          totalLosers: {
            $size: {
              $filter: {
                input: '$winners',
                as: 'winner',
                cond: { $eq: ['$$winner.status', 'loser'] },
              },
            },
          },
          itemCount: { $size: '$items' },
        },
      },
      {
        $sort: { endDate: -1 },
      },
      {
        $project: {
          name: 1,
          description: 1,
          endDate: 1,
                    imagecover: 1,
          startDate: 1,
          totalBids: 1,
          totalBidAmount: 1,
          totalWinners: 1,
          totalLosers: 1,
          itemCount: 1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: endedSubcategories,
    });
  } catch (error) {
    console.error('Error fetching ended subcategories:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};


















// exports.getEndedSubcategories = async (req, res) => {
//   try {
//     const endedSubcategories = await Subcategory.aggregate([
//       {
//         $match: {
//           endDate: { $lt: new Date() },
//         },
//       },
//       {
//         $lookup: {
//           from: 'bids',
//           localField: '_id',
//           foreignField: 'subcategory',
//           as: 'bids',
//         },
//       },
//       {
//         $lookup: {
//           from: 'items',
//           localField: '_id',
//           foreignField: 'subcategoryId',
//           as: 'items',
//         },
//       },
//       {
//         $lookup: {
//           from: 'winners',
//           localField: '_id',
//           foreignField: 'subcategory',
//           as: 'winners',
//         },
//       },
//       {
//         $addFields: {
//           totalBids: { $size: '$bids' },
//           totalBidAmount: { $sum: '$bids.amount' },
//           totalWinners: {
//             $size: {
//               $filter: {
//                 input: '$winners',
//                 as: 'winner',
//                 cond: { $eq: ['$$winner.status', 'winner'] },
//               },
//             },
//           },
//           totalLosers: {
//             $size: {
//               $filter: {
//                 input: '$winners',
//                 as: 'winner',
//                 cond: { $eq: ['$$winner.status', 'loser'] },
//               },
//             },
//           },
//           itemCount: { $size: '$items' },
//         },
//       },
//       {
//         $sort: { endDate: -1 },
//       },
//       {
//         $project: {
//           _id: 1,
//           name: 1,
//           description: 1,
//           deposit: 1,
//           fileprice: 1,
//           notifiedStart: 1,
//           notifiedEnd: 1,
//           files: 1,
//           categoryId: 1,
//           seletedtoslider: 1,
//           imagecover: 1,
//           startDate: 1,
//           endDate: 1,
//           totalBids: 1,
//           totalBidAmount: 1,
//           totalWinners: 1,
//           totalLosers: 1,
//           itemCount: 1,
//           items: 1,
//         },
//       },
//     ]);

//     res.status(200).json({
//       status: 'success',
//       data: endedSubcategories,
//     });
//   } catch (error) {
//     console.error('Error fetching ended subcategories:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Internal server error',
//     });
//   }
// };























exports.getItemsBySubcategory = async (req, res) => {
    const { subcategoryId } = req.params;
  
    if (!subcategoryId) {
      return res.status(400).json({ status: 'error', message: 'Subcategory ID is required' });
    }
  
    try {
      const items = await Item.aggregate([
        { $match: { subcategoryId:new mongoose.Types.ObjectId(subcategoryId) } },
        {
          $lookup: {
            from: 'bids',
            localField: '_id',
            foreignField: 'item',
            as: 'bids',
          },
        },
        {
          $lookup: {
            from: 'winners',
            localField: '_id',
            foreignField: 'itemId',
            as: 'winners',
          },
        },
        {
          $addFields: {
            totalBids: { $size: '$bids' },
            totalBidAmount: { $sum: '$bids.amount' },
            totalWinners: {
              $size: {
                $filter: {
                  input: '$winners',
                  as: 'winner',
                  cond: { $eq: ['$$winner.status', 'winner'] },
                },
              },
            },
            totalLosers: {
              $size: {
                $filter: {
                  input: '$winners',
                  as: 'winner',
                  cond: { $eq: ['$$winner.status', 'loser'] },
                },
              },
            },
            winnerAmount: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$winners',
                      as: 'winner',
                      cond: { $eq: ['$$winner.status', 'winner'] },
                    },
                  },
                  as: 'winner',
                  in: '$$winner.amount',
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            subcategoryId: 1,
            startPrice: 1,
            mainlystartPrice: 1,

            minBidIncrement: 1,
            coverphoto: 1,
            status: 1,
            notifiedWinner: 1,
            notifiedLosers: 1,
            commission1: 1,
            commission2: 1,
            commission3: 1,
            thubnailphoto: 1,
            totalBids: 1,
            totalBidAmount: 1,
            totalWinners: 1,
            totalLosers: 1,
            winnerAmount: 1,
          },
        },
      ]);
  
      res.status(200).json({
        status: 'success',
        data: items,
      });
    } catch (error) {
      console.error('Error fetching items by subcategory:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  };






















  exports.getWinnersOrLosersByItem = async (req, res) => {
    const { itemId, status } = req.params;
  
    if (!itemId || !status) {
      return res.status(400).json({ status: 'error', message: 'Item ID and status are required' });
    }
  
    try {
      const winnersOrLosers = await Winner.find({ itemId, status })
        .populate('userId', 'name email phoneNumber fcmToken')
        .populate('itemId', 'name');

      res.status(200).json({
        status: 'success',
        data: winnersOrLosers,
      });
    } catch (error) {
      console.error('Error fetching winners or losers:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  };



















  
// exports.adminActionOnWinner = async (req, res) => {
//     const { winnerId, action } = req.body;
  
//     if (!winnerId || !action) {
//       return res.status(400).json({ status: 'error', message: 'Winner ID and action are required' });
//     }
  
//     const session = await mongoose.startSession();
//     session.startTransaction();
  
//     try {
//       const winner = await Winner.findById(winnerId).populate('userId').populate('itemId').session(session);
  
//       if (!winner) {
//         return res.status(404).json({ status: 'error', message: 'Winner not found' });
//       }
  
//       const user = winner.userId;
//       const item = winner.itemId;
//       const subcategory = winner.subcategory;
//       let message;
  
//       switch (action) {
//         case 'approve':
//           winner.adminApproval = true;
//           message = 'Your winning bid has been approved.';
//           break;
//         case 'reject':
//         case 'cancel':
//           winner.status = action === 'reject' ? 'rejected' : 'cancelled';
//           item.status = 'cancelled';
//           message = 'Your winning bid has been rejected or cancelled.';
  
//           // Remove winner from SubcategoryResult
//           const subcategoryResult = await SubcategoryResult.findOne({ userId: user._id, subcategory: subcategory }).session(session);
//           subcategoryResult.results.pull(winnerId);
//           subcategoryResult.totalAmount -= winner.amount;
          
//           if (subcategoryResult.results.length === 0) {
//             subcategoryResult.status = 'loser';
//             subcategoryResult.totalAmount = 0;

//             user.walletBalance += subcategory.deposit;
//             user.walletTransactions.push({
//               amount: subcategory.deposit,
//               type: 'refund',
//               description: `Refund for ${action === 'reject' ? 'rejected' : 'cancelled'} bid on item ${item.name}`,
//             });
//           }
          
//           await subcategoryResult.save({validateBeforeSave: false});
//           await item.save({validateBeforeSave: false});
//           break;
//         default:
//           return res.status(400).json({ status: 'error', message: 'Invalid action' });
//       }
  
//       await winner.save({validateBeforeSave: false});
//       await user.save({validateBeforeSave: false});
  
//       // Send notification using Firebase
//       if (user.fcmToken) {
//         const firebaseMessage = {
//           notification: {
//             title: 'Bid Status Update',
//             body: message,
//           },
//           token: user.fcmToken,
//         };
//         await admin.messaging().send(firebaseMessage);
//       }
  
//       // Create notification in the database
//       await Notification.create({
//         userId: user._id,
//         message,
//       });
  
//       await session.commitTransaction();
//       session.endSession();
  
//       res.status(200).json({
//         status: 'success',
//         message: `Winner has been ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'cancelled'}.`,
//         data: winner,
//       });
//     } catch (error) {
//       await session.abortTransaction();
//       session.endSession();
//       console.error('Error performing admin action on winner:', error);
//       res.status(500).json({
//         status: 'error',
//         message: 'Internal server error',
//       });
//     }
//   };



















// Admin action on winners

// exports.adminActionOnWinner = async (req, res) => {
//   const { winnerId, action } = req.body;

//   if (!winnerId || !action) {
//     return res.status(400).json({ status: 'error', message: 'Winner ID and action are required' });
//   }

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const winner = await Winner.findById(winnerId).populate('userId').populate('itemId').session(session);

//     if (!winner) {
//       return res.status(404).json({ status: 'error', message: 'Winner not found' });
//     }
// if ( winner.status==action){
//     return res.status(400).json({ status: 'error', message: 'Winner already has the status you are trying to set' });
// }
//     const user = winner.userId;
//     const item = winner.itemId;
//     const subcategory = winner.subcategory;
//     let message;
// console.log(action)
//     switch (action) {
//       case 'approve':
//         winner.adminApproval = true;
//         message = 'Your winning bid has been approved.';
//         break;
//       case 'rejected':
//       case 'cancelled':
//         winner.status = action === 'rejected' ? 'rejected' : 'cancelled';
//         item.status = 'cancelled';
//         message = 'Your winning bid has been rejected or cancelled.';

//         // Remove winner from SubcategoryResult
//         const subcategoryResult = await SubcategoryResult.findOne({ userId: user._id, subcategory: subcategory }).session(session);

//         if (subcategoryResult.results.includes(winnerId)) {
//           subcategoryResult.results.pull(winnerId);
//           subcategoryResult.totalAmount -= winner.amount;
          
//           if (subcategoryResult.results.length === 0) {
//             subcategoryResult.status = 'loser';
//             subcategoryResult.totalAmount = 0;

//             user.walletBalance += subcategory.deposit;
//             user.walletTransactions.push({
//               amount: subcategory.deposit,
//               type: 'refund',
//               description: `Refund for ${action === 'reject' ? 'rejected' : 'cancelled'} bid on item ${item.name}`,
//             });
//           }

//           await subcategoryResult.save({ validateBeforeSave: false });
//           await item.save({ validateBeforeSave: false });
//         }
//         break;
//       default:
//         return res.status(400).json({ status: 'error', message: 'Invalid action' });
//     }

//     await winner.save({ validateBeforeSave: false });
//     await user.save({ validateBeforeSave: false });

//     // Send notification using Firebase
//     if (user.fcmToken) {
//       const firebaseMessage = {
//         notification: {
//           title: 'Bid Status Update',
//           body: message,
//         },
//         token: user.fcmToken,
//       };
//       await admin.messaging().send(firebaseMessage);
//     }

//     // Create notification in the database
//     await Notification.create({
//       userId: user._id,
//       message,
//     });

//     await session.commitTransaction();
//     session.endSession();

//     res.status(200).json({
//       status: 'success',
//       message: `Winner has been ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'cancelled'}.`,
//       data: winner,
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error('Error performing admin action on winner:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Internal server error',
//     });
//   }
// };
exports.adminActionOnWinner = async (req, res) => {
  const { winnerId, action } = req.body;

  if (!winnerId || !action) {
    return res.status(400).json({ status: 'error', message: 'Winner ID and action are required' });
  }

  try {
    const winner = await Winner.findById(winnerId).populate('userId').populate('itemId');
    if (!winner) {
      return res.status(404).json({ status: 'error', message: 'Winner not found' });
    }

    if (winner.status === action) {
      return res.status(400).json({ status: 'error', message: 'Winner already has the status you are trying to set' });
    }

    const user = winner.userId;
    const item = winner.itemId;
    const subcategory = winner.subcategory;
    const deposit = await Deposit.findOne({ userId: user, item: subcategory })
    .select({ amount: 1, status: 1 });
console.log(deposit.amount);
    let message;
    let type;
    const subcategoryResult = await SubcategoryResult.findOne({ userId: user._id, subcategory: subcategory,status: 'winner' });
    // console.log(action);
    // Perform admin action on the winner
    switch (action) {
      case 'approve':
        winner.adminApproval = true;
        winner.statusadmin = action;
        message = 'مبرووك لقد فزت باللوط بمزاد يمكنك الاناستكمال الدفع والتوجه للاستلام.';
        type='winner';
        if (subcategoryResult && subcategoryResult.results.includes(winner._id)) {
          if (subcategoryResult.results.length > 0) {
            const remainingWinners = await Winner.find({
              _id: { $in: subcategoryResult.results }
            });
            let newTotalAmount = remainingWinners.reduce((sum, winner) => sum + winner.totalPaid, 0);
            // Subtract deposit amount
            console.log(newTotalAmount);

            newTotalAmount -= deposit.amount;
            console.log(newTotalAmount);
            
            
            
            
            subcategoryResult.totalAmount = newTotalAmount;
            await subcategoryResult.save({ validateBeforeSave: false });
            console.log(subcategoryResult);



          }
        }
        break;
        case 'regected':
          case 'cancelled':
            winner.statusadmin = action;
            // winner.status = action;
            item.status = 'cancelled';
            message = 'لم يتم قبول الدفع لخطاء بالبيانات.';
            
            // Remove winner from SubcategoryResult




        if (subcategoryResult && subcategoryResult.results.includes(winner._id)) {
   
          subcategoryResult.results.pull(winnerId);
          if (subcategoryResult.results.length > 0) {
            const remainingWinners = await Winner.find({
              _id: { $in: subcategoryResult.results }
            });
            let newTotalAmount = remainingWinners.reduce((sum, winner) => sum + winner.totalPaid, 0);

            // Subtract deposit amount
            newTotalAmount -= deposit.amount;



            subcategoryResult.totalAmount = newTotalAmount;
            await subcategoryResult.save({ validateBeforeSave: false });



          }
          if (subcategoryResult.results.length === 0) {
            subcategoryResult.status = 'loser';
            subcategoryResult.totalAmount = 0;

            // user.walletBalance += subcategory.deposit;
            // user.walletTransactions.push({
            //   amount: subcategory.deposit,
            //   type: 'refund',
            //   description: `Refund for ${action === 'regected' ? 'regected' : 'cancelled'} bid on item ${item.name}`,
            // });
          }

          await subcategoryResult.save({ validateBeforeSave: false });
        }

        await item.save({ validateBeforeSave: false });
        break;
      default:
        return res.status(400).json({ status: 'error', message: 'Invalid action' });
    }

    await winner.save({ validateBeforeSave: false });
    await user.save({ validateBeforeSave: false });

    // Send notification using Firebase
    if (user.fcmToken) {
      const firebaseMessage = {
        notification: {
          title: 'حالة الدفع ',
          body: message,
        },
        token: user.fcmToken,
      };
    
      try {
        await admin.messaging().send(firebaseMessage);
      } catch (firebaseError) {
        // Handle specific FCM token errors
        if (firebaseError.errorInfo.code === 'messaging/registration-token-not-registered') {
          // Token is invalid, remove it from the user's record
          user.fcmToken = null;
          await user.save({ validateBeforeSave: false });
          console.log(`Removed invalid FCM token for user ${user._id}`);
        } else {
          console.error('Error sending Firebase notification:', firebaseError);
        }
      }
    }
    // Create notification in the database
    await Notification.create({
      userId: user._id,
      message,
      type
    });

    res.status(200).json({
      status: 'success',
      message: `Winner has been ${action === 'approve' ? 'approved' : action === 'rejected' ? 'rejected' : 'cancelled'}.`,
      data: winner,
    });
  } catch (error) {
    console.error('Error performing admin action on winner:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
