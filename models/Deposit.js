// const mongoose = require('mongoose');
// const Item = require('./subcategory'); // Adjust the path as needed

// const depositSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   item: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
//   amount: Number,
//   billImage: {
//     type: {
//         name: String,
//         path: String,
//         pathname: String
//       },
//       required: [true, 'Please upload an image for the Category!'],
//       unique: true
//   },
//   status: { type: String, enum: ['pending', 'approved', 'rejected'],default:"pending" },
//   billingmethod: { type: String, enum: ['fawry', 'cash', 'instapay'],required: true },
//   seenByadmin: { type: Boolean, default: false },
//   seenByuser: { type: Boolean, default: false ,select: false },
// },{
//   timestamps: true,
// });

// // Creating a compound index on userId and item to ensure uniqueness
// depositSchema.index({ userId: 1, item: 1 }, { unique: true });


// depositSchema.pre('save', async function (next) {
//   // Check if amount is not set or is set to 0
//   console.log("done")

//     // You can add your logic here to calculate or set the amount based on userId, item, etc.
//     const item = await Item.findById(this.item);
//     if (item) {
//       // this.amount = item.depositAmount; // Set amount to item's price
//       if (item.endDate && item.endDate > Date.now()) {
//         this.amount = item.deposit; // Set amount to item's depositAmount if not expired
//       } else {
//         throw new Error('Item is expired');
//       }
//     }
  

//   next();
// });


// depositSchema.pre("find", function(next) {
//   this.populate({
//     path: 'userId',
//     select: 'name email photo'
//   }).populate({
//     path: 'item',
//     select: ' imagecover name endDate startDate subcategoryId'
//   });

//   next();
// });


// depositSchema.pre('findOne', function(next) {
//   this.populate({
//     path: 'userId',
//     select: '-password -salt -__v' // Excluding password, salt, and __v fields
//   }).populate({
//     path: 'item',
//     select: '-__v' // Excluding password, salt, and __v fields
   
//   });

//   next();
// });

// const Deposit = mongoose.model('Deposit', depositSchema);

// module.exports = Deposit;

const mongoose = require('mongoose');
const Item = require('./subcategory'); // Adjust the path as needed

const depositSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
  amount: Number,
  billImage: {
    type: {
        name: String,
        path: String,
        pathname: String
      },  
      required: function () {
        return this.billingmethod !== 'wallet';
      },
  },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'refunded','winner',"refunded not join"], default: 'pending' },
  billingmethod: { type: String, enum: ['mobile', 'bank', 'instapay','wallet'], required: true },
  seenByadmin: { type: Boolean, default: false },
  seenByuser: { type: Boolean, default: false, select: false },
}, {
  timestamps: true,
});

// Creating a compound index on userId and item to ensure uniqueness
// depositSchema.index({ userId: 1, item: 1 }, { unique: true });

depositSchema.pre('save', async function (next) {
  // Check if amount is not set or is set to 0
  console.log("done");

  // You can add your logic here to calculate or set the amount based on userId, item, etc.
  // const item = await Item.findById(this.item);
  // if (item) {
  //   if (item.endDate && item.endDate > Date.now()) {
  //     this.amount = item.deposit; // Set amount to item's depositAmount if not expired
  //   } else {
  //     throw new Error('Item is expired');
  //   }
  // }

  next();
});

depositSchema.pre('find', function(next) {
  this.populate({
    path: 'userId',
    select: 'name email photo phoneNumber fcmToken walletTransactions walletBalance'
  }).populate({
    path: 'item',
    select: 'imagecover name endDate startDate subcategoryId '
  });

  next();
});

depositSchema.pre('findOne', function(next) {
  this.populate({
    path: 'userId',
    select: '-password -salt -__v' // Excluding password, salt, and __v fields
  }).populate({
    path: 'item',
    select: '-__v' // Excluding __v field
  });

  next();
});

const Deposit = mongoose.model('Deposit', depositSchema);

module.exports = Deposit;
