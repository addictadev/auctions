// const mongoose = require('mongoose');

// const paymentSchema = new mongoose.Schema({
//     winnerid: { type: mongoose.Schema.Types.ObjectId, ref: 'SubcategoryResult', required: true,unique: true },
//   billingMethod: { type: String, enum:['mobile', 'bank', 'instapay','wallet'], required: true },
//   status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'pending' },
//   billImage: {
//     type: {
//         name: String,
//         path: String,
//         pathname: String
//       },
//       required: function () {
//         return this.billingMethod !== 'wallet';
//       },
//   },

// },{
//     timestamps: true, // Automatically adds createdAt and updatedAt fields
// });
// paymentSchema.index({ winnerid: 1 }, { unique: true });

// paymentSchema.pre('find', function(next) {
//     this.populate({
//       path: 'winnerid',
    
//     })
  
//     next();
//   });  
// module.exports = mongoose.model('Payment', paymentSchema);


// const mongoose = require('mongoose');
// const Payment = require('../models/paymentModel');
// const Subcategory = require('../models/subcategory');
// const AppError = require('../utils/appError');

// const paymentSchema = new mongoose.Schema({
//   winnerid: { type: mongoose.Schema.Types.ObjectId, ref: 'SubcategoryResult', required: true, unique: true },
//   billingMethod: { type: String, enum: ['mobile', 'bank', 'instapay', 'wallet'], required: true },
//   status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'pending' },
//   billImage: {
//     type: {
//       name: String,
//       path: String,
//       pathname: String
//     },
//     required: function () {
//       return this.billingMethod !== 'wallet';
//     }
//   },
// }, {
//   timestamps: true
// });

// paymentSchema.index({ winnerid: 1 }, { unique: true });

// paymentSchema.pre('save', async function(next) {
//   try {
//     const subcategory = await Subcategory.findById(this.winnerid.subcategory);
//     if (!subcategory.paymentMethods.includes(this.billingMethod)) {
//       return next(new AppError('Invalid payment method for this subcategory', 400));
//     }
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// paymentSchema.pre('find', function(next) {
//   this.populate({
//     path: 'winnerid'
//   });
//   next();
// });

// module.exports = mongoose.model('Payment', paymentSchema);











const mongoose = require('mongoose');
const Subcategory = require('../models/subcategory');
const AppError = require('../utils/appError');

const paymentSchema = new mongoose.Schema({
  winnerid: { type: mongoose.Schema.Types.ObjectId, ref: 'SubcategoryResult', required: true, unique: true },
  billingMethod: { type: String, enum: ['mobile', 'bank', 'instapay', 'wallet'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'pending' },
  billImage: {
    type: {
      name: String,
      path: String,
      pathname: String
    },
    required: function () {
      return this.billingMethod !== 'wallet';
    }
  },
}, {
  timestamps: true
});

// paymentSchema.index({ winnerid: 1 }, { unique: true });

paymentSchema.pre('save', async function(next) {
  this.populate({
    path: 'winnerid',
    // select: 'name'
  });
})


// paymentSchema.pre('save', async function(next) {
//   try {
//     // Find the related subcategory
//     const subcategoryResult = await this.model('SubcategoryResult').findById(this.winnerid).populate('subcategory');
//     const subcategoryId = subcategoryResult.subcategory._id;
    
//     const subcategory = await Subcategory.findById(subcategoryId);

//     // Check if the payment method is allowed in the subcategory
//     const allowedMethods = subcategory.paymentMethods.map(pm => pm.name);
//     if (!allowedMethods.includes(this.billingMethod)) {
//       return next(new AppError('Invalid payment method for this subcategory', 400));
//     }
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

paymentSchema.pre('find', function(next) {
  this.populate({
    path: 'winnerid',
    populate: [
      {
        path: 'userId',
        select: 'name phoneNumber' // Select fields you want from the User model
      },
      {
        path: 'subcategory',
        select: 'name'
      },{
        path: 'results',
      }
    ]
  });
  next();
});
module.exports = mongoose.model('Payment', paymentSchema);
