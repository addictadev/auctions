


const mongoose = require('mongoose');
const bids =require('./Bid');
const imageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  path: { type: String, required: true },
  pathname: { type: String, required: true }
});

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true
  },
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory',
    required: true
  },
  startPrice: {
    type: Number,
    required: true
  },
  //////////
  mainlystartPrice: {
    type: Number,
    required: true
  },
  minBidIncrement: {
    type: Number,
    required: true
  },
  count_increment: {
    type: Number,
 default: 0
  },
  coverphoto: {
    type: imageSchema,
    required: [true, 'Please upload an image for the coverphoto!'],
  },
  status: {
    type: String,
    enum: ['cancelled', 'inprogress', 'completed'],
    default: 'inprogress'
  },
  notifiedWinner: { type: Boolean, default: false },
  notifiedLosers: { type: Boolean, default: false },
  commission1: Number, 
  commission2: Number, 
  commission3: Number, 
  thubnailphoto: [{
    name: String,
    path: String,
    pathname: String
  }]
  ,


}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true
});
// itemSchema.pre('findOneAndDelete', async function (next) {
//   console.log(this._id)
//   const Subcategory = mongoose.model('Bid');
//   await Subcategory.deleteMany({ item: this._id });

//   console.log("object",Subcategory)
//   return ;
// })
itemSchema.index({ subcategoryId: 1 });
itemSchema.index({ startPrice: 1 });

itemSchema.pre('findOneAndDelete', async function (next) {
  try {
    const itemId = this.getQuery()._id;
    console.log(itemId)
    await bids.deleteMany({ item: itemId });
    next();
  } catch (err) {
    console.log(err)
    next(err);
  }
});
module.exports = mongoose.model('Item', itemSchema);
