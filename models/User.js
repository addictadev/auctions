// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const userSchema = new Schema({
//   name: { type: String, required: true },
//   fcmToken: { type: String },
//   isLogin: { type: Boolean, default: false },
//   email: { type: String},
//   specialist: { type: String },
//   companyname: { type: String },
//   address: { type: String },
//   walletBalance: { type: Number, default: 0 },
//   walletTransactions: [{
//     amount: Number,
//     type: { type: String, enum: ['deposit', 'refund', 'winner', 'withdrawal', 'payment', 'charge'] },
//     description: String,
//     timestamp: { type: Date, default: Date.now },
//   }],
//   birthdate: { type: Date},
//   phoneNumber: { type: String, required: true, unique: true },
//   passwordHash: { type: String, required: true },
//   verified: { type: Boolean, default: false },
//   blocked: { type: Boolean, default: false },
//   approved: { type: Boolean, default: false },
//   idbackImage: {
//     type: {
//       name: String,
//       path: String,
//       pathname: String
//     },
//     required: [true, 'Please upload an image for the id back image!'],
//   },
//   profileImage: {
//     type: {
//       name: String,
//       path: String,
//       pathname: String
//     },
//     default: {
//       name: 'default.png',
//       path: 'default.png',
//       pathname: 'default.png'
//     },
//     select: false
//   },
//   idNumber: { type: String, unique: true },
//   idImage: {
//     type: {
//       name: String,
//       path: String,
//       pathname: String
//     },
//     required: [true, 'Please upload an image for the id image!'],
//     unique: true
//   },
// }, {
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true },
//   timestamps: true
// });

// userSchema.virtual('age').get(function () {
//   if (!this.birthdate) {
//     return null;
//   }
//   const today = new Date();
//   const birthDate = new Date(this.birthdate);
//   let age = today.getFullYear() - birthDate.getFullYear();
//   const monthDiff = today.getMonth() - birthDate.getMonth();
//   if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//     age--;
//   }
//   return age;
// });
// const User = mongoose.model('User', userSchema);
// module.exports = User;


const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String,
    required: [true, 'الاسم مطلوب']},
  fcmToken: { type: String },
  isLogin: { type: Boolean, default: false },
  email: { type: String},
  specialist: { type: String },
  companyname: { type: String },
  address: { type: String },
  walletBalance: { type: Number, default: 0 },
  walletTransactions: [{
    amount: Number,
    type: { type: String, enum: ['deposit', 'refund', 'winner', 'withdrawal', 'payment', 'charge'] },
    description: String,
    timestamp: { type: Date, default: Date.now },
  }],
  birthdate: { type: Date },
  phoneNumber: { type: String, required: true, unique: true },
  altphoneNumber: { type: String,default: ''},

  passwordHash: { type: String, required: true },
  verified: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  idbackImage: {
    type: {
      name: String,
      path: String,
      pathname: String
    },
    required: [true, 'Please upload an image for the id back image!'],
  },
  profileImage: {
    type: {
      name: String,
      path: String,
      pathname: String
    },
    default: {
      name: 'default.png',
      path: 'default.png',
      pathname: 'default.png'
    },
    select: false
  },
  idNumber: { type: String, unique: true },
  idImage: {
    type: {
      name: String,
      path: String,
      pathname: String
    },
    required: [true, 'Please upload an image for the id image!'],
    unique: true
  },
  authToken: { type: String, default: null },
  deviceDetails: {
    deviceId: { type: String, default: null },
    brand: { type: String, default: null },
    model: { type: String, default: null },
    version: { type: String, default: null },
  }


}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true
});

userSchema.virtual('age').get(function () {
  if (!this.birthdate) {
    return null;
  }
  const today = new Date();
  const birthDate = new Date(this.birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

const User = mongoose.model('User', userSchema);
module.exports = User;
