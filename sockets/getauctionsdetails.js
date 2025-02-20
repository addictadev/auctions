const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Subcategory = require('../models/subcategory');
const User = require('../models/User');
const Deposit = require('../models/Deposit');

const getauctionsdetails = (io) => {
    const auctiondetails = io.of('/auctiondetails');

    auctiondetails.on('connection', (socket) => {
        console.log('New client connected to auction namespace');
 

        socket.on('getSubcategoryData', async ({ subcategoryId }) => {
            try {
              const data = await Subcategory.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(subcategoryId) } },
                {
                  $lookup: {
                    from: 'items',
                    localField: '_id',
                    foreignField: 'subcategoryId',
                    as: 'items'
                  }
                },
                {
                  $unwind: {
                    path: '$items',
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $lookup: {
                    from: 'bids',
                    localField: 'items._id',
                    foreignField: 'item',
                    as: 'itemBids'
                  }
                },
                {
                  $addFields: {
                    'items.bidCount': { $size: '$itemBids' },
                    'items.bidUserCount': {
                      $size: {
                        $cond: {
                          if: { $isArray: '$itemBids' },
                          then: { $setUnion: '$itemBids.userId' },
                          else: []
                        }
                      }
                    },
                    'items.highestBid': { $max: '$itemBids.amount' },
                    'items.lastBid': { $arrayElemAt: ['$itemBids', -1] }
                  }
                },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'items.lastBid.userId',
                    foreignField: '_id',
                    as: 'lastBidUser'
                  }
                },
                {
                  $unwind: {
                    path: '$lastBidUser',
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $addFields: {
                    'items.lastBid.user': {
                      _id: '$lastBidUser._id',
                      name: '$lastBidUser.name',
                      phoneNumber: '$lastBidUser.phoneNumber'
                    }
                  }
                },
                {
                  $lookup: {
                    from: 'deposits',
                    let: { subcategoryId: '$_id' },
                    pipeline: [
                      { $match: { $expr: { $and: [{ $eq: ['$item', '$$subcategoryId'] }, { $ne: ['$status', 'rejected'] }] } } },
                      { $group: { _id: null, count: { $sum: 1 }, users: { $addToSet: '$userId' } } }
                    ],
                    as: 'approvedDeposits'
                  }
                },
                {
                  $addFields: {
                    totalDepositUsersCount: { $arrayElemAt: ['$approvedDeposits.count', 0] },
                    totalDepositUsers: { $arrayElemAt: ['$approvedDeposits.users', 0] }
                  }
                },
                {
                  $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    description: { $first: '$description' },
                    imagecover: { $first: '$imagecover' },
                    startDate: { $first: '$startDate' },
                    endDate: { $first: '$endDate' },
                    totalBidCount: { $sum: '$items.bidCount' },
                    totalBidUsers: { $addToSet: '$items.lastBid.user._id' },
                    items: { $push: '$items' },
                    totalDepositUsersCount: { $first: '$totalDepositUsersCount' },
                    totalDepositUsers: { $first: '$totalDepositUsers' }
                  }
                },
                {
                  $addFields: {
                    totalBidUsersCount: { $size: '$totalBidUsers' }
                  }
                },
                {
                  $project: {
                    totalBidUsers: 0,
                    totalDepositUsers: 0
                  }
                }
              ]);
          
              if (!data.length) {
              socket.emit('error', 'errors');

              }
              socket.emit('auctionData', data[0]);
            } catch (error) {
              console.error("Error fetching subcategory data:", error);
              socket.emit('error', { message: "Failed to fetch data" });
            }
          });
        });

  };
  
  module.exports = getauctionsdetails;