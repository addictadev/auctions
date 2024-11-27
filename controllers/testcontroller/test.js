const mongoose = require('mongoose');
const Bid = require('../../models/Bid');
const Item = require('../../models/item');
const Winner = require('../../models/Winner');
const Subcategory = require('../../models/subcategory');
const SubcategoryResult =require('../../models/SubcategoryResult');
const Payment = require('../../models/Payment');
const Deposit = require('../../models/Deposit');
const factory = require('../../utils/apiFactory');

// exports.SubcategoryResult = factory.getAll(SubcategoryResult);
// exports.SubcategoryResult = async (req, res) => {
//   const subcategoryId = new mongoose.Types.ObjectId(req.params.subcategoryId); // Single subcategoryId from request parameters
//   const statusFilter = req.query.status || 'winner'; // Default status filter is 'winner'

//   try {
//     let itemDetails = await SubcategoryResult.aggregate([
//       { 
//         $match: { 
//           subcategory: subcategoryId,  // Match the single subcategoryId
//           status: 'winner'  // Match the provided status or default to 'winner'
//         }
//       },
//       {
//         $lookup: {
//           from: 'winners',
//           localField: 'results',
//           foreignField: '_id',
//           as: 'winnerDetails',
//         },
//       },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'subcategory',
//           foreignField: '_id',
//           as: 'subcategoryDetails',
//         },
//       },
//       { $unwind: '$subcategoryDetails' },
//       {
//         $lookup: {
//           from: 'categories',
//           localField: 'subcategoryDetails.categoryId',
//           foreignField: '_id',
//           as: 'categoryDetails',
//         },
//       },
//       { $unwind: '$categoryDetails' },
//       {
//         $lookup: {
//           from: 'payments',
//           localField: '_id',
//           foreignField: 'winnerid',
//           as: 'paymentDetails',
//         },
//       },
//       {
//         $lookup: {
//           from: 'items',
//           localField: 'winnerDetails.itemId',
//           foreignField: '_id',
//           as: 'itemDetails',
//         },
//       },
//       {
//         $addFields: {
//           totalAmount: {
//             $sum: {
//               $map: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 in: {
//                   $cond: {
//                     if: {
//                       $or: [
//                         { $eq: ['$$winner.status', 'winner'] },
//                         { $eq: ['$$winner.status', 'winner pending for admin approval'] }
//                       ]
//                     },
//                     then: '$$winner.amount',
//                     else: 0
//                   }
//                 }
//               }
//             }
//           },
//           payed: {
//             $cond: {
//               if: {
//                 $gt: [{
//                   $size: {
//                     $filter: {
//                       input: '$paymentDetails',
//                       as: 'payment',
//                       cond: {
//                         $or: [
//                           { $eq: ['$$payment.status', 'pending'] },
//                           { $eq: ['$$payment.status', 'rejected'] },
//                           { $eq: ['$$payment.status', 'completed'] }
//                         ]
//                       }
//                     }
//                   }
//                 }, 0]
//               },
//               then: {
//                 $cond: {
//                   if: {
//                     $or: [
//                       { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'completed'] },
//                       { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'pending'] },
//                       { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'rejected'] }
//                     ]
//                   },
//                   then: { $arrayElemAt: ['$paymentDetails.status', 0] },
//                   else: false
//                 }
//               },
//               else: false
//             }
//           },
//           items: {
//             $map: {
//               input: '$winnerDetails',
//               as: 'winner',
//               in: {
//                 _id: '$$winner._id',
//                 itemId: '$$winner.itemId',
//                 item: {
//                   $arrayElemAt: [
//                     {
//                       $filter: {
//                         input: '$itemDetails',
//                         as: 'item',
//                         cond: { $eq: ['$$item._id', '$$winner.itemId'] }
//                       }
//                     },
//                     0
//                   ]
//                 },
//                 amount: '$$winner.amount',
//                 status: '$$winner.status',
//                 adminApproval: '$$winner.adminApproval',
//                 paymentDetails: {
//                   $filter: {
//                     input: '$paymentDetails',
//                     as: 'payment',
//                     cond: { $eq: ['$$payment.winnerid', '$$winner._id'] }
//                   }
//                 },
//                 commission1: {
//                   $multiply: [
//                     { $arrayElemAt: ['$itemDetails.startPrice', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] },
//                     { $divide: [{ $arrayElemAt: ['$itemDetails.commission1', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] }, 100] }
//                   ]
//                 },
//                 commission2: {
//                   $multiply: [
//                     { $arrayElemAt: ['$itemDetails.startPrice', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] },
//                     { $divide: [{ $arrayElemAt: ['$itemDetails.commission2', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] }, 100] }
//                   ]
//                 },
//                 commission3: {
//                   $multiply: [
//                     { $arrayElemAt: ['$itemDetails.startPrice', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] },
//                     { $divide: [{ $arrayElemAt: ['$itemDetails.commission3', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] }, 100] }
//                   ]
//                 }
//               }
//             }
//           }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           subcategoryId: '$subcategoryDetails._id',
//           subcategoryName: '$subcategoryDetails.name',
//           categoryName: '$categoryDetails.name',
//           deposit: '$subcategoryDetails.deposit',
//           totalAmount: 1,
//           payed: 1,
//           items: 1
//         }
//       }
//     ]);

//     if (!itemDetails.length) {
//       return res.status(404).json({ message: 'No items found for the specified subcategory and status.' });
//     }

//     res.status(200).json({ status: "success", itemDetails });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };



// exports.SubcategoryResult = async (req, res) => {
//   const subcategoryId = new mongoose.Types.ObjectId(req.params.subcategoryId); // Single subcategoryId from request parameters
//   const statusFilter = req.query.status || 'winner'; // Default status filter is 'winner'

//   try {
//     let itemDetails = await SubcategoryResult.aggregate([
//       { 
//         $match: { 
//           subcategory: subcategoryId,  // Match the single subcategoryId
//           status: statusFilter  // Match the provided status or default to 'winner'
//         }
//       },
//       {
//         $lookup: {
//           from: 'winners',
//           localField: 'results',
//           foreignField: '_id',
//           as: 'winnerDetails',
//         },
//       },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'subcategory',
//           foreignField: '_id',
//           as: 'subcategoryDetails',
//         },
//       },
//       { $unwind: '$subcategoryDetails' },
//       {
//         $lookup: {
//           from: 'categories',
//           localField: 'subcategoryDetails.categoryId',
//           foreignField: '_id',
//           as: 'categoryDetails',
//         },
//       },
//       { $unwind: '$categoryDetails' },
//       {
//         $lookup: {
//           from: 'payments',
//           localField: '_id',
//           foreignField: 'winnerid',
//           as: 'paymentDetails',
//         },
//       },
//       {
//         $lookup: {
//           from: 'items',
//           localField: 'winnerDetails.itemId',
//           foreignField: '_id',
//           as: 'itemDetails',
//         },
//       },
//       {
//         $lookup: {
//           from: 'users', // Add lookup to get user details
//           localField: 'userId',
//           foreignField: '_id',
//           as: 'userDetails',
//         },
//       },
//       { $unwind: '$userDetails' }, // Ensure single user object
//       {
//         $addFields: {
//           totalAmount: {
//             $sum: {
//               $map: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 in: {
//                   $cond: {
//                     if: { $eq: ['$$winner.status', 'winner'] },
//                     then: '$$winner.amount',
//                     else: 0
//                   }
//                 }
//               }
//             }
//           },
//           payed: {
//             $cond: {
//               if: {
//                 $gt: [{
//                   $size: {
//                     $filter: {
//                       input: '$paymentDetails',
//                       as: 'payment',
//                       cond: {
//                         $or: [
//                           { $eq: ['$$payment.status', 'pending'] },
//                           { $eq: ['$$payment.status', 'rejected'] },
//                           { $eq: ['$$payment.status', 'completed'] }
//                         ]
//                       }
//                     }
//                   }
//                 }, 0]
//               },
//               then: {
//                 $cond: {
//                   if: {
//                     $or: [
//                       { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'completed'] },
//                       { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'pending'] },
//                       { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'rejected'] }
//                     ]
//                   },
//                   then: { $arrayElemAt: ['$paymentDetails.status', 0] },
//                   else: false
//                 }
//               },
//               else: false
//             }
//           },
//           items: {
//             $map: {
//               input: '$winnerDetails',
//               as: 'winner',
//               in: {
//                 _id: '$$winner._id',
//                 itemId: '$$winner.itemId',
//                 item: {
//                   $arrayElemAt: [
//                     {
//                       $filter: {
//                         input: '$itemDetails',
//                         as: 'item',
//                         cond: { $eq: ['$$item._id', '$$winner.itemId'] }
//                       }
//                     },
//                     0
//                   ]
//                 },
//                 amount: '$$winner.amount',
//                 status: '$$winner.status',
//                 adminApproval: '$$winner.adminApproval',
//                 paymentDetails: {
//                   $filter: {
//                     input: '$paymentDetails',
//                     as: 'payment',
//                     cond: { $eq: ['$$payment.winnerid', '$$winner._id'] }
//                   }
//                 },
//                 commission1: {
//                   $multiply: [
//                     { $arrayElemAt: ['$itemDetails.startPrice', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] },
//                     { $divide: [{ $arrayElemAt: ['$itemDetails.commission1', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] }, 100] }
//                   ]
//                 },
//                 commission2: {
//                   $multiply: [
//                     { $arrayElemAt: ['$itemDetails.startPrice', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] },
//                     { $divide: [{ $arrayElemAt: ['$itemDetails.commission2', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] }, 100] }
//                   ]
//                 },
//                 commission3: {
//                   $multiply: [
//                     { $arrayElemAt: ['$itemDetails.startPrice', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] },
//                     { $divide: [{ $arrayElemAt: ['$itemDetails.commission3', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] }, 100] }
//                   ]
//                 }
//               }
//             }
//           }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           subcategoryId: '$subcategoryDetails._id',
//           subcategoryName: '$subcategoryDetails.name',
//           categoryName: '$categoryDetails.name',
//           deposit: '$subcategoryDetails.deposit',
//           totalAmount: 1,
//           payed: 1,
//           items: 1,
//           userName: '$userDetails.name',  // Populate user name
//           userPhone: '$userDetails.phoneNumber', // Populate user phone
//         }
//       }
//     ]);

//     if (!itemDetails.length) {
//       return res.status(404).json({ message: 'No items found for the specified subcategory and status.' });
//     }

//     res.status(200).json({ status: "success", itemDetails });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };




// exports.SubcategoryResult = async (req, res) => {
//   const subcategoryId = new mongoose.Types.ObjectId(req.params.subcategoryId); // Single subcategoryId from request parameters
//   const statusFilter = req.query.status || 'winner'; // Default status filter is 'winner'

//   try {
//     let itemDetails = await SubcategoryResult.aggregate([
//       { 
//         $match: { 
//           subcategory: subcategoryId,  // Match the single subcategoryId
//           status: statusFilter  // Match the provided status or default to 'winner'
//         }
//       },
//       {
//         $lookup: {
//           from: 'winners',
//           localField: 'results',
//           foreignField: '_id',
//           as: 'winnerDetails',
//         },
//       },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'subcategory',
//           foreignField: '_id',
//           as: 'subcategoryDetails',
//         },
//       },
//       { $unwind: '$subcategoryDetails' },
//       {
//         $lookup: {
//           from: 'categories',
//           localField: 'subcategoryDetails.categoryId',
//           foreignField: '_id',
//           as: 'categoryDetails',
//         },
//       },
//       { $unwind: '$categoryDetails' },
//       {
//         $lookup: {
//           from: 'payments',
//           localField: '_id',
//           foreignField: 'winnerid',
//           as: 'paymentDetails',
//         },
//       },
//       {
//         $lookup: {
//           from: 'items',
//           localField: 'winnerDetails.itemId',
//           foreignField: '_id',
//           as: 'itemDetails',
//         },
//       },
//       {
//         $lookup: {
//           from: 'users', // Add lookup to get user details
//           localField: 'userId',
//           foreignField: '_id',
//           as: 'userDetails',
//         },
//       },
//       { $unwind: '$userDetails' }, // Ensure single user object
//       {
//         $addFields: {
//           totalAmount: {
//             $sum: {
//               $map: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 in: {
//                   $cond: {
//                     if: { $eq: ['$$winner.status', 'winner'] },
//                     then: '$$winner.amount',
//                     else: 0
//                   }
//                 }
//               }
//             }
//           },
//           payed: {
//             $cond: {
//               if: {
//                 $gt: [{
//                   $size: {
//                     $filter: {
//                       input: '$paymentDetails',
//                       as: 'payment',
//                       cond: {
//                         $or: [
//                           { $eq: ['$$payment.status', 'pending'] },
//                           { $eq: ['$$payment.status', 'rejected'] },
//                           { $eq: ['$$payment.status', 'completed'] }
//                         ]
//                       }
//                     }
//                   }
//                 }, 0]
//               },
//               then: {
//                 $cond: {
//                   if: {
//                     $or: [
//                       { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'completed'] },
//                       { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'pending'] },
//                       { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'rejected'] }
//                     ]
//                   },
//                   then: { $arrayElemAt: ['$paymentDetails.status', 0] },
//                   else: false
//                 }
//               },
//               else: false
//             }
//           },
//           items: {
//             $map: {
//               input: '$winnerDetails',
//               as: 'winner',
//               in: {
//                 _id: '$$winner._id',
//                 itemId: '$$winner.itemId',
//                 item: {
//                   $arrayElemAt: [
//                     {
//                       $filter: {
//                         input: '$itemDetails',
//                         as: 'item',
//                         cond: { $eq: ['$$item._id', '$$winner.itemId'] }
//                       }
//                     },
//                     0
//                   ]
//                 },
//                 amount: '$$winner.amount',
//                 totalPaid: '$$winner.totalPaid',  // Include totalPaid from the winner schema
//                 status: '$$winner.status',
//                 adminApproval: '$$winner.adminApproval',
//                 paymentDetails: {
//                   $filter: {
//                     input: '$paymentDetails',
//                     as: 'payment',
//                     cond: { $eq: ['$$payment.winnerid', '$$winner._id'] }
//                   }
//                 },
//                 commission1: {
//                   $multiply: [
//                     { $arrayElemAt: ['$itemDetails.startPrice', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] },
//                     { $divide: [{ $arrayElemAt: ['$itemDetails.commission1', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] }, 100] }
//                   ]
//                 },
//                 commission2: {
//                   $multiply: [
//                     { $arrayElemAt: ['$itemDetails.startPrice', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] },
//                     { $divide: [{ $arrayElemAt: ['$itemDetails.commission2', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] }, 100] }
//                   ]
//                 },
//                 commission3: {
//                   $multiply: [
//                     { $arrayElemAt: ['$itemDetails.startPrice', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] },
//                     { $divide: [{ $arrayElemAt: ['$itemDetails.commission3', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] }, 100] }
//                   ]
//                 }
//               }
//             }
//           }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           subcategoryId: '$subcategoryDetails._id',
//           subcategoryName: '$subcategoryDetails.name',
//           categoryName: '$categoryDetails.name',
//           deposit: '$subcategoryDetails.deposit',
//           totalAmount: 1,
//           payed: 1,
//           items: 1,
//           userName: '$userDetails.name',  // Populate user name
//           userPhone: '$userDetails.phoneNumber', // Populate user phone
//         }
//       }
//     ]);

//     if (!itemDetails.length) {
//       return res.status(404).json({ message: 'No items found for the specified subcategory and status.' });
//     }

//     res.status(200).json({ status: "success", itemDetails });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


/////////////////////////////////////////////////////////////////////////////
// new
//the last version
// exports.SubcategoryResult = async (req, res) => {
//   const subcategoryId = new mongoose.Types.ObjectId(req.params.subcategoryId); // Single subcategoryId from request parameters
//   const statusFilter = req.query.status || 'winner'; // Default status filter is 'winner'

//   try {
//     let itemDetails = await SubcategoryResult.aggregate([
//       { 
//         $match: { 
//           subcategory: subcategoryId,  // Match the single subcategoryId
//           status: statusFilter  // Match the provided status or default to 'winner'
//         }
//       },
//       {
//         $lookup: {
//           from: 'winners',
//           localField: 'results',
//           foreignField: '_id',
//           as: 'winnerDetails',
//         },
//       },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'subcategory',
//           foreignField: '_id',
//           as: 'subcategoryDetails',
//         },
//       },
//       { $unwind: '$subcategoryDetails' },
//       {
//         $lookup: {
//           from: 'categories',
//           localField: 'subcategoryDetails.categoryId',
//           foreignField: '_id',
//           as: 'categoryDetails',
//         },
//       },
//       { $unwind: '$categoryDetails' },
//       {
//         $lookup: {
//           from: 'payments',
//           localField: '_id',
//           foreignField: 'winnerid',
//           as: 'paymentDetails',
//         },
//       },
//       {
//         $lookup: {
//           from: 'items',
//           localField: 'winnerDetails.itemId',
//           foreignField: '_id',
//           as: 'itemDetails',
//         },
//       },
//       {
//         $lookup: {
//           from: 'users', // Add lookup to get user details
//           localField: 'userId',
//           foreignField: '_id',
//           as: 'userDetails',
//         },
//       },
//       { $unwind: '$userDetails' }, // Ensure single user object
//       {
//         $addFields: {
//           totalAmount: {
//             $sum: {
//               $map: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 in: {
//                   $cond: {
//                     if: { $eq: ['$$winner.status', 'winner'] },
//                     then: '$$winner.amount',
//                     else: 0
//                   }
//                 }
//               }
//             }
//           },
//           payed: {
//             $cond: {
//               if: {
//                 $gt: [{
//                   $size: {
//                     $filter: {
//                       input: '$paymentDetails',
//                       as: 'payment',
//                       cond: {
//                         $or: [
//                           { $eq: ['$$payment.status', 'pending'] },
//                           { $eq: ['$$payment.status', 'rejected'] },
//                           { $eq: ['$$payment.status', 'completed'] }
//                         ]
//                       }
//                     }
//                   }
//                 }, 0]
//               },
//               then: {
//                 $cond: {
//                   if: {
//                     $or: [
//                       { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'completed'] },
//                       { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'pending'] },
//                       { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'rejected'] }
//                     ]
//                   },
//                   then: { $arrayElemAt: ['$paymentDetails.status', 0] },
//                   else: false
//                 }
//               },
//               else: false
//             }
//           },
//           items: {
//             $filter: {
//               input: {
//                 $map: {
//                   input: '$winnerDetails',
//                   as: 'winner',
//                   in: {
//                     _id: '$$winner._id',
//                     itemId: '$$winner.itemId',
//                     item: {
//                       $arrayElemAt: [
//                         {
//                           $filter: {
//                             input: '$itemDetails',
//                             as: 'item',
//                             cond: { $eq: ['$$item._id', '$$winner.itemId'] }
//                           }
//                         },
//                         0
//                       ]
//                     },
//                     amount: '$$winner.amount',
//                     totalPaid: '$$winner.totalPaid',  // Include totalPaid from the winner schema
//                     status: '$$winner.status',
//                     adminApproval: '$$winner.adminApproval',
//                     paymentDetails: {
//                       $filter: {
//                         input: '$paymentDetails',
//                         as: 'payment',
//                         cond: { $eq: ['$$payment.winnerid', '$$winner._id'] }
//                       }
//                     },
//                     commission1: {
//                       $multiply: [
//                         { $arrayElemAt: ['$itemDetails.startPrice', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] },
//                         { $divide: [{ $arrayElemAt: ['$itemDetails.commission1', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] }, 100] }
//                       ]
//                     },
//                     commission2: {
//                       $multiply: [
//                         { $arrayElemAt: ['$itemDetails.startPrice', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] },
//                         { $divide: [{ $arrayElemAt: ['$itemDetails.commission2', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] }, 100] }
//                       ]
//                     },
//                     commission3: {
//                       $multiply: [
//                         { $arrayElemAt: ['$itemDetails.startPrice', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] },
//                         { $divide: [{ $arrayElemAt: ['$itemDetails.commission3', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] }, 100] }
//                       ]
//                     }
//                   }
//                 }
//               },
//               as: 'item',
//               cond: { $eq: ['$$item.adminApproval', true] } // Only include items where adminApproval is true
//             }
//           }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           subcategoryId: '$subcategoryDetails._id',
//           subcategoryName: '$subcategoryDetails.name',
//           categoryName: '$categoryDetails.name',
//           deposit: '$subcategoryDetails.deposit',
//           totalAmount: 1,
//           payed: 1,
//           items: 1,
//           userName: '$userDetails.name',  // Populate user name
//           userPhone: '$userDetails.phoneNumber',
//           userid: '$userDetails._id', // Populate user phone
//            // Populate user phone
//         }
//       }
//     ]);

//     if (!itemDetails.length) {
//       return res.status(404).json({ message: 'No items found for the specified subcategory and status.' });
//     }

//     res.status(200).json({ status: "success", itemDetails });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

exports.SubcategoryResult = async (req, res) => {
  const subcategoryId = new mongoose.Types.ObjectId(req.params.subcategoryId); // Single subcategoryId from request parameters
  const statusFilter = req.query.status || 'winner'; // Default status filter is 'winner'

  try {
    let itemDetails = await SubcategoryResult.aggregate([
      {
        $match: {
          subcategory: subcategoryId,  // Match the single subcategoryId
          status: statusFilter  // Match the provided status or default to 'winner'
        }
      },
      {
        $lookup: {
          from: 'winners',
          localField: 'results',
          foreignField: '_id',
          as: 'winnerDetails',
        },
      },
      {
        $lookup: {
          from: 'subcategories',
          localField: 'subcategory',
          foreignField: '_id',
          as: 'subcategoryDetails',
        },
      },
      { $unwind: '$subcategoryDetails' },
      {
        $lookup: {
          from: 'categories',
          localField: 'subcategoryDetails.categoryId',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      { $unwind: '$categoryDetails' },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'winnerid',
          as: 'paymentDetails',
        },
      },
      {
        $lookup: {
          from: 'items',
          localField: 'winnerDetails.itemId',
          foreignField: '_id',
          as: 'itemDetails',
        },
      },
      {
        $lookup: {
          from: 'users', // Add lookup to get user details
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' }, // Ensure single user object
      {
        $lookup: {
          from: 'transactions', // Lookup in transactions for userId and subcategory
          let: { userId: '$userDetails._id', subcategoryId: '$subcategoryDetails._id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$userId'] },
                    { $eq: ['$subcategory', '$$subcategoryId'] }
                  ]
                }
              }
            },
            {
              $project: { _id: 1 } // We only need the existence of a transaction, not its details
            }
          ],
          as: 'transactionDetails',
        },
      },
      {
        $addFields: {
          totalAmountfromresulte: {
            $sum: {
              $map: {
                input: '$winnerDetails',
                as: 'winner',
                in: {
                  $cond: {
                    if: { $eq: ['$$winner.status', 'winner'] },
                    then: '$$winner.amount',
                    else: 0
                  }
                }
              }
            }
          },
          payed: {
            $cond: {
              if: {
                $gt: [{
                  $size: {
                    $filter: {
                      input: '$paymentDetails',
                      as: 'payment',
                      cond: {
                        $or: [
                          { $eq: ['$$payment.status', 'pending'] },
                          { $eq: ['$$payment.status', 'rejected'] },
                          { $eq: ['$$payment.status', 'completed'] }
                        ]
                      }
                    }
                  }
                }, 0]
              },
              then: {
                $cond: {
                  if: {
                    $or: [
                      { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'completed'] },
                      { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'pending'] },
                      { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'rejected'] }
                    ]
                  },
                  then: { $arrayElemAt: ['$paymentDetails.status', 0] },
                  else: false
                }
              },
              else: false
            }
          },
          items: {
            $filter: {
              input: {
                $map: {
                  input: '$winnerDetails',
                  as: 'winner',
                  in: {
                    _id: '$$winner._id',
                    itemId: '$$winner.itemId',
                    item: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$itemDetails',
                            as: 'item',
                            cond: { $eq: ['$$item._id', '$$winner.itemId'] }
                          }
                        },
                        0
                      ]
                    },
                    amount: '$$winner.amount',
                    totalPaid: '$$winner.totalPaid',  // Include totalPaid from the winner schema
                    status: '$$winner.status',
                    adminApproval: '$$winner.adminApproval',
                    paymentDetails: {
                      $filter: {
                        input: '$paymentDetails',
                        as: 'payment',
                        cond: { $eq: ['$$payment.winnerid', '$$winner._id'] }
                      }
                    },
                    commission1: {
                      $multiply: [
                        { $arrayElemAt: ['$itemDetails.startPrice', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] },
                        { $divide: [{ $arrayElemAt: ['$itemDetails.commission1', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] }, 100] }
                      ]
                    },
                    commission2: {
                      $multiply: [
                        { $arrayElemAt: ['$itemDetails.startPrice', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] },
                        { $divide: [{ $arrayElemAt: ['$itemDetails.commission2', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] }, 100] }
                      ]
                    },
                    commission3: {
                      $multiply: [
                        { $arrayElemAt: ['$itemDetails.startPrice', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] },
                        { $divide: [{ $arrayElemAt: ['$itemDetails.commission3', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] }, 100] }
                      ]
                    }
                  }
                }
              },
              as: 'item',
              cond: { $eq: ['$$item.adminApproval', true] } // Only include items where adminApproval is true
            }
          },
          refund: {
            $cond: {
              if: { $gt: [{ $size: '$transactionDetails' }, 0] },
              then: true,
              else: false
            }
          },
          
            totalAmount: "$totalAmount" // Simply add totalAmount field here from SubcategoryResult
          
        }
      },
      {
        $project: {
          _id: 0,
          subcategoryId: '$subcategoryDetails._id',
          subcategoryName: '$subcategoryDetails.name',
          categoryName: '$categoryDetails.name',
          deposit: '$subcategoryDetails.deposit',
          totalAmount: 1,
          totalAmountfromresulte:1,
          payed: 1,
          items: 1,
          refund: 1, // Include refund status
          userName: '$userDetails.name',  // Populate user name
          userPhone: '$userDetails.phoneNumber',
          userid: '$userDetails._id', // Populate user phone
        }
      }
    ]);

    if (!itemDetails.length) {
      return res.status(404).json({ message: 'No items found for the specified subcategory and status.' });
    }

    res.status(200).json({ status: "success", itemDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


///////////////////////////////////////////////////////////////////////////////////////





exports.getUserBidHistory = async (req, res) => {
  const userId = req.params.userId;
  const statusFilter = req.query.status; // Get status filter from query parameters

  try {
    // Aggregate user bids by subcategory and item
    let bidHistory = await Bid.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'items',
          localField: 'item',
          foreignField: '_id',
          as: 'item',
        },
      },
      { $unwind: '$item' },
      {
        $lookup: {
          from: 'winners',
          let: { itemId: '$item._id', userId: new mongoose.Types.ObjectId(userId) },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ['$itemId', '$$itemId'] }, { $eq: ['$userId', '$$userId'] }] } } },
            { $project: { status: 1, adminApproval: 1 } },
          ],
          as: 'winner',
        },
      },
      { $unwind: { path: '$winner', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'subcategories',
          localField: 'item.subcategoryId',
          foreignField: '_id',
          as: 'subcategory',
        },
      },
      { $unwind: '$subcategory' },
      {
        $addFields: {
          status: {
            $switch: {
              branches: [
                { case: { $eq: ['$item.status', 'cancelled'] }, then: 'cancelled' },
                { case: { $and: [{ $eq: ['$item.status', 'completed'] }, { $eq: ['$winner.status', 'winner'] }, { $eq: ['$winner.adminApproval', true] }] }, then: 'winner' },
                { case: { $and: [{ $eq: ['$item.status', 'completed'] }, { $eq: ['$winner.status', 'winner'] }, { $eq: ['$winner.adminApproval', false] }] }, then: 'winner pending for admin approval' },
                { case: { $and: [{ $eq: ['$item.status', 'completed'] }, { $eq: ['$winner.status', 'loser'] }] }, then: 'loser' },
                { case: { $eq: ['$item.status', 'inprogress'] }, then: 'inprogress' },
              ],
              default: 'inprogress',
            },
          },
        },
      },
      {
        $group: {
          _id: {
            subcategoryId: '$subcategory._id',
            status: '$status',
          },
          subcategory: { $first: '$subcategory' },
          items: {
            $push: {
              item: '$item',
              status: '$status',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          subcategoryId: '$_id.subcategoryId',
          status: '$_id.status',
          subcategory: 1,
          items: 1,
        },
      },
    ]);

    // Filter the bid history based on the status if the status filter is provided
    if (statusFilter) {
      bidHistory = bidHistory.filter(group => group.status === statusFilter);
    }

    res.status(200).json({ status: "success", count: bidHistory.length, bidHistory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};





// exports.getUserBidHistory = async (req, res) => {
//   const userId = req.params.userId;
//   const statusFilter = req.query.status; // Get status filter from query parameters

//   console.log(userId);


//   try {
//     // Aggregate user bids
//     let bidHistory = await Bid.aggregate([
//       { $match: { userId: new mongoose.Types.ObjectId(userId) } },
//       {
//         $group: {
//           _id: "$item",
//           bids: { $push: "$$ROOT" },
//           totalAmount: { $sum: "$amount" },
//         },
//       },
//       {
//         $lookup: {
//           from: 'items',
//           localField: '_id',
//           foreignField: '_id',
//           as: 'item',
//         },
//       },
//       { $unwind: "$item" },
//       {
//         $lookup: {
//           from: 'winners',
//           let: { itemId: "$_id", userId: new mongoose.Types.ObjectId(userId) },
//           pipeline: [
//             { $match: { $expr: { $and: [{ $eq: ["$itemId", "$$itemId"] }, { $eq: ["$userId", "$$userId"] }] } } },
//             { $project: { status: 1, adminApproval: 1 } },
//           ],
//           as: 'winner',
//         },
//       },
//       { $unwind: { path: "$winner", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'item.subcategoryId',
//           foreignField: '_id',
//           as: 'item.subcategory',
//         },
//       },
//       { $unwind: { path: '$item.subcategory', preserveNullAndEmptyArrays: true } },
//       {
//         $addFields: {
//           status: {
//             $switch: {
            //   branches: [
            //     // If item is cancelled
            //     { case: { $eq: ["$item.status", "cancelled"] }, then: "cancelled" },
            //     // If item is completed and user is a winner and admin approval is true
            //     { case: { $and: [{ $eq: ["$item.status", "completed"] }, { $eq: ["$winner.status", "winner"] }, { $eq: ["$winner.adminApproval", true] }] }, then: "winner" },
            //     // If item is completed and user is a winner but admin approval is false
            //     { case: { $and: [{ $eq: ["$item.status", "completed"] }, { $eq: ["$winner.status", "winner"] }, { $eq: ["$winner.adminApproval", false] }] }, then: "winner pending for admin approval" },
            //     // If item is completed and user is a loser
            //     { case: { $and: [{ $eq: ["$item.status", "completed"] }, { $eq: ["$winner.status", "loser"] }] }, then: "loser" },
            //     // If item is in progress
            //     { case: { $eq: ["$item.status", "inprogress"] }, then: "inprogress" },
            //   ],
            //   default: "inprogress",
            // },
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           item: 1,
//           totalAmount: 1,
//           status: 1,
//         },
//       },
//     ]);

//     // Filter the bid history based on the status if the status filter is provided
//     if (statusFilter) {
//       bidHistory = bidHistory.filter(bid => bid.status === statusFilter);
//     }

//     res.status(200).json({ status:"success",count:bidHistory?.length,bidHistory });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
















// exports.getItemBidDetails = async (req, res) => {
//   const userId = new mongoose.Types.ObjectId(req.params.userId);
//   const itemId = new mongoose.Types.ObjectId(req.params.itemId);

//   try {
//     const itemDetails = await Bid.aggregate([
//       { $match: { item: itemId, userId } },
//       {
//         $group: {
//           _id: "$item",
//           userBids: { $push: "$$ROOT" },
//           totalAmount: { $sum: "$amount" },
//         },
//       },
//       {
//         $lookup: {
//           from: 'items',
//           localField: '_id',
//           foreignField: '_id',
//           as: 'item',
//         },
//       },
//       { $unwind: "$item" },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'item.subcategoryId',
//           foreignField: '_id',
//           as: 'item.subcategory',
//         },
//       },
//       {
//         $lookup: {
//           from: 'deposits',
//           let: { itemId: "$_id", userId: userId },
//           pipeline: [
//             { $match: { $expr: { $and: [{ $eq: ["$item", "$$itemId"] }, { $eq: ["$userId", "$$userId"] }, { $eq: ["$status", "approved"] }] } } },
//             { $project: { amount: 1 } },
//           ],
//           as: 'userDeposit',
//         },
//       },
//       { $unwind: { path: "$userDeposit", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: 'winners',
//           let: { itemId: "$_id", userId: userId },
//           pipeline: [
//             { $match: { $expr: { $and: [{ $eq: ["$itemId", "$$itemId"] }, { $eq: ["$userId", "$$userId"] }] } } },
//             { $project: { amount: 1, status: 1, adminApproval: 1 } },
//           ],
//           as: 'winner',
//         },
//       },
//       { $unwind: { path: "$winner", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: 'bids',
//           localField: '_id',
//           foreignField: 'item',
//           as: 'allBids',
//         },
//       },
//       {
//         $lookup: {
//           from: 'payments',
//           localField: 'winner._id',
//           foreignField: 'winnerid',
//           as: 'payment',
//         },
//       },
//       { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
//       {
//         $addFields: {
//           numUsersBidding: { $size: { $setUnion: ["$allBids.userId", []] } },
//           commission1: { $multiply: ["$item.startPrice", { $divide: ["$item.commission1", 100] }] },
//           commission2: { $multiply: ["$item.startPrice", { $divide: ["$item.commission2", 100] }] },
//           commission3: { $multiply: ["$item.startPrice", { $divide: ["$item.commission3", 100] }] },
//         },
//       },
//       {
//         $addFields: {
//           totalCommissions: {
//             $sum: [
//               { $ifNull: ["$commission1", 0] },
//               { $ifNull: ["$commission2", 0] },
//               { $ifNull: ["$commission3", 0] }
//             ]
//           },
//           finalAmount: {
//             $subtract: [
//               { $add: ["$item.startPrice", "$totalCommissions"] },
//               { $ifNull: ["$userDeposit.amount", 0] }
//             ]
//           }
//         },
//       },
//       {
//         $addFields: {
//           status: {
//             $switch: {
//               branches: [
//                 { case: { $eq: ["$item.status", "cancelled"] }, then: "cancelled" },
//                 { case: { $and: [{ $eq: ["$item.status", "completed"] }, { $eq: ["$winner.status", "winner"] }, { $eq: ["$winner.adminApproval", true] }] }, then: "winner" },
//                 { case: { $and: [{ $eq: ["$item.status", "completed"] }, { $eq: ["$winner.status", "winner"] }, { $eq: ["$winner.adminApproval", false] }] }, then: "winner pending for admin approval" },
//                 { case: { $and: [{ $eq: ["$item.status", "completed"] }, { $eq: ["$winner.status", "loser"] }] }, then: "loser" },
//                 { case: { $eq: ["$item.status", "inprogress"] }, then: "inprogress" },
//               ],
//               default: "inprogress",
//             },
//           },
//           // payedStatus: {
//           //   $cond: {
//           //     if: { $eq: ["$status", "winner"] },
//           //     then: "$payment.status",
//           //     else: "$$REMOVE"
//           //   }
//           // }

//           payedStatus: "$payment.status",

            
          
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           item: 1,
//           userBids: 1,
//           totalAmount: {
//             $cond: {
//               if: {
//                 $or: [
//                   { $eq: ["$status", "winner"] },
//                   { $eq: ["$status", "winner pending for admin approval"] }
//                 ]
//               },
//               then: "$totalAmount",
//               else: "$$REMOVE"
//             }
//           },
//           commission1: {
//             $cond: {
//               if: {
//                 $or: [
//                   { $eq: ["$status", "winner"] },
//                   { $eq: ["$status", "winner pending for admin approval"] }
//                 ]
//               },
//               then: "$commission1",
//               else: "$$REMOVE"
//             }
//           },
//           commission2: {
//             $cond: {
//               if: {
//                 $or: [
//                   { $eq: ["$status", "winner"] },
//                   { $eq: ["$status", "winner pending for admin approval"] }
//                 ]
//               },
//               then: "$commission2",
//               else: "$$REMOVE"
//             }
//           },
//           commission3: {
//             $cond: {
//               if: {
//                 $or: [
//                   { $eq: ["$status", "winner"] },
//                   { $eq: ["$status", "winner pending for admin approval"] }
//                 ]
//               },
//               then: "$commission3",
//               else: "$$REMOVE"
//             }
//           },
//           totalCommissions: {
//             $cond: {
//               if: {
//                 $or: [
//                   { $eq: ["$status", "winner"] },
//                   { $eq: ["$status", "winner pending for admin approval"] }
//                 ]
//               },
//               then: "$totalCommissions",
//               else: "$$REMOVE"
//             }
//           },
//           userDeposit: "$userDeposit.amount",
//           finalAmount: {
//             $cond: {
//               if: {
//                 $or: [
//                   { $eq: ["$status", "winner"] },
//                   { $eq: ["$status", "winner pending for admin approval"] }
//                 ]
//               },
//               then: { $ifNull: ["$winner.amount", "$finalAmount"] },
//               else: "$$REMOVE"
//             }
//           },
//           winnerid: {
//             $cond: {
//               if: {
//                 $or: [
//                   { $eq: ["$status", "winner"] },
//                   { $eq: ["$status", "winner pending for admin approval"] }
//                 ]
//               },
//               then: "$winner._id",
//               else: "$$REMOVE"
//             }
//           },
//           numUsersBidding: 1,
//           status: 1,
//           payedStatus: 1
//         }
//       }
//     ]);

//     if (!itemDetails.length) {
//       return res.status(404).json({ message: 'Item not found or no bids by the user.' });
//     }
// console.log(itemDetails[0].payedStatus)
//     res.status(200).json(itemDetails[0]);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };



































exports.getItemBidDetails = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.params.userId);
  const subcategoryId = new mongoose.Types.ObjectId(req.params.itemId);
  const status = req.query.status; // Get status filter from query parameters

  try {
    const itemDetails = await Bid.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: 'items',
          localField: 'item',
          foreignField: '_id',
          as: 'item',
        },
      },
      { $unwind: '$item' },
      { $match: { 'item.subcategoryId': subcategoryId } },
      {
        $lookup: {
          from: 'winners',
          let: { itemId: '$item._id', userId },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ['$itemId', '$$itemId'] }, { $eq: ['$userId', '$$userId'] }] } } },
            { $project: { amount: 1, status: 1, adminApproval: 1 } },
          ],
          as: 'winner',
        },
      },
      { $unwind: { path: '$winner', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          status: {
            $switch: {
              branches: [
                { case: { $eq: ['$item.status', 'cancelled'] }, then: 'cancelled' },
                { case: { $and: [{ $eq: ['$item.status', 'completed'] }, { $eq: ['$winner.status', 'winner'] }, { $eq: ['$winner.adminApproval', true] }] }, then: 'winner' },
                { case: { $and: [{ $eq: ['$item.status', 'completed'] }, { $eq: ['$winner.status', 'winner'] }, { $eq: ['$winner.adminApproval', false] }] }, then: 'winner pending for admin approval' },
                { case: { $and: [{ $eq: ['$item.status', 'completed'] }, { $eq: ['$winner.status', 'loser'] }] }, then: 'loser' },
                { case: { $eq: ['$item.status', 'inprogress'] }, then: 'inprogress' },
              ],
              default: 'inprogress',
            },
          },
        },
      },
      { $match: { status } },
      {
        $group: {
          _id: {
            subcategoryId: '$item.subcategoryId',
            status: '$status',
          },
          subcategory: { $first: '$item.subcategoryId' },
          items: { $push: '$$ROOT' },
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $lookup: {
          from: 'subcategories',
          localField: 'subcategory',
          foreignField: '_id',
          as: 'subcategory',
        },
      },
      { $unwind: '$subcategory' },
      {
        $project: {
          _id: 0,
          subcategory: '$subcategory',
          status: '$_id.status',
          items: {
            item: '$items.item',
            userBids: '$items.userBids',
            status: '$items.status',
            totalCommissions: {
              $cond: {
                if: {
                  $or: [
                    { $eq: ['$items.status', 'winner'] },
                    { $eq: ['$items.status', 'winner pending for admin approval'] }
                  ]
                },
                then: '$items.totalCommissions',
                else: '$$REMOVE'
              }
            },
            commission1: {
              $cond: {
                if: {
                  $or: [
                    { $eq: ['$items.status', 'winner'] },
                    { $eq: ['$items.status', 'winner pending for admin approval'] }
                  ]
                },
                then: '$items.commission1',
                else: '$$REMOVE'
              }
            },
            commission2: {
              $cond: {
                if: {
                  $or: [
                    { $eq: ['$items.status', 'winner'] },
                    { $eq: ['$items.status', 'winner pending for admin approval'] }
                  ]
                },
                then: '$items.commission2',
                else: '$$REMOVE'
              }
            },
            commission3: {
              $cond: {
                if: {
                  $or: [
                    { $eq: ['$items.status', 'winner'] },
                    { $eq: ['$items.status', 'winner pending for admin approval'] }
                  ]
                },
                then: '$items.commission3',
                else: '$$REMOVE'
              }
            },
            amount: '$items.amount'
          },
          totalAmount: {
            $cond: {
              if: {
                $or: [
                  { $eq: ['$_id.status', 'winner'] },
                  { $eq: ['$_id.status', 'winner pending for admin approval'] }
                ]
              },
              then: '$totalAmount',
              else: '$$REMOVE'
            }
          }
        }
      }
    ]);

    if (!itemDetails.length) {
      return res.status(404).json({ message: 'No items found for the specified subcategory and status.' });
    }

    res.status(200).json({ status: "success", itemDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};















/////////////////////////////////////////////////////////////////////////////////////////////////



// exports.aggregateSubcategoryResults = async (req,res) => {

// const userId = req.params.id;
// const statusFilter = req.query.status; // Get status filter from query parameters
// try {
//   // Aggregate user bid history from SubcategoryResult
//   let bidHistory = await SubcategoryResult.aggregate([
//     { $match: { userId: new mongoose.Types.ObjectId(userId) } },
//     {
//       $lookup: {
//         from: 'subcategories',
//         localField: 'subcategory',
//         foreignField: '_id',
//         as: 'subcategory',
//       },
//     },
//     { $unwind: '$subcategory' },
//     {
//       $lookup: {
//         from: 'winners',
//         localField: 'results',
//         foreignField: '_id',
//         as: 'winnerDetails',
//       },
//     },
//     {
//       $addFields: {
//         approvedWinnerCount: {
//           $size: {
//             $filter: {
//               input: '$winnerDetails',
//               as: 'winner',
//               cond: {
//                 $and: [
//                   { $eq: ['$$winner.status', 'winner'] },
//                   { $eq: ['$$winner.adminApproval', true] }
//                 ]
//               }
//             }
//           }
//         },
//         pendingWinnerCount: {
//           $size: {
//             $filter: {
//               input: '$winnerDetails',
//               as: 'winner',
//               cond: {
//                 $and: [
//                   { $eq: ['$$winner.status', 'winner'] },
//                   { $eq: ['$$winner.adminApproval', false] }
//                 ]
//               }
//             }
//           }
//         },
//         loserCount: {
//           $size: {
//             $filter: {
//               input: '$winnerDetails',
//               as: 'winner',
//               cond: { $eq: ['$$winner.status', 'loser'] }
//             }
//           }
//         },
//         cancelledCount: {
//           $size: {
//             $filter: {
//               input: '$winnerDetails',
//               as: 'winner',
//               cond: { $eq: ['$$winner.status', 'cancelled'] }
//             }
//           }
//         },
//         inProgressCount: {
//           $size: {
//             $filter: {
//               input: '$winnerDetails',
//               as: 'winner',
//               cond: { $eq: ['$$winner.status', 'inprogress'] }
//             }
//           }
//         }
//       }
//     },
//     {
//       $group: {
//         _id: {
//           subcategoryId: '$subcategory._id',
//           subcategoryName: '$subcategory.name'
//         },
//         totalItems: { $sum: 1 },
//         approvedWinnerCount: { $sum: '$approvedWinnerCount' },
//         pendingWinnerCount: { $sum: '$pendingWinnerCount' },
//         loserCount: { $sum: '$loserCount' },
//         cancelledCount: { $sum: '$cancelledCount' },
//         inProgressCount: { $sum: '$inProgressCount' },
//         items: { $push: '$$ROOT' }
//       }
//     },
//     {
//       $project: {
//         _id: 0,
//         subcategoryId: '$_id.subcategoryId',
//         subcategoryName: '$_id.subcategoryName',
//         totalItems: 1,
//         approvedWinnerCount: 1,
//         pendingWinnerCount: 1,
//         loserCount: 1,
//         cancelledCount: 1,
//         inProgressCount: 1,
//         items: 1,
//         itemCount: { $size: "$items" } // Add item count for each subcategory
//       }
//     }
//   ]);

//   // Apply status filter if provided
//   if (statusFilter) {
//     bidHistory = bidHistory.map(group => {
//       group.items = group.items.filter(item => item.status === statusFilter);
//       return group;
//     }).filter(group => group.items.length > 0);
//   }

//   res.status(200).json({ status: "success", count: bidHistory.length, bidHistory:bidHistory[0] });
// } catch (error) {
//   console.error(error);
//   res.status(500).json({ message: 'Internal server error' });
// }

// };



///////////////////////////////////////////////////////////ever subcategory splited////////////////////

// exports.aggregateSubcategoryResults = async (req, res) => {
//     const userId = req.params.id;

//     try {
//         // Get approved winners
//         const approvedWinners = await Winner.aggregate([
//             { $match: { userId:new mongoose.Types.ObjectId(userId), status: 'winner', adminApproval: true } },
//             {
//                 $group: {
//                     _id: { subcategoryId: '$subcategory', subcategoryName: '$subcategoryName' },
//                     items: { $push: '$$ROOT' },
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         // Get pending winners
//         const pendingWinners = await Winner.aggregate([
//             { $match: { userId:new mongoose.Types.ObjectId(userId), status: 'winner', adminApproval: false } },
//             {
//                 $group: {
//                     _id: { subcategoryId: '$subcategory', subcategoryName: '$subcategoryName' },
//                     items: { $push: '$$ROOT' },
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         // Get losers
//         const losers = await Winner.aggregate([
//             { $match: { userId:new mongoose.Types.ObjectId(userId), status: 'loser' } },
//             {
//                 $group: {
//                     _id: { subcategoryId: '$subcategory', subcategoryName: '$subcategoryName' },
//                     items: { $push: '$$ROOT' },
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         // Get cancelled
//         const cancelled = await Winner.aggregate([
//             { $match: { userId:new mongoose.Types.ObjectId(userId), status: 'cancelled' } },
//             {
//                 $group: {
//                     _id: { subcategoryId: '$subcategory', subcategoryName: '$subcategoryName' },
//                     items: { $push: '$$ROOT' },
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         // Get in progress
//         const inProgress = await Bid.aggregate([
//             {
//                 $match: {
//                     userId: new mongoose.Types.ObjectId(userId),
//                     status: 'inprogress',
//                     endDate: { $gt: new Date() }
//                 }
//             },
//             {
//                 $group: {
//                     _id: { subcategoryId: '$subcategory', subcategoryName: '$subcategoryName' },
//                     items: { $push: '$$ROOT' },
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         // Get rejected
//         const rejected = await Winner.aggregate([
//             { $match: { userId:new mongoose.Types.ObjectId(userId), status: 'regected' } },
//             {
//                 $group: {
//                     _id: { subcategoryId: '$subcategory', subcategoryName: '$subcategoryName' },
//                     items: { $push: '$$ROOT' },
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         // Combine results into a single object
//         const bidHistory = {
//             approvedWinners,
//             pendingWinners,
//             losers,
//             cancelled,
//             inProgress,
//             rejected
//         };

//         res.status(200).json({ status: "success", bidHistory });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };


//////////////////////////////////////////////////////////////////////////////////////////////////////////

// exports.aggregateSubcategoryResults = async (req, res) => {
//     const userId = req.params.id;

//     try {
//         // Get approved winners
//         const approvedWinners = await SubcategoryResult.aggregate([
//             { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'winner' } },
//             {
//                 $lookup: {
//                     from: 'winners',
//                     localField: 'results',
//                     foreignField: '_id',
//                     as: 'winnerDetails',
//                 },
//             },
//             {
//                 $addFields: {
//                     approvedWinners: {
//                         $filter: {
//                             input: '$winnerDetails',
//                             as: 'winner',
//                             cond: { $and: [{ $eq: ['$$winner.adminApproval', true] }, { $eq: ['$$winner.status', 'winner'] }] }
//                         }
//                     }
//                 }
//             },
//             { $unwind: '$approvedWinners' },
//             {
//                 $group: {
//                     _id: { subcategoryId: '$subcategory', subcategoryName: '$subcategoryName' },
//                     items: { $push: '$$ROOT' },
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         // Get pending winners
//         const pendingWinners = await SubcategoryResult.aggregate([
//             { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'winner' } },
//             {
//                 $lookup: {
//                     from: 'winners',
//                     localField: 'results',
//                     foreignField: '_id',
//                     as: 'winnerDetails',
//                 },
//             },
//             {
//                 $addFields: {
//                     pendingWinners: {
//                         $filter: {
//                             input: '$winnerDetails',
//                             as: 'winner',
//                             cond: { $and: [{ $eq: ['$$winner.adminApproval', false] }, { $eq: ['$$winner.status', 'winner'] }] }
//                         }
//                     }
//                 }
//             },
//             { $unwind: '$pendingWinners' },
//             {
//                 $group: {
//                     _id: { subcategoryId: '$subcategory', subcategoryName: '$subcategoryName' },
//                     items: { $push: '$$ROOT' },
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         // Get losers
//         const losers = await Winner.aggregate([
//             { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'loser' } },
//             {
//                 $group: {
//                     _id: { subcategoryId: '$subcategory', subcategoryName: '$subcategoryName' },
//                     items: { $push: '$$ROOT' },
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         // Get cancelled
//         const cancelled = await Winner.aggregate([
//             { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'cancelled' } },
//             {
//                 $group: {
//                     _id: { subcategoryId: '$subcategory', subcategoryName: '$subcategoryName' },
//                     items: { $push: '$$ROOT' },
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         // Get in progress
//         const inProgress = await Bid.aggregate([
//             {
//                 $match: {
//                     userId: new mongoose.Types.ObjectId(userId),
//                     status: 'inprogress',
//                     endDate: { $gt: new Date() }
//                 }
//             },
//             {
//                 $group: {
//                     _id: { subcategoryId: '$subcategory', subcategoryName: '$subcategoryName' },
//                     items: { $push: '$$ROOT' },
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         // Get rejected
//         const rejected = await Winner.aggregate([
//             { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'rejected' } },
//             {
//                 $group: {
//                     _id: { subcategoryId: '$subcategory', subcategoryName: '$subcategoryName' },
//                     items: { $push: '$$ROOT' },
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         // Combine results into a single object
//         const bidHistory = {
//             approvedWinners,
//             pendingWinners,
//             losers,
//             cancelled,
//             inProgress,
//             rejected
//         };

//         res.status(200).json({ status: "success", bidHistory });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };


//////////////////////////////////////////////////////////////////////////////////////////////////















// exports.aggregateSubcategoryResults = async (req, res) => {
//   const userId = req.params.id;
//   const statusFilter = req.query.status; // Get status filter from query parameters

//   try {
//     // Aggregate user bid history from SubcategoryResult
//     let bidHistory = await SubcategoryResult.aggregate([
//       { $match: { userId: new mongoose.Types.ObjectId(userId) } },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'subcategory',
//           foreignField: '_id',
//           as: 'subcategory',
//         },
//       },
//       { $unwind: '$subcategory' },
//       {
//         $lookup: {
//           from: 'categories',
//           localField: 'subcategory.categoryId',
//           foreignField: '_id',
//           as: 'category',
//         },
//       },
//       { $unwind: '$category' },
//       {
//         $lookup: {
//           from: 'winners',
//           localField: 'results',
//           foreignField: '_id',
//           as: 'winnerDetails',
//         },
//       },
//       {
//         $addFields: {
//           approvedWinnerCount: {
//             $size: {
//               $filter: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 cond: {
//                   $and: [
//                     { $eq: ['$$winner.status', 'winner'] },
//                     { $eq: ['$$winner.adminApproval', true] }
//                   ]
//                 }
//               }
//             }
//           },
//           pendingWinnerCount: {
//             $size: {
//               $filter: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 cond: {
//                   $and: [
//                     { $eq: ['$$winner.status', 'winner'] },
//                     { $eq: ['$$winner.adminApproval', false] }
//                   ]
//                 }
//               }
//             }
//           },
//           loserCount: {
//             $size: {
//               $filter: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 cond: { $eq: ['$$winner.status', 'loser'] }
//               }
//             }
//           },
//           cancelledCount: {
//             $size: {
//               $filter: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 cond: { $eq: ['$$winner.status', 'cancelled'] }
//               }
//             }
//           },
//           inProgressCount: {
//             $size: {
//               $filter: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 cond: { $eq: ['$$winner.status', 'inprogress'] }
//               }
//             }
//           },
//           subcategoryName: '$subcategory.name',
//           categoryName: '$category.name',
//         }
//       },
//       {
//         $group: {
//           _id: {
//             subcategoryId: '$subcategory._id',
//             subcategoryName: '$subcategoryName',
//             categoryName: '$categoryName'
//           },
//           totalItems: { $sum: 1 },
//           approvedWinnerCount: { $sum: '$approvedWinnerCount' },
//           pendingWinnerCount: { $sum: '$pendingWinnerCount' },
//           loserCount: { $sum: '$loserCount' },
//           cancelledCount: { $sum: '$cancelledCount' },
//           inProgressCount: { $sum: '$inProgressCount' },
//           items: { $push: '$$ROOT' }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           subcategoryId: '$_id.subcategoryId',
//           subcategoryName: '$_id.subcategoryName',
//           categoryName: '$_id.categoryName',
//           totalItems: 1,
//           approvedWinnerCount: 1,
//           pendingWinnerCount: 1,
//           loserCount: 1,
//           cancelledCount: 1,
//           inProgressCount: 1,
//           items: 1,
//           itemCount: { $size: "$items" } // Add item count for each subcategory
//         }
//       }
//     ]);

//     // Apply status filter if provided
//     if (statusFilter) {
//       bidHistory = bidHistory.map(group => {
//         group.items = group.items.filter(item => item.status === statusFilter);
//         return group;
//       }).filter(group => group.items.length > 0);
//     }

//     res.status(200).json({ status: "success", count: bidHistory.length, bidHistory: bidHistory });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };




///////////////////////////////////

////////////////////////////this is bet practice//////////////////////

// exports.aggregateSubcategoryResults =  async (req, res) => {
//   const userId =new mongoose.Types.ObjectId(req.params.id);

//   try {
//     // Fetch pending and approved auctions
//     const pendingAndApproved = await SubcategoryResult.aggregate([
//       { $match: { userId, status: 'winner' } },
//       {
//         $lookup: {
//           from: 'winners',
//           localField: 'results',
//           foreignField: '_id',
//           as: 'resultsDetails'
//         }
//       },
//       {
//         $addFields: {
//           status: {
//             $cond: {
//               if: { $eq: [{ $arrayElemAt: ['$resultsDetails.adminApproval', 0] }, false] },
//               then: 'pendingWinner',
//               else: 'approvedWinner'
//             }
//           }
//         }
//       },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'subcategory',
//           foreignField: '_id',
//           as: 'subcategoryDetails'
//         }
//       },
//       {
//         $unwind: '$subcategoryDetails'
//       }
//     ]);

//     // Fetch loser auctions
//     const losers = await Winner.aggregate([
//       { $match: { userId, status: 'loser' } },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'subcategory',
//           foreignField: '_id',
//           as: 'subcategoryDetails'
//         }
//       },
//       {
//         $unwind: '$subcategoryDetails'
//       },
//       {
//         $group: {
//           _id: '$subcategory',
//           count: { $sum: 1 },
//           documents: { $push: '$$ROOT' }
//         }
//       },
//       {
//         $addFields: { status: 'loser' }
//       }
//     ]);

//     // Fetch rejected auctions
//     const rejected = await Winner.aggregate([
//       { $match: { userId, status: 'rejected' } },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'subcategory',
//           foreignField: '_id',
//           as: 'subcategoryDetails'
//         }
//       },
//       {
//         $unwind: '$subcategoryDetails'
//       },
//       {
//         $group: {
//           _id: '$subcategory',
//           count: { $sum: 1 },
//           documents: { $push: '$$ROOT' }
//         }
//       },
//       {
//         $addFields: { status: 'rejected' }
//       }
//     ]);

//     // Fetch cancelled auctions
//     const cancelled = await Winner.aggregate([
//       { $match: { userId, status: 'cancelled' } },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'subcategory',
//           foreignField: '_id',
//           as: 'subcategoryDetails'
//         }
//       },
//       {
//         $unwind: '$subcategoryDetails'
//       },
//       {
//         $group: {
//           _id: '$subcategory',
//           count: { $sum: 1 },
//           documents: { $push: '$$ROOT' }
//         }
//       },
//       {
//         $addFields: { status: 'cancelled' }
//       }
//     ]);

//     // Fetch inprogress auctions
//     const inProgress = await Deposit.aggregate([
//       { $match: { userId, status: 'approved' } },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'item',
//           foreignField: '_id',
//           as: 'subcategoryDetails'
//         }
//       },
//       {
//         $unwind: '$subcategoryDetails'
//       },
//       {
//         $match: { 'subcategoryDetails.endDate': { $gt: new Date() } }
//       },
//       {
//         $group: {
//           _id: '$subcategoryDetails._id',
//           count: { $sum: 1 },
//           documents: { $push: '$$ROOT' }
//         }
//       },
//       {
//         $addFields: { status: 'inprogress' }
//       }
//     ]);

//     // Fetch not started yet auctions
//     const notStartedYet = await Deposit.aggregate([
//       { $match: { userId, status: 'approved' } },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'item',
//           foreignField: '_id',
//           as: 'subcategoryDetails'
//         }
//       },
//       {
//         $unwind: '$subcategoryDetails'
//       },
//       {
//         $match: { 'subcategoryDetails.startDate': { $gt: new Date() } }
//       },
//       {
//         $group: {
//           _id: '$subcategoryDetails._id',
//           count: { $sum: 1 },
//           documents: { $push: '$$ROOT' }
//         }
//       },
//       {
//         $addFields: { status: 'notStartedYet' }
//       }
//     ]);

//     // Combine results
//     const combinedResults = [
//       ...pendingAndApproved,
//       ...losers,
//       ...rejected,
//       ...cancelled,
//       ...inProgress,
//       ...notStartedYet
//     ];

//     // Group by status and count
//     const groupedResults = combinedResults.reduce((acc, result) => {
//       if (!acc[result.status]) {
//         acc[result.status] = { count: 0, subcategories: [] };
//       }
//       acc[result.status].count += 1;
//       acc[result.status].subcategories.push(result);
//       return acc;
//     }, {});

//     // Convert grouped results into a single array
//     const responseArray = Object.entries(groupedResults).map(([status, data]) => ({
//       status,
//       count: data.count,
//       subcategories: data.subcategories
//     }));

//     res.json(responseArray);
//   } catch (error) {
//     console.error('Error fetching auction statuses:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }

///////////////this is the tru












// exports.aggregateSubcategoryResults =   async (req, res) => {
//   const userId = new mongoose.Types.ObjectId(req.params.id);










exports.aggregateSubcategoryResults = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.params.id);

  try {
    // Fetch pending and approved auctions
    const pendingAndApproved = await SubcategoryResult.aggregate([
      { $match: { userId, status: 'winner' } },
      {
        $lookup: {
          from: 'winners',
          localField: 'results',
          foreignField: '_id',
          as: 'resultsDetails'
        }
      },
      {
        $addFields: {
          status: {
            $cond: {
              if: { 
                $anyElementTrue: { 
                  $map: { 
                    input: '$resultsDetails', 
                    as: 'result', 
                    in: { 
                      $and: [
                        { $eq: ['$$result.adminApproval', false] },
                        { $eq: ['$$result.status', 'winner'] }
                      ]
                    }
                  } 
                } 
              },
              then: 'pendingWinner',
              else: 'approvedWinner'
            }
          },
          isWinner: true
        }
      },
      {
        $lookup: {
          from: 'subcategories',
          localField: 'subcategory',
          foreignField: '_id',
          as: 'subcategoryDetails'
        }
      },
      { $unwind: '$subcategoryDetails' },
      {
        $lookup: {
          from: 'items',
          localField: 'resultsDetails.itemId',
          foreignField: '_id',
          as: 'itemDetails'
        }
      }
    ]).catch(error => {
      console.error('Error fetching pending and approved auctions:', error);
      throw new Error('Failed to fetch pending and approved auctions');
    });
    

    // Fetch loser auctions
    const losers = await Winner.aggregate([
      { $match: { userId, status: 'loser' } },
      {
        $lookup: {
          from: 'subcategories',
          localField: 'subcategory',
          foreignField: '_id',
          as: 'subcategoryDetails'
        }
      },
      { $unwind: '$subcategoryDetails' },
      {
        $lookup: {
          from: 'items',
          localField: 'itemId',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      {
        $group: {
          _id: '$subcategory',
          count: { $sum: 1 },
          documents: { $push: '$$ROOT' }
        }
      },
      { $addFields: { status: 'loser' } }
    ]).catch(error => {
      console.error('Error fetching loser auctions:', error);
      throw new Error('Failed to fetch loser auctions');
    });

    // Fetch rejected auctions
    const rejected = await Winner.aggregate([
      { $match: { userId, statusadmin: 'regected' } },
      {
        $lookup: {
          from: 'subcategories',
          localField: 'subcategory',
          foreignField: '_id',
          as: 'subcategoryDetails'
        }
      },
      { $unwind: '$subcategoryDetails' },
      {
        $lookup: {
          from: 'items',
          localField: 'itemId',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      {
        $group: {
          _id: '$subcategory',
          count: { $sum: 1 },
          documents: { $push: '$$ROOT' }
        }
      },
      { $addFields: { status: 'rejected' } }
    ]).catch(error => {
      console.error('Error fetching rejected auctions:', error);
      throw new Error('Failed to fetch rejected auctions');
    });

    // Fetch cancelled auctions
    const cancelled = await Winner.aggregate([
      { $match: { userId, statusadmin: 'cancelled' } },
      {
        $lookup: {
          from: 'subcategories',
          localField: 'subcategory',
          foreignField: '_id',
          as: 'subcategoryDetails'
        }
      },
      { $unwind: '$subcategoryDetails' },
      {
        $lookup: {
          from: 'items',
          localField: 'itemId',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      {
        $group: {
          _id: '$subcategory',
          count: { $sum: 1 },
          documents: { $push: '$$ROOT' }
        }
      },
      { $addFields: { status: 'cancelled' } }
    ]).catch(error => {
      console.error('Error fetching cancelled auctions:', error);
      throw new Error('Failed to fetch cancelled auctions');
    });

    // Fetch in-progress auctions
    const inProgress = await Deposit.aggregate([
      { $match: { userId, status: 'approved' } },
      {
        $lookup: {
          from: 'subcategories',
          localField: 'item',
          foreignField: '_id',
          as: 'subcategoryDetails'
        }
      },
      { $unwind: '$subcategoryDetails' },
      {
        $match: {
          'subcategoryDetails.startDate': { $lte: new Date() },
          'subcategoryDetails.endDate': { $gt: new Date() }
        }
      },
      {
        $group: {
          _id: '$subcategoryDetails._id',
          count: { $sum: 1 },
          documents: { $push: '$subcategoryDetails' }
        }
      },
      { $addFields: { status: 'inprogress' } }
    ]).catch(error => {
      console.error('Error fetching in-progress auctions:', error);
      throw new Error('Failed to fetch in-progress auctions');
    });

    // Fetch not started yet auctions
    const notStartedYet = await Deposit.aggregate([
      { $match: { userId, status: 'approved' } },
      {
        $lookup: {
          from: 'subcategories',
          localField: 'item',
          foreignField: '_id',
          as: 'subcategoryDetails'
        }
      },
      { $unwind: '$subcategoryDetails' },
      {
        $match: { 'subcategoryDetails.startDate': { $gt: new Date() } }
      },
      {
        $group: {
          _id: '$subcategoryDetails._id',
          count: { $sum: 1 },
          documents: { $push: '$subcategoryDetails' }
        }
      },
      { $addFields: { status: 'notStartedYet' } }
    ]).catch(error => {
      console.error('Error fetching not started yet auctions:', error);
      throw new Error('Failed to fetch not started yet auctions');
    });

    // Combine results
    const combinedResults = [
      ...pendingAndApproved,
      ...losers,
      ...rejected,
      ...cancelled,
      ...inProgress,
      ...notStartedYet
    ];

    // Initialize all possible statuses
    const allStatuses = {
      pendingWinner: { count: 0, subcategories: [] },
      approvedWinner: { count: 0, subcategories: [] },
      loser: { count: 0, subcategories: [] },
      rejected: { count: 0, subcategories: [] },
      cancelled: { count: 0, subcategories: [] },
      inprogress: { count: 0, subcategories: [] },
      notStartedYet: { count: 0, subcategories: [] }
    };

    // Group by status and count
    combinedResults.forEach(result => {
      if (!allStatuses[result.status]) {
        allStatuses[result.status] = { count: 0, subcategories: [] };
      }
      allStatuses[result.status].count += 1;
      allStatuses[result.status].subcategories.push(result);
    });

    // Convert grouped results into a single array
    const responseArray = Object.entries(allStatuses).map(([status, data]) => ({
      status,
      count: data.count,
      subcategories: data.subcategories
    }));

    res.json(responseArray);
  } catch (error) {
    console.error('Error fetching auction statuses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};








// exports.aggregateSubcategoryResults =async (req, res) => {
//   const userId = new mongoose.Types.ObjectId(req.params.id);

//   try {
//     // Fetch pending and approved auctions
//     const pendingAndApproved = await SubcategoryResult.aggregate([
//       { $match: { userId, status: 'winner' } },
//       {
//         $lookup: {
//           from: 'winners',
//           localField: 'results',
//           foreignField: '_id',
//           as: 'resultsDetails'
//         }
//       },
//       {
//         $addFields: {
//           status: {
//             $cond: {
//               if: { $anyElementTrue: { $map: { input: '$resultsDetails', as: 'result', in: { $eq: ['$$result.adminApproval', false] } } } },
//               then: 'pendingWinner',
//               else: 'approvedWinner'
//             }
//           }
//         }
//       },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'subcategory',
//           foreignField: '_id',
//           as: 'subcategoryDetails'
//         }
//       },
//       {
//         $unwind: '$subcategoryDetails'
//       },
//       {
//         $lookup: {
//           from: 'items',
//           localField: 'resultsDetails.itemId',
//           foreignField: '_id',
//           as: 'itemDetails'
//         }
//       },
//       {
//         $addFields: {
//           'subcategoryDetails.documents': '$resultsDetails',
//           'subcategoryDetails.status': '$status'
//         }
//       }
//     ]);

//     // Fetch loser auctions
//     const losers = await Winner.aggregate([
//       { $match: { userId, status: 'loser' } },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'subcategory',
//           foreignField: '_id',
//           as: 'subcategoryDetails'
//         }
//       },
//       {
//         $unwind: '$subcategoryDetails'
//       },
//       {
//         $lookup: {
//           from: 'items',
//           localField: 'itemId',
//           foreignField: '_id',
//           as: 'itemDetails'
//         }
//       },
//       {
//         $group: {
//           _id: '$subcategoryDetails._id',
//           count: { $sum: 1 },
//           subcategoryDetails: { $first: '$subcategoryDetails' },
//           documents: { $push: '$$ROOT' }
//         }
//       },
//       {
//         $addFields: {
//           'subcategoryDetails.documents': '$documents',
//           'subcategoryDetails.status': 'loser'
//         }
//       }
//     ]);

//     // Fetch rejected auctions
//     const rejected = await Winner.aggregate([
//       { $match: { userId, status: 'rejected' } },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'subcategory',
//           foreignField: '_id',
//           as: 'subcategoryDetails'
//         }
//       },
//       {
//         $unwind: '$subcategoryDetails'
//       },
//       {
//         $lookup: {
//           from: 'items',
//           localField: 'itemId',
//           foreignField: '_id',
//           as: 'itemDetails'
//         }
//       },
//       {
//         $group: {
//           _id: '$subcategoryDetails._id',
//           count: { $sum: 1 },
//           subcategoryDetails: { $first: '$subcategoryDetails' },
//           documents: { $push: '$$ROOT' }
//         }
//       },
//       {
//         $addFields: {
//           'subcategoryDetails.documents': '$documents',
//           'subcategoryDetails.status': 'rejected'
//         }
//       }
//     ]);

//     // Fetch cancelled auctions
//     const cancelled = await Winner.aggregate([
//       { $match: { userId, status: 'cancelled' } },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'subcategory',
//           foreignField: '_id',
//           as: 'subcategoryDetails'
//         }
//       },
//       {
//         $unwind: '$subcategoryDetails'
//       },
//       {
//         $lookup: {
//           from: 'items',
//           localField: 'itemId',
//           foreignField: '_id',
//           as: 'itemDetails'
//         }
//       },
//       {
//         $group: {
//           _id: '$subcategoryDetails._id',
//           count: { $sum: 1 },
//           subcategoryDetails: { $first: '$subcategoryDetails' },
//           documents: { $push: '$$ROOT' }
//         }
//       },
//       {
//         $addFields: {
//           'subcategoryDetails.documents': '$documents',
//           'subcategoryDetails.status': 'cancelled'
//         }
//       }
//     ]);

//     // Fetch inprogress auctions
//     const inProgress = await Deposit.aggregate([
//       { $match: { userId, status: 'approved' } },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'item',
//           foreignField: '_id',
//           as: 'subcategoryDetails'
//         }
//       },
//       {
//         $unwind: '$subcategoryDetails'
//       },
//       {
//         $match: {
//           'subcategoryDetails.startDate': { $lte: new Date() },
//           'subcategoryDetails.endDate': { $gt: new Date() }
//         }
//       },
//       {
//         $group: {
//           _id: '$subcategoryDetails._id',
//           count: { $sum: 1 },
//           subcategoryDetails: { $first: '$subcategoryDetails' }
//         }
//       },
//       {
//         $addFields: {
//           'subcategoryDetails.status': 'inprogress'
//         }
//       }
//     ]);

//     // Fetch not started yet auctions
//     const notStartedYet = await Deposit.aggregate([
//       { $match: { userId, status: 'approved' } },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'item',
//           foreignField: '_id',
//           as: 'subcategoryDetails'
//         }
//       },
//       {
//         $unwind: '$subcategoryDetails'
//       },
//       {
//         $match: { 'subcategoryDetails.startDate': { $gt: new Date() } }
//       },
//       {
//         $group: {
//           _id: '$subcategoryDetails._id',
//           count: { $sum: 1 },
//           subcategoryDetails: { $first: '$subcategoryDetails' }
//         }
//       },
//       {
//         $addFields: {
//           'subcategoryDetails.status': 'notStartedYet'
//         }
//       }
//     ]);

//     // Combine results
//     const combinedResults = [
//       ...pendingAndApproved,
//       ...losers,
//       ...rejected,
//       ...cancelled,
//       ...inProgress,
//       ...notStartedYet
//     ];

//     // Initialize all possible statuses
//     const allStatuses = {
//       pendingWinner: { count: 0, subcategories: [] },
//       approvedWinner: { count: 0, subcategories: [] },
//       loser: { count: 0, subcategories: [] },
//       rejected: { count: 0, subcategories: [] },
//       cancelled: { count: 0, subcategories: [] },
//       inprogress: { count: 0, subcategories: [] },
//       notStartedYet: { count: 0, subcategories: [] }
//     };

//     // Group by status and count
//     combinedResults.forEach(result => {
//       const status = result.status;
//       const subcategoryDetail = {
//         ...result.subcategoryDetails,
//         count: result.count,
//         ...(result.itemDetails ? { itemDetails: result.itemDetails } : {})
//       };
//       allStatuses[status].count += 1;
//       allStatuses[status].subcategories.push(subcategoryDetail);
//     });

//     // Convert grouped results into a single array
//     const responseArray = Object.entries(allStatuses).map(([status, data]) => ({
//       status,
//       count: data.count,
//       subcategories: data.subcategories
//     }));

//     res.json(responseArray);
//   } catch (error) {
//     console.error('Error fetching auction statuses:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }





// Define the Winner schema





















/////////////////////////////////تقسيم الكاتيجورى


// exports.aggregateSubcategoryResults = async (req, res) => {
//   const userId = req.params.id;
//   const statusFilter = req.query.status; // Get status filter from query parameters

//   try {
//     // Aggregate user bid history from SubcategoryResult
//     let bidHistory = await SubcategoryResult.aggregate([
//       { $match: { userId: new mongoose.Types.ObjectId(userId) } },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'subcategory',
//           foreignField: '_id',
//           as: 'subcategory',
//         },
//       },
//       { $unwind: '$subcategory' },
//       {
//         $lookup: {
//           from: 'categories',
//           localField: 'subcategory.categoryId',
//           foreignField: '_id',
//           as: 'category',
//         },
//       },
//       { $unwind: '$category' },
//       {
//         $lookup: {
//           from: 'winners',
//           localField: 'results',
//           foreignField: '_id',
//           as: 'winnerDetails',
//         },
//       },
//       {
//         $addFields: {
//           approvedWinnerCount: {
//             $size: {
//               $filter: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 cond: {
//                   $and: [
//                     { $eq: ['$$winner.status', 'winner'] },
//                     { $eq: ['$$winner.adminApproval', true] }
//                   ]
//                 }
//               }
//             }
//           },
//           pendingWinnerCount: {
//             $size: {
//               $filter: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 cond: {
//                   $and: [
//                     { $eq: ['$$winner.status', 'winner'] },
//                     { $eq: ['$$winner.adminApproval', false] }
//                   ]
//                 }
//               }
//             }
//           },
//           loserCount: {
//             $size: {
//               $filter: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 cond: { $eq: ['$$winner.status', 'loser'] }
//               }
//             }
//           },
//           cancelledCount: {
//             $size: {
//               $filter: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 cond: { $eq: ['$$winner.status', 'cancelled'] }
//               }
//             }
//           },
//           inProgressCount: {
//             $size: {
//               $filter: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 cond: { $eq: ['$$winner.status', 'inprogress'] }
//               }
//             }
//           },
//           rejectedCount: {
//             $size: {
//               $filter: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 cond: { $eq: ['$$winner.status', 'rejected'] }
//               }
//             }
//           },
//           subcategoryName: '$subcategory.name',
//           categoryName: '$category.name',
//         }
//       },
//       {
//         $group: {
//           _id: {
//             subcategoryId: '$subcategory._id',
//             subcategoryName: '$subcategoryName',
//             categoryName: '$categoryName'
//           },
//           totalItems: { $sum: 1 },
//           approvedWinnerCount: { $sum: '$approvedWinnerCount' },
//           pendingWinnerCount: { $sum: '$pendingWinnerCount' },
//           loserCount: { $sum: '$loserCount' },
//           cancelledCount: { $sum: '$cancelledCount' },
//           inProgressCount: { $sum: '$inProgressCount' },
//           rejectedCount: { $sum: '$rejectedCount' },
//           items: { $push: '$$ROOT' }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           subcategoryId: '$_id.subcategoryId',
//           subcategoryName: '$_id.subcategoryName',
//           categoryName: '$_id.categoryName',
//           totalItems: 1,
//           approvedWinnerCount: 1,
//           pendingWinnerCount: 1,
//           loserCount: 1,
//           cancelledCount: 1,
//           inProgressCount: 1,
//           rejectedCount: 1,
//           items: 1,
//           itemCount: { $size: "$items" } // Add item count for each subcategory
//         }
//       }
//     ]);

//     // Structure the response by status
//     let response = {
//       approved: [],
//       pending: [],
//       loser: [],
//       cancelled: [],
//       inProgress: [],
//       rejected: []
//     };

//     bidHistory.forEach(group => {
//       if (group.approvedWinnerCount > 0) response.approved.push(group);
//       if (group.pendingWinnerCount > 0) response.pending.push(group);
//       if (group.loserCount > 0) response.loser.push(group);
//       if (group.cancelledCount > 0) response.cancelled.push(group);
//       if (group.inProgressCount > 0) response.inProgress.push(group);
//       if (group.rejectedCount > 0) response.rejected.push(group);
//     });

//     // Apply status filter if provided
//     if (statusFilter) {
//       response = { [statusFilter]: response[statusFilter] };
//     }

//     res.status(200).json({ status: "success", response });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };










// exports.getItemBidDetails2 = async (req, res) => {
//   const userId = new mongoose.Types.ObjectId(req.params.userId);
//   const subcategoryResultId = new mongoose.Types.ObjectId(req.params.subcategoryResultId);
//   const statusFilter = req.query.status; // Get status filter from query parameters

//   try {
//     let itemDetails = await SubcategoryResult.aggregate([
//       { $match: { _id: subcategoryResultId, userId } },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'subcategory',
//           foreignField: '_id',
//           as: 'subcategoryDetails',
//         },
//       },
//       { $unwind: '$subcategoryDetails' },
//       {
//         $lookup: {
//           from: 'winners',
//           localField: 'results',
//           foreignField: '_id',
//           as: 'winnerDetails',
//         },
//       },
//       {
//         $lookup: {
//           from: 'payments',
//           localField: '_id',
//           foreignField: 'winnerid',
//           as: 'paymentDetails',
//         },
//       },
//       {
//         $lookup: {
//           from: 'items',
//           localField: 'winnerDetails.itemId',
//           foreignField: '_id',
//           as: 'itemDetails',
//         },
//       },
//       {
//         $addFields: {
//           approvedWinnerCount: {
//             $size: {
//               $filter: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 cond: {
//                   $and: [
//                     { $eq: ['$$winner.status', 'winner'] },
//                     { $eq: ['$$winner.adminApproval', true] }
//                   ]
//                 }
//               }
//             }
//           },
//           pendingWinnerCount: {
//             $size: {
//               $filter: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 cond: {
//                   $and: [
//                     { $eq: ['$$winner.status', 'winner'] },
//                     { $eq: ['$$winner.adminApproval', false] }
//                   ]
//                 }
//               }
//             }
//           },
//           loserCount: {
//             $size: {
//               $filter: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 cond: { $eq: ['$$winner.status', 'loser'] }
//               }
//             }
//           },
//           cancelledCount: {
//             $size: {
//               $filter: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 cond: { $eq: ['$$winner.status', 'cancelled'] }
//               }
//             }
//           },
//           inProgressCount: {
//             $size: {
//               $filter: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 cond: { $eq: ['$$winner.status', 'inprogress'] }
//               }
//             }
//           },
//           totalAmount: {
//             $sum: {
//               $map: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 in: {
//                   $cond: {
//                     if: {
//                       $or: [
//                         { $eq: ['$$winner.status', 'winner'] },
//                         { $eq: ['$$winner.status', 'winner pending for admin approval'] }
//                       ]
//                     },
//                     then: '$$winner.amount',
//                     else: 0
//                   }
//                 }
//               }
//             }
//           },
//           payed: {
//             $cond: {
//               if: {
//                 $gt: [{
//                   $size: {
//                     $filter: {
//                       input: '$paymentDetails',
//                       as: 'payment',
//                       cond: {
//                         $or: [
//                           { $eq: ['$$payment.status', 'pending'] },
//                           { $eq: ['$$payment.status', 'rejected'] },
//                           { $eq: ['$$payment.status', 'completed'] }
//                         ]
//                       }
//                     }
//                   }
//                 }, 0]
//               },
//               then: { 
//                 $cond: {
//                   if: {
//                     $or: [
//                       { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'completed'] },
//                       { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'pending'] },
//                       { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'rejected'] }
//                     ]
//                   },
//                   then: { $arrayElemAt: ['$paymentDetails.status', 0] },
//                   else: false
//                 }
//               },
//               else: false
//             }
//           }
//         }
//       },
//       // {
//       //   $addFields: {
//       //     'winnerDetails.finalStatus': {
//       //       $map: {
//       //         input: '$winnerDetails',
//       //         as: 'winner',
//       //         in: {
//       //           $cond: {
//       //             if: { $eq: ['$$winner.status', 'winner'] },
//       //             then: {
//       //               $cond: {
//       //                 if: { $eq: ['$$winner.adminApproval', true] },
//       //                 then: 'winner and admin approved',
//       //                 else: 'winner pending for admin approval'
//       //               }
//       //             },
//       //             else: '$$winner.status'
//       //           }
//       //         }
//       //       }
//       //     }
//       //   }
//       // },
//       {
//         $project: {
//           _id: 0,
//           subcategoryId: '$subcategoryDetails._id',
//           subcategoryName: '$subcategoryDetails.name',
//           totalItems: { $sum: 1 },
//           approvedWinnerCount: 1,
//           pendingWinnerCount: 1,
//           loserCount: 1,
//           cancelledCount: 1,
//           inProgressCount: 1,
//           totalAmount: 1,
//           payed: 1,
//           items: {
//             _id: 1,
//             itemId: { $arrayElemAt: ['$winnerDetails.itemId', 0] },
//             item: {
//               $arrayElemAt: ['$itemDetails', 0]
//             },
//             amount: '$amount',
//             winnerDetails: '$winnerDetails',
//             paymentDetails: '$paymentDetails' // Include payment details in the output
//           }
//         }
//       }
//     ]);

//     // Apply status filter if provided
//     if (statusFilter) {
//       itemDetails = itemDetails.map(group => {
//         group.items = group.items.filter(item => item.status === statusFilter);
//         return group;
//       }).filter(group => group.items.length > 0);
//     }

//     if (!itemDetails.length) {
//       return res.status(404).json({ message: 'No items found for the specified subcategory result and status.' });
//     }

//     res.status(200).json({ status: "success", itemDetails:itemDetails[0] });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };










// exports.getItemBidDetails2 = async (req, res) => {
//   const userId = new mongoose.Types.ObjectId(req.params.userId);
//   const subcategoryResultId = new mongoose.Types.ObjectId(req.params.subcategoryResultId);
//   const statusFilter = req.query.status; // Get status filter from query parameters

//   try {
//     let itemDetails = await SubcategoryResult.aggregate([
//       { $match: { _id: subcategoryResultId, userId } },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'subcategory',
//           foreignField: '_id',
//           as: 'subcategoryDetails',
//         },
//       },
//       { $unwind: '$subcategoryDetails' },
//       {
//         $lookup: {
//           from: 'winners',
//           localField: 'results',
//           foreignField: '_id',
//           as: 'winnerDetails',
//         },
//       },
//       {
//         $lookup: {
//           from: 'payments',
//           localField: '_id',
//           foreignField: 'winnerid',
//           as: 'paymentDetails',
//         },
//       },
//       {
//         $lookup: {
//           from: 'items',
//           localField: 'winnerDetails.itemId',
//           foreignField: '_id',
//           as: 'itemDetails',
//         },
//       },
//       {
//         $addFields: {
//           approvedWinnerCount: {
//             $size: {
//               $filter: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 cond: {
//                   $and: [
//                     { $eq: ['$$winner.status', 'winner'] },
//                     { $eq: ['$$winner.adminApproval', true] }
//                   ]
//                 }
//               }
//             }
//           },
//           pendingWinnerCount: {
//             $size: {
//               $filter: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 cond: {
//                   $and: [
//                     { $eq: ['$$winner.status', 'winner'] },
//                     { $eq: ['$$winner.adminApproval', false] }
//                   ]
//                 }
//               }
//             }
//           },
//           loserCount: {
//             $size: {
//               $filter: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 cond: { $eq: ['$$winner.status', 'loser'] }
//               }
//             }
//           },
//           cancelledCount: {
//             $size: {
//               $filter: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 cond: { $eq: ['$$winner.status', 'cancelled'] }
//               }
//             }
//           },
//           inProgressCount: {
//             $size: {
//               $filter: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 cond: { $eq: ['$$winner.status', 'inprogress'] }
//               }
//             }
//           },
//           totalAmount: {
//             $sum: {
//               $map: {
//                 input: '$winnerDetails',
//                 as: 'winner',
//                 in: {
//                   $cond: {
//                     if: {
//                       $or: [
//                         { $eq: ['$$winner.status', 'winner'] },
//                         { $eq: ['$$winner.status', 'winner pending for admin approval'] }
//                       ]
//                     },
//                     then: '$$winner.amount',
//                     else: 0
//                   }
//                 }
//               }
//             }
//           },
//           payed: {
//             $cond: {
//               if: {
//                 $gt: [{
//                   $size: {
//                     $filter: {
//                       input: '$paymentDetails',
//                       as: 'payment',
//                       cond: {
//                         $or: [
//                           { $eq: ['$$payment.status', 'pending'] },
//                           { $eq: ['$$payment.status', 'rejected'] },
//                           { $eq: ['$$payment.status', 'completed'] }
//                         ]
//                       }
//                     }
//                   }
//                 }, 0]
//               },
//               then: { 
//                 $cond: {
//                   if: {
//                     $or: [
//                       { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'completed'] },
//                       { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'pending'] },
//                       { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'rejected'] }
//                     ]
//                   },
//                   then: { $arrayElemAt: ['$paymentDetails.status', 0] },
//                   else: false
//                 }
//               },
//               else: false
//             }
//           },
//           totalItems: { $size: '$winnerDetails' },
//           itemIds: {
//             $map: {
//               input: '$winnerDetails',
//               as: 'winner',
//               in: '$$winner.itemId'
//             }
//           }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           subcategoryId: '$subcategoryDetails._id',
//           subcategoryName: '$subcategoryDetails.name',
         
      
          
//           totalItems: 1, // Use calculated totalItems from $addFields
//           approvedWinnerCount: 1,
//           pendingWinnerCount: 1,
//           loserCount: 1,
//           cancelledCount: 1,
//           inProgressCount: 1,
//           totalAmount: 1,
//           payed: 1,
//           items: {
//             $map: {
//               input: '$winnerDetails',
//               as: 'winner',
//               in: {
//                 _id: '$$winner._id',
//                 itemId: '$$winner.itemId',
//                 item: {
//                   $arrayElemAt: [
//                     {
//                       $filter: {
//                         input: '$itemDetails',
//                         as: 'item',
//                         cond: { $eq: ['$$item._id', '$$winner.itemId'] }
//                       }
//                     },
//                     0
//                   ]
//                 },
//                 amount: '$$winner.amount',
//                 status: '$$winner.status',
//                 adminApproval: '$$winner.adminApproval',
//                 paymentDetails: {
//                   $filter: {
//                     input: '$paymentDetails',
//                     as: 'payment',
//                     cond: { $eq: ['$$payment.winnerid', '$$winner._id'] }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     ]);

//     // Apply status filter if provided
//     if (statusFilter) {
//       itemDetails = itemDetails.map(group => {
//         group.items = group.items.filter(item => item.status === statusFilter);
//         return group;
//       }).filter(group => group.items.length > 0);
//     }

//     if (!itemDetails.length) {
//       return res.status(404).json({ message: 'No items found for the specified subcategory result and status.' });
//     }

//     res.status(200).json({ status: "success", itemDetails: itemDetails[0] });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };




// Adjust the path as necessary

exports.getItemBidDetails2 = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.params.userId);
  const subcategoryResultId = new mongoose.Types.ObjectId(req.params.subcategoryResultId);
  const statusFilter = req.query.status; // Get status filter from query parameters

  try {
    let itemDetails = await SubcategoryResult.aggregate([
      { $match: { _id: subcategoryResultId, userId } },
      {
        $lookup: {
          from: 'subcategories',
          localField: 'subcategory',
          foreignField: '_id',
          as: 'subcategoryDetails',
        },
      },
      { $unwind: '$subcategoryDetails' },
      {
        $lookup: {
          from: 'categories',
          localField: 'subcategoryDetails.categoryId',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      { $unwind: '$categoryDetails' },
      {
        $lookup: {
          from: 'winners',
          localField: 'results',
          foreignField: '_id',
          as: 'winnerDetails',
        },
      },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'winnerid',
          as: 'paymentDetails',
        },
      },
      {
        $lookup: {
          from: 'items',
          localField: 'winnerDetails.itemId',
          foreignField: '_id',
          as: 'itemDetails',
        },
      },
      {
        $addFields: {
          approvedWinnerCount: {
            $size: {
              $filter: {
                input: '$winnerDetails',
                as: 'winner',
                cond: {
                  $and: [
                    { $eq: ['$$winner.status', 'winner'] },
                    { $eq: ['$$winner.adminApproval', true] }
                  ]
                }
              }
            }
          },
          pendingWinnerCount: {
            $size: {
              $filter: {
                input: '$winnerDetails',
                as: 'winner',
                cond: {
                  $and: [
                    { $eq: ['$$winner.status', 'winner'] },
                    { $eq: ['$$winner.adminApproval', false] }
                  ]
                }
              }
            }
          },
          loserCount: {
            $size: {
              $filter: {
                input: '$winnerDetails',
                as: 'winner',
                cond: { $eq: ['$$winner.status', 'loser'] }
              }
            }
          },
          cancelledCount: {
            $size: {
              $filter: {
                input: '$winnerDetails',
                as: 'winner',
                cond: { $eq: ['$$winner.status', 'cancelled'] }
              }
            }
          },
          inProgressCount: {
            $size: {
              $filter: {
                input: '$winnerDetails',
                as: 'winner',
                cond: { $eq: ['$$winner.status', 'inprogress'] }
              }
            }
          },
          totalAmountresult: {
            $sum: {
              $map: {
                input: '$winnerDetails',
                as: 'winner',
                in: {
                  $cond: {
                    if: {
                      $or: [
                        { $eq: ['$$winner.status', 'winner'] },
                        { $eq: ['$$winner.status', 'winner pending for admin approval'] }
                      ]
                    },
                    then: '$$winner.amount',
                    else: 0
                  }
                }
              }
            }
          },
          totalAmount: "$totalAmount",
          payed: {
            $cond: {
              if: {
                $gt: [{
                  $size: {
                    $filter: {
                      input: '$paymentDetails',
                      as: 'payment',
                      cond: {
                        $or: [
                          { $eq: ['$$payment.status', 'pending'] },
                          { $eq: ['$$payment.status', 'rejected'] },
                          { $eq: ['$$payment.status', 'completed'] }
                        ]
                      }
                    }
                  }
                }, 0]
              },
              then: {
                $cond: {
                  if: {
                    $or: [
                      { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'completed'] },
                      { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'pending'] },
                      { $eq: [{ $arrayElemAt: ['$paymentDetails.status', 0] }, 'rejected'] }
                    ]
                  },
                  then: { $arrayElemAt: ['$paymentDetails.status', 0] },
                  else: false
                }
              },
              else: false
            }
          },
          totalItems: { $size: '$winnerDetails' },
          itemIds: {
            $map: {
              input: '$winnerDetails',
              as: 'winner',
              in: '$$winner.itemId'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          subcategoryId: '$subcategoryDetails._id',
          subcategoryName: '$subcategoryDetails.name',
          categoryName: '$categoryDetails.name',
          deposit: '$subcategoryDetails.deposit',
          totalItems: 1, // Use calculated totalItems from $addFields
          approvedWinnerCount: 1,
          pendingWinnerCount: 1,
          loserCount: 1,
          totalAmountresult:1,
          cancelledCount: 1,
          inProgressCount: 1,
          totalAmount: 1,
          payed: 1,
          items: {
            $map: {
              input: '$winnerDetails',
              as: 'winner',
              in: {
                _id: '$$winner._id',
                itemId: '$$winner.itemId',
                item: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$itemDetails',
                        as: 'item',
                        cond: { $eq: ['$$item._id', '$$winner.itemId'] }
                      }
                    },
                    0
                  ]
                },
                amount: '$$winner.amount',
                status: '$$winner.status',
                adminApproval: '$$winner.adminApproval',
                paymentDetails: {
                  $filter: {
                    input: '$paymentDetails',
                    as: 'payment',
                    cond: { $eq: ['$$payment.winnerid', '$$winner._id'] }
                  }
                },
                commission1: {
                  $multiply: [
                    { $arrayElemAt: ['$itemDetails.startPrice', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] },
                    { $divide: [{ $arrayElemAt: ['$itemDetails.commission1', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] }, 100] }
                  ]
                },
                commission2: {
                  $multiply: [
                    { $arrayElemAt: ['$itemDetails.startPrice', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] },
                    { $divide: [{ $arrayElemAt: ['$itemDetails.commission2', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] }, 100] }
                  ]
                },
                commission3: {
                  $multiply: [
                    { $arrayElemAt: ['$itemDetails.startPrice', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] },
                    { $divide: [{ $arrayElemAt: ['$itemDetails.commission3', { $indexOfArray: ['$itemDetails._id', '$$winner.itemId'] }] }, 100] }
                  ]
                }
              }
            }
          }
        }
      }
    ]);

    // Apply status filter if provided
    // if (statusFilter) {
    //   itemDetails = itemDetails.map(group => {
    //     group.items = group.items.filter(item => item.status === statusFilter);
    //     return group;
    //   }).filter(group => group.items.length > 0);
    // }
    if (statusFilter) {
      itemDetails = itemDetails.map(group => {
        group.items = group.items.filter(item => item.status === statusFilter);
        return group;
      }).filter(group => group.items.length > 0);
    }
    if (!itemDetails.length) {
      return res.status(404).json({ message: 'No items found for the specified subcategory result and status.' });
    }

    res.status(200).json({ status: "success", itemDetails: itemDetails[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
























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
          _id: 1,
          name: 1,
          description: 1,
          deposit: 1,
          fileprice: 1,
          notifiedStart: 1,
          notifiedEnd: 1,
          files: 1,
          categoryId: 1,
          seletedtoslider: 1,
          imagecover: 1,
          startDate: 1,
          endDate: 1,
          totalBids: 1,
          totalBidAmount: 1,
          totalWinners: 1,
          totalLosers: 1,
          itemCount: 1,
          items: 1,
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
