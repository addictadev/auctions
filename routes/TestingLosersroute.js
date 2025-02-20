const express = require('express');
const mongoose = require('mongoose');
const Subcategory = require('../models/subcategory'); // Adjust your model import
const Item = require('../models/item'); // Adjust your model import
const Bid = require('../models/Bid'); // Adjust your model import
const Deposit = require('../models/Deposit'); // Adjust your model import
const User = require('../models/User'); // Adjust your model import
const Winner = require('../models/Winner'); // Adjust your model import

const router = express.Router();

// The handleLosers function, which you already wrote
const handleLosers = async (
  item,
  winnerBid,
  subcategory,
  notificationNamespace,
  session
) => {
    // console.log("winnerBid",winnerBid.userId)

  const results = await Bid.aggregate([
    {
      $match: {
        item: item._id,
        userId: { $ne: winnerBid.userId }, // Exclude all bids from the winner
      },
    },
    {
      $group: {
        _id: { userId: "$userId", item: "$item" },
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $project: {
        totalAmount: 1,
      },
    },
  ]).session(session);
  console.log("winnerBid",winnerBid)

  console.log("results",results)

  for (const result of results) {
    const deposit = await Deposit.findOne({
      userId: result._id.userId,
      item: item.subcategoryId,
      status: { $in: ['approved', 'winner', 'refunded'] },
    }).session(session);

    if (deposit) {
      const user = await User.findById(result._id.userId).session(session);

      if (deposit.status === 'approved') {
        user.walletBalance += parseInt(deposit.amount);
        user.walletTransactions.push({
          amount: deposit.amount,
          type: 'refund',
          description: `تم رد تامين مزاد ${subcategory.name} بمبلغ ${deposit.amount} لعد الترسية`,

          // description: `Refund for item ${item.name} in subcategory ${subcategory.name}`,
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

    //   notificationNamespace
    //     .to(`user_${deposit.userId._id}`)
    //     .emit('notification', {
    //       message: `The auction for item ${item.name} in subcategory ${subcategory.name} has ended. Your deposit has been refunded.`,
    //     });

      // Handle sending FCM notification if available
      if (user && user.fcmToken) {
        const message = {
          notification: {
            title: 'Auction Ended',
            body: `The auction for item ${item.name} in subcategory ${subcategory.name} has ended. Your deposit has been refunded.`,
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

//   item.notifiedLosers = true;
  await item.save({ session });
};

// Controller to handle the subcategory logic
router.post('/test-subcategory', async (req, res) => {
  const { subcategoryId } = req.body; // Get the subcategoryId from request body
  const session = await mongoose.startSession(); // Start session for transaction
  session.startTransaction();

  try {
    const now = new Date();
    const subcategories = await Subcategory.find({
      _id: subcategoryId,
    //   endDate: { $lte: now },
    //   notifiedEnd: { $ne: true },
    }).session(session);

    for (const subcategory of subcategories) {
      const items = await Item.find({ subcategoryId: subcategory._id }).session(session);
console.log(items.length)
      for (const item of items) {
        const bids = await Bid.find({ item: item._id }).sort({createdAt: -1 }).session(session);
        const winnerBid = bids[0];
        if (winnerBid) {
          await handleLosers(item, winnerBid, subcategory, req.app.get('socketio'), session); // Send notificationNamespace as socketio instance
        }
      }

      subcategory.notifiedEnd = true;
      await subcategory.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: 'Subcategory processed successfully' });
  } catch (error) {
    console.log(error)
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Error processing subcategory', error });
  }
});

module.exports = router;
