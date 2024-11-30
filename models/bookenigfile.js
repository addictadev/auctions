const mongoose = require('mongoose');
// const Item = require('./subcategory'); // Adjust the path as needed
// const Subcategory = require('./subcategory');
const bookingfile = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
  amount:{
type: Number,
required: true,
  },
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
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  billingmethod: { type: String, enum: ['mobile', 'bank', 'instapay','wallet'], required: true },
  seenByadmin: { type: Boolean, default: false },
  seenByuser: { type: Boolean, default: false, select: false },
}, {
  timestamps: true,
});

// Creating a compound index on userId and item to ensure uniqueness
// bookingfile.index({ userId: 1, item: 1,billingmethod:1 }, { unique: true });

// bookingfile.pre('save', async function (next) {
//   // Check if amount is not set or is set to 0
//   console.log("done");

//   // You can add your logic here to calculate or set the amount based on userId, item, etc.
//   const item = await Item.findById(this.item);
//   if (item) {
//     if (item.endDate && item.endDate > Date.now()) {
//       this.amount = item.fileprice; // Set amount to item's depositAmount if not expired
//     } else {
//       throw new Error('المزاد انتهى لا يمكنك شراء كراسة بعد انتهاء المزاد');
//     }
//   }

//   next();
// });

bookingfile.pre('save', async function (next) {
  console.log("done");

  try {
    const Subcategory = mongoose.model('Subcategory');

    // Fetch the item from Subcategory collection
    const item = await Subcategory.findById(this.item); // Ensure Subcategory is used here
    if (item) {
      if (item.endDate && item.endDate > Date.now()) {
        this.amount = item.fileprice; // Set amount to item's fileprice
      } else {
        throw new Error('المزاد انتهى لا يمكنك شراء كراسة بعد انتهاء المزاد');
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

bookingfile.pre('find', function(next) {
  this.populate({
    path: 'userId',
    select: 'name email phoneNumber photo'
  }).populate({
    path: 'item',
    select: 'imagecover name endDate startDate subcategoryId'
  });

  next();
});

bookingfile.pre('findOne', function(next) {
  this.populate({
    path: 'userId',
    select: '-password -salt -__v' // Excluding password, salt, and __v fields
  }).populate({
    path: 'item',
    select: '-__v' // Excluding __v field
  });

  next();
});

const booking = mongoose.model('booking', bookingfile);

module.exports = booking;
