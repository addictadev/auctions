const Items = require('../models/subcategory');
const User = require('../models/User');
const Deposit = require('../models/Deposit');
const Booking = require('../models/bookenigfile');
const AppError = require('../utils/appError');

const validateDeposit = async (req, res, next) => {
  const { userId, item, billingmethod } = req.body;

  // Validate required fields
  if (!userId || !item || !billingmethod) {
    return next(new AppError('All fields are required.', 400));
  }

  // Check if the item exists and is not expired
  const Item = await Items.findById(item);
  if (!Item || Item.endDate < new Date()) {
    return next(new AppError('Item does not exist or is expired.', 400));
  }

  // Check if the user exists
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if there is already a deposit for this user and item
  // const existingDeposit = await Deposit.findOne({ userId, item });
  // if (existingDeposit) {
  //   return next(new AppError('Deposit already exists for this item and user', 400));
  // }

  // Check if the user has approved booking files
  const bookingFile = await Booking.findOne({ userId, item, status: 'approved' });
  if (!bookingFile) {
    return next(new AppError('No approved booking file found for this item and user', 400));
  }

  // Ensure admin approval is required for non-wallet methods
  if (billingmethod !== 'wallet' && !req.file) {
    return next(new AppError('No file uploaded for billImage', 400));
  }

  req.item = Item;
  req.user = user;
  next();
};

module.exports = validateDeposit;
