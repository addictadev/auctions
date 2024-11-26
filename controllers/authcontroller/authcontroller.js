const mongoose = require('mongoose');
const passport = require('passport');
const uservalidation = require('../../validations/Uservalidation/uservalidation');
const joifunctions = require('../../validations/mainjoivalidations');
const { promisify } = require('util');
const crypto = require('crypto');
// const { promisify } = require('util');

const User = require('../../models/User');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const Bid = require('../../models/Bid');
const Deposit = require('../../models/Deposit');
const FileBooking = require('../../models/bookenigfile');
const Winner = require('../../models/Winner');
const SubcategoryResult = require('../../models/SubcategoryResult');
const WalletCharger = require('../../models/WalletCharger');
const Payment = require('../../models/Payment');
const Notification = require('../../models/notification');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET,{ expiresIn: '7d' })
};



const createSendToken = async (user, statusCode, res, session) => {
  const token = signToken(user._id);
  const cookieOptions = {
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  user.authToken = token;

  await user.save({ session }); // Save the user with the new token

  user.passwordHash = undefined; // Remove password from output

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// const createSendToken =async (user, statusCode, res,session) => {

//   console.log(user)
//   const token = signToken(user._id);
//   const cookieOptions = {
//     // expires: new Date(
//     //   Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
//     // ),
//     httpOnly: true
//   };
//   if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

//   res.cookie('jwt', token, cookieOptions);
//   user.authToken = token;
//   await user.save({ session }); 
//   // Remove password from output
//   user.password = undefined;

//   res.status(statusCode).json({
//     status: 'success',
//     token,
//     data: {
//       user
//     }
//   });
// };



// exports.signup = catchAsync(async (req, res, next) => {
//   console.log(`Method: ${req.method}, API: ${req.originalUrl}`);
// console.log(req.body)
// const newUser = await User.create({
//   name: req.body.name,
//   // companyname: req.body.companyname,
//   // specialist: req.body.specialist,
//   // address: req.body.address,
//   // IDnum: req.body.IDnum,
//   email: req.body.email,
//   phone: req.body.phone,
//   // photo: req.body.photo,
//   // identitycard: req.body.identitycard,
//   password: req.body.password,
//   // passwordConfirm: req.body.passwordConfirm
// });

//   createSendToken(newUser, 201, res);
// });

// exports.login = catchAsync(async (req, res, next) => {
//   const { email, password } = req.body;

//   // 1) Check if email and password exist
//   if (!email || !password) {
//     return next(new AppError('Please provide email and password!', 400));
//   }
//   // 2) Check if user exists && password is correct
//   const user = await User.findOne({ email }).select('+password');

//   if (!user || !(await user.correctPassword(password, user.password))) {
//     return next(new AppError('Incorrect email or password', 401));
//   }

//   // 3) If everything ok, send token to client
//   createSendToken(user, 200, res);
// });






// exports.protect = catchAsync(async (req, res, next) => {
//   // 1) Getting token and check of it's there
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     token = req.headers.authorization.split(' ')[1];
//   } else if (req.cookies.jwt) {
//     token = req.cookies.jwt;
//   }

//   if (!token) {
//     return next(
//       new AppError('You are not logged in! Please log in to get access.', 401)
//     );
//   }

//   // 2) Verification token
//   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//   // 3) Check if user still exists
//   const currentUser = await User.findById(decoded.id);
//   if (!currentUser) {
//     return next(
//       new AppError(
//         'The user belonging to this token does no longer exist.',
//         401
//       )
//     );
//   }

//   // 4) Check if user changed password after the token was issued
//   // if (currentUser.changedPasswordAfter(decoded.iat)) {
//   //   return next(
//   //     new AppError('User recently changed password! Please log in again.', 401)
//   //   );
//   // }

//   // GRANT ACCESS TO PROTECTED ROUTE
//   req.user = currentUser;
//   res.locals.user = currentUser;
//   next();
// });

// module.exports = { signup,login };















const OTP = require('../../models/otp');
const { generateOTP, sendOTP } = require('../../utils/otpUtils');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const factory = require('../../utils/apiFactory');

const admin = require('../../firebase/firebaseAdmin'); // Firebase Admin SDK

const getallusers = factory.getAll(User);
 const getuser= factory.getOne(User);

// const registerUser = async (req, res ,next) => {
//   try {
//     const { name, email, birthdate, phoneNumber, password ,idImage,idNumber,companyname,adress,specialist,idbackImage} = req.body;
// console.log(idNumber)

//     const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
// console.log('existingUser',existingUser)

//     if (existingUser) {
//       return next(new AppError('User already exists', 400))
   
//     }

//     const passwordHash = await bcrypt.hash(password, 10);
//     const newUser = new User({ name, email, birthdate, phoneNumber, passwordHash,idImage,idNumber,companyname,adress,specialist,idbackImage });
//     await newUser.save();
//     console.log(newUser)

//     // const otpCode = generateOTP();
//     const newOTP = new OTP({ userId: newUser._id, otpCode:'123456', expiresAt: Date.now() + 1000 * 60 * 1000 });
//     await newOTP.save();

//     // sendOTP(phoneNumber, '123456');

//     res.status(201).json({status:"success",data:{ message: 'User registered successfully. Please verify your phone number.',data:newUser._id }});
//   } catch (error) {
//     console.log(error)
//   return next(new AppError(`Server error ${error}`, 500));
//   }
// };




// const registerUser = async (req, res, next) => {
//   try {
//     // const errors = validationResult(req);
//     // if (!errors.isEmpty()) {
//     //   return next(new AppError('Validation Error', 400, errors.array()));
//     // }


//     const {
//       name, email, birthdate, phoneNumber, password, idImage, idNumber,
//       companyname, adress, specialist, idbackImage
//     } = req.body;
//     // Check if user already exists by email or phone number
//     const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
//     if (existingUser) {
//       return next(new AppError('User already exists', 400));
//     }

//     // Check if user already exists by ID number
//     const existingIdUser = await User.findOne({ idNumber });
//     if (existingIdUser) {
//       return next(new AppError('User with this ID number already exists', 400));
//     }

//     // Hash the password
//     const passwordHash = await bcrypt.hash(password, 10);

//     // Create new user
//     const newUser = new User({
//       name, email, birthdate, phoneNumber, passwordHash, idImage, idNumber,
//       companyname, adress, specialist, idbackImage
//     });
//     await newUser.save();

//     // Create and save OTP
//     const newOTP = new OTP({
//       userId: newUser._id,
//       otpCode: '123456',
//       // expiresAt: Date.now() + 10000 * 60 * 1000
//     });
//     await newOTP.save();

//     res.status(201).json({
//       status: "success",
//       data: {
//         message: 'User registered successfully. Please verify your phone number.',
//         userId: newUser._id
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     return next(new AppError(`Server error ${error.message}`, 500));
//   }
// };






const sendFirebaseNotification = async (user, title, body) => {
  if (user && user.fcmToken ) {
    // console.log(user.fcmToken,user.isLogin)
    const message = {
      notification: {
        title,
        body
      },
      token: user.fcmToken,
    };
    try {
      await admin.messaging().send(message);
      console.log('Notification sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  } else {
    console.error('User FCM token not found or invalid');
  }
};













const registerUser = async (req, res, next) => {
  try {
    const {
      name, email, birthdate, phoneNumber, password, idImage, idNumber,
      companyname, adress, specialist, idbackImage,fcmToken
    } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ idNumber }, { phoneNumber }] });
    if (existingUser) {
      return next(new AppError('المستخدم موجود بالفعل', 400));
    }

    const existingIdUser = await User.findOne({ idNumber });
    if (existingIdUser) {
      return next(new AppError('المستخدم موجود بالفعل', 400));
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      name, email, birthdate, phoneNumber, passwordHash, idImage, idNumber,
      companyname, adress, specialist, idbackImage,fcmToken
    });
    await newUser.save();

    const otpCode = generateOTP();
    const newOTP = new OTP({
      userId: newUser._id,
      otpCode: otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
    });
    await newOTP.save();

    try {
      await sendOTP(phoneNumber, otpCode);
    } catch (error) {
      await User.findByIdAndDelete(newUser._id);
      await OTP.deleteMany({ userId: newUser._id });
      return next(new AppError('فشل في ارسال كود التفعيل .', 500));
    }

    res.status(201).json({
      status: "success",
      data: {
        message: 'تم ارسال رمز التحقق (OTP) برجاء الانتظار دقائق لحين وصوله اليك',
        userId: newUser._id
      }
    });
  } catch (error) {
    console.error(error);
    return next(new AppError(`Server error ${error.message}`, 500));
  }
};


const verifyOTP = async (req, res, next) => {
  try {
    const { userId, otpCode } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('المستخدم غير موجود', 404));
    }

    if (user.verified) {
      return res.status(400).json({ status: 'fail', message: 'المستخدم تم تفعيله بالفعل' });
    }

    const otpRecord = await OTP.findOne({ userId, otpCode });

    if (!otpRecord || otpRecord.expiresAt < Date.now()) {
      return next(new AppError('رمز التحقق خطأ او منتهى الصلاحية', 400));
    }

    await User.findByIdAndUpdate(userId, { verified: true });
    await OTP.deleteMany({ userId });

    return res.status(200).json({ status: "success", data: { message: "تم التحقق من رقم الهاتف بنجاح'" } });
  } catch (error) {
    next(new AppError('خطاء فى السيرفر اثناء تفعيل المستخدم', 500));
  }
};


























const verifyOTPAdmin = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('المستخدم غير موجود', 404));
    }

    if (user.verified) {
      return res.status(400).json({ status: 'fail', message: ' تم التحقق من رقم الهاتف بنجاح' });
    }

    const otpRecord = await OTP.findOne({ userId });

  

    await User.findByIdAndUpdate(userId, { verified: true });
    await OTP.deleteMany({ userId });

    return res.status(200).json({ status: "success", data: { message: 'تم التحقق من رقم الهاتف بنجاح' } });
  } catch (error) {
    next(new AppError('حدث خطاء اثناء تاكيد كود التحقق ', 500));
  }
};






















const resendOTP = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
console.log(user)
    if (!user) {
      return next(new AppError('المستخدم غير موجود', 404));
    }
    if (user.verified) {
      return next(new AppError('المستخدم تم تفعيله بالفعل', 404));
    }
    // Check if an OTP was sent in the last 3 minutes
    const lastOTP = await OTP.findOne({ userId }).sort({ createdAt: -1 });
console.log(lastOTP)
    if (lastOTP && (Date.now() - new Date(lastOTP.createdAt).getTime()) < 3 * 60 * 1000) {
      return next(new AppError('تم ارسال رمز التحقق (OTP)بالفعل برجاء الانتظار ٣ دقائق قبل الضغط على اعادة الارسال  ', 429));
    }

    // Remove any previous OTPs for the user
    await OTP.deleteMany({ userId });

    const otpCode = generateOTP();
    const newOTP = new OTP({
      userId: user._id,
      otpCode: otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
    });
    await newOTP.save();

    try {
      await sendOTP(user.phoneNumber, otpCode);
    } catch (error) {
      await OTP.deleteMany({ userId: user._id });
      return next(new AppError('فشل فى ارسال الكود.', 500));
    }

    res.status(200).json({
      status: "success",
      data: {
        message: 'جارى ارسال رمز التحقق (OTP)'
      }
    });
  } catch (error) {
    next(new AppError('فشل فى ارسال الكود.', 500));
  }
};




































// const verifyOTP = async (req, res,next) => {
//   try {
//     const { userId, otpCode } = req.body;
// console.log(userId,otpCode)
//     const otpRecord = await OTP.findOne({ userId, otpCode });
//     console.log(otpRecord)
//     if (!otpRecord) {
//       return next(new AppError('Invalid or expired OTP', 400));
//     }

//     await User.findByIdAndUpdate(userId, { verified: true });
//     await OTP.deleteMany({ userId });

//    return res.status(200).json({status:"success",data:{ message: 'Phone number verified successfully'} });
//   } catch (error) {
//     next(new AppError('Server error on otp verificatios', 500));
//   }
// };

////////////////////////////////this is work //////////////////////////////////////


// const loginUser = async (req, res, next) => {
//   try {
//     const { phoneNumber, password, idNumber, fcmToken } = req.body;

//     if (!phoneNumber && !idNumber) {
//       return res.status(400).json({ error: 'Phone number or ID number must be provided' });
//     }

//     let query;
//     if (idNumber) {
//       if (idNumber.length > 14) {
//         return next(new AppError('Invalid ID number', 400));
//       }
//       query = { idNumber: idNumber };
//     } else {
//       query = { phoneNumber: phoneNumber };
//     }

//     const user = await User.findOne(query).select('+passwordHash');
//     if(fcmToken){
//       user.fcmToken = fcmToken;
//       await user.save({validateBeforeSave: false});
//     }
//     // await user.save({validateBeforeSave: false});
//     if (!user) {
//       return next(new AppError('Invalid credentials', 400));
//     }
//     // await User.findByIdAndUpdate(user._id, { fcmToken });

//     const isMatch = await bcrypt.compare(password, user.passwordHash);
//     if (!isMatch) {
//       return next(new AppError('Invalid credentials', 400));
//     }

//     if (!user.verified) {
//       return next(new AppError('Please verify your phone number first', 406));
//     }

//     if (user.blocked) {
//       return next(new AppError('You are blocked', 400));
//     }

//     if (!user.approved) {
//       return next(new AppError('Your account has not been approved by the admin yet', 400));
//     }

//     user.passwordHash = undefined;

//     return createSendToken(user, 200, res);
//   } catch (error) {

//     return next(new AppError(`Server error during login${error}` , 500));
//   }
// };

////////////////////////////////this is work //////////////////////////////////////




// const loginUser = catchAsync(async (req, res, next) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { phoneNumber, password, idNumber, fcmToken, deviceDetails } = req.body;

//     if (!phoneNumber && !idNumber) {
//       return next(new AppError('Phone number or ID number must be provided', 400));
//     }

//     let query;
//     if (idNumber) {
//       if (idNumber.length > 14) {
//         return next(new AppError('Invalid ID number', 400));
//       }
//       query = { idNumber: idNumber };
//     } else {
//       query = { phoneNumber: phoneNumber };
//     }

//     const user = await User.findOne(query).select('+passwordHash').session(session);
//     if (!user) {
//       return next(new AppError('Invalid credentials', 400));
//     }

//     if (fcmToken) {
//       user.fcmToken = fcmToken;
//       await user.save({ session, validateBeforeSave: false });
//     }

//     const isMatch = await bcrypt.compare(password, user.passwordHash);
//     if (!isMatch) {
//       return next(new AppError('Invalid credentials', 400));
//     }

//     if (!user.verified) {
//       return next(new AppError('Please verify your phone number first', 406));
//     }

//     if (user.blocked) {
//       return next(new AppError('You are blocked', 400));
//     }

//     if (!user.approved) {
//       return next(new AppError('Your account has not been approved by the admin yet', 400));
//     }

//     // Check if the user is already logged in from another device
//     if (user.deviceDetails.deviceId && user.deviceDetails.deviceId !== deviceDetails.deviceId) {
//       user.authToken = null;
//       await user.save({ session, validateBeforeSave: false });
//       await session.commitTransaction();
//       session.endSession();
//       return next(new AppError('You are already logged in from another device', 400));
//     }

   
//     user.deviceDetails = deviceDetails;

//     await user.save({ session,validateBeforeSave: false });

  

//     user.passwordHash = undefined;

//     await createSendToken(user, 200, res,session);
//     await session.commitTransaction();
//     session.endSession();
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     return next(new AppError(`Server error during login: ${error.message}`, 500));
//   }
// });






// const loginUser = catchAsync(async (req, res, next) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { phoneNumber, password, idNumber, fcmToken, deviceDetails } = req.body;

//     if (!phoneNumber && !idNumber) {
//       await session.abortTransaction();
//       session.endSession();
//       return next(new AppError('Phone number or ID number must be provided', 400));
//     }

//     let query;
//     if (idNumber) {
//       if (idNumber.length > 14) {
//         await session.abortTransaction();
//         session.endSession();
//         return next(new AppError('Invalid ID number', 400));
//       }
//       query = { idNumber: idNumber };
//     } else {
//       query = { phoneNumber: phoneNumber };
//     }
//     console.log(query)

//     const user = await User.findOne(query).select('+passwordHash').session(session);
//     console.log(user)
//     if (!user) {
//       await session.abortTransaction();
//       session.endSession();
//       return next(new AppError('Invalid credentials', 400));
//     }

//     if (fcmToken) {
//       user.fcmToken = fcmToken;
//       await user.save({ session, validateBeforeSave: false });
//     }

//     const isMatch = await bcrypt.compare(password, user.passwordHash);
//     if (!isMatch) {
//       await session.abortTransaction();
//       session.endSession();
//       return next(new AppError('Invalid credentials', 400));
//     }

//     if (!user.verified) {
//       await session.abortTransaction();
//       session.endSession();
//       return next(new AppError('Please verify your phone number first', 406));
//     }

//     if (user.blocked) {
//       await session.abortTransaction();
//       session.endSession();
//       return next(new AppError('You are blocked', 400));
//     }

//     if (!user.approved) {
//       await session.abortTransaction();
//       session.endSession();
//       return next(new AppError('Your account has not been approved by the admin yet', 400));
//     }

//     // Check if the user is already logged in from another device
//     console.log("deviceDetails",user.deviceDetails)
//     console.log(" Object.keys(user.deviceDetails)", Object.keys(user.deviceDetails))
//     console.log(" Object.keys(user)", Object.keys(user.deviceDetails).length !== 0)


//     if (
//       // user.deviceDetails && 
//       // Object.keys(user.deviceDetails).length !== 0 && 
//       // deviceDetails && 
//       // user.deviceDetails.deviceId && 
//       // deviceDetails.deviceId && 
//       user.deviceDetails.deviceId !== null&&user.deviceDetails.deviceId !== deviceDetails.deviceId
//     ) {
//       // Clear the authToken if user is trying to log in from another device
//       // user.authToken = null;
//       await user.save({ session, validateBeforeSave: false });
//       await session.commitTransaction();
//       session.endSession();
//       return next(new AppError('You are already logged in from another device', 400));
//     }
//     user.deviceDetails = deviceDetails;
//     await user.save({ session, validateBeforeSave: false });

//     await createSendToken(user, 200, res, session);

//     await session.commitTransaction();
//     session.endSession();
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     return next(new AppError(`Server error during login: ${error.message}`, 500));
//   }
// });




const loginUser = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { phoneNumber, password, idNumber, fcmToken, deviceDetails } = req.body;

    if (!phoneNumber && !idNumber) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('رقم الهاتف أو رقم الهوية مطلوب', 400));
    }

    const query = idNumber 
    ? { idNumber } 
    : { phoneNumber };

    // : { $or: [{ phoneNumber }, { altphoneNumber: phoneNumber }] };
    const user = await User.findOne(query).select('+passwordHash').session(session);
    
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('برجاء التاكد من صحة البيانات', 400));
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('برجاء التاكد من صحة كلمة المرور', 400));
    }

    if (!user.verified) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError("يرجى ادخال رمز التحقق (OTP)للنحقق من رقم الهاتف ", 406));
    }

    if (user.blocked) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('تم حظر حسابك', 400));
    }

    if (!user.approved) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('يجري الاَن المراجعة والتحقق من بيانات الدخول', 400));
    }











    // Check for prior device login
    if (user.deviceDetails.deviceId && user.deviceDetails.deviceId !== deviceDetails.deviceId) {
      user.authToken = null;  // Clear old token to ensure new login is required
    }

    // Set new device details and FCM token
    user.deviceDetails = deviceDetails;
    if (fcmToken) user.fcmToken = fcmToken;
    await user.save({ session, validateBeforeSave: false });

    // Generate a new authToken and send it
    await createSendToken(user, 200, res, session);

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError(`خطاء فى السيرفر اثناء تسجل الدخول: ${error.message}`, 500));
  }
});






















// Admin Approval Controller
const approveUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('المستخدم غير موجود', 404));
    }

    user.approved = true;
    await user.save();
    await sendFirebaseNotification(user, 'تم الموافقة على حسابك','     حسابك نشط الأن ✅ '  )
    // Send account activation message
    // const activationMessage = 'Your account is now active. Welcome!';
    // try {
    //   await sendOTP(user.phoneNumber, activationMessage);
    // } catch (error) {
    //   console.error('Error sending account activation message:', error);
    //   return next(new AppError('User approved but failed to send activation message', 500));
    // }

    res.status(200).json({ message: 'تم الموافقة على الحساب ' });
  } catch (error) {
    next(new AppError('Server error during user approval', 500));
  }
};









const forgotPassword = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return next(new AppError('المستخدم غير موجود', 400));
    }

    // Check if an OTP was sent recently
    const recentOTP = await OTP.findOne({ userId: user._id }).sort({ createdAt: -1 });
    if (recentOTP && (Date.now() - new Date(recentOTP.createdAt).getTime()) < 3 * 60 * 1000) {
      return next(new AppError('هناك كود تم ارساله بالفعل برجاء انتظار 3 دقائق قبل طلب كود اخر.', 400));
    }

    const otpCode = generateOTP();
    const newOTP = new OTP({ userId: user._id, otpCode, expiresAt: Date.now() + 10 * 60 * 1000 });
    await newOTP.save();

    try {
      await sendOTP(user.phoneNumber, otpCode);
    } catch (error) {
      await OTP.deleteMany({ userId: user._id });
      return next(new AppError('فشل فى ارسال الكود الرجاء المحاولة لاحقا.', 500));
    }

    return res.status(200).json({ status: "success", data: { message: 'تم ارسال الكود بنجاح', userId: user._id } });
  } catch (error) {
    return next(new AppError('خطاء بالسيرفر', 500));
  }
};





const resetPassword = async (req, res, next) => {
  try {
    const { userId, otpCode, newPassword } = req.body;

    const otpRecord = await OTP.findOne({ userId, otpCode });
    if (!otpRecord || otpRecord.expiresAt < Date.now()) {
      return next(new AppError('او طلب كود اخر كود غير صالح برجاء ادخل الكود الصحيح', 400));
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { passwordHash });
    await OTP.deleteMany({ userId });

    return res.status(200).json({ message: 'تم اعادة تعيين كلمة المرور' });
  } catch (error) {
    return res.status(500).json({ message: 'خطاء فى السيرفر', error });
  }
};
0



















// const forgotPassword = async (req, res,next) => {
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return next(new AppError('User not found', 400));
   
//     }

//     // const otpCode = generateOTP();
//     const newOTP = new OTP({ userId: user._id, otpCode:'123456', expiresAt: Date.now() + 10 * 60 * 1000 });
//     await newOTP.save();

//     sendOTP(user.phoneNumber, '123456');

//    return res.status(200).json({status:"success",data:{ message: 'OTP sent to your phone number',data:user._id }});;
//   } catch (error) {
//     return next(new AppError('Server error', 500));
//   }
// };

// const resetPassword = async (req, res,next) => {
//   try {
//     const { userId, otpCode, newPassword } = req.body;

//     const otpRecord = await OTP.findOne({ userId, otpCode });
//     console.log(otpRecord)
//     if (!otpRecord || otpRecord.expiresAt < Date.now()) {
//       return next(new AppError('Invalid or expired OTP', 400));
//     }

//     const passwordHash = await bcrypt.hash(newPassword, 10);
//     await User.findByIdAndUpdate(userId, { passwordHash });
//     await OTP.deleteMany({ userId });

//    return res.status(200).json({ message: 'Password reset successfully' });
//   } catch (error) {
//   return  res.status(500).json({ message: 'Server error', error });
//   }
// };

const changePassword = async (req, res) => {
  try {
    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('المستخدم غير موجود', 400));
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return next(new AppError('برجاء التحقق من صحةالبيانات', 400));
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { passwordHash });

   return res.status(200).json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
   return res.status(500).json({ message: 'حدث خطاء بالسيرفر برجاء المحاولة لاحقا', error });
  }
};

const updateProfile = async (req, res) => {
  try {
    console.log(req.body)
    const { userId } = req.params;
    const { name, birthdate, phoneNumber, idNumber ,profileImage,specialist,companyname,address,idImage,idbackImage,altphoneNumber} = req.body;
    // const profileImage = req.files.profileImage ? req.files.profileImage[0].path : null;
    // const idImage = req.files && req.files.idImage ? req.files.idImage[0].path : null;

    const updates = { name, birthdate, phoneNumber, idNumber,specialist, companyname,address,altphoneNumber};
    if (idbackImage) updates.idbackImage = idbackImage;
    if (idImage) updates.idImage = idImage;

  const asd=  await User.findByIdAndUpdate(userId, updates, { new: true });
  asd.passwordHash=undefined
    
 return   res.status(200).json({ message: 'تم تعديل البيانات بنجاح',data:asd });
  } catch (error) {
    console.log(error)
   return res.status(500).json({ message: 'حدث خطاء بالسيرفر برجاء المحاولة لاحقا', error });
  }
};


const blockUser = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  const user = await User.findByIdAndUpdate(userId, { blocked: status }, { new: true });

  res.json({status:"success",data:user})};


  const getme = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    const user = await User.findById(id).select('walletBalance walletTransactions');
  
    res.json({status:"success",data:user})};

/////////////////////////////////////////////////////////////////////////////////////////////
    // const logoutUser = async (req, res) => {
    //   try {
    //     const userId = req.user.id;
    
    //     // Update isLogin status to false
    //     await User.findByIdAndUpdate(userId, { isLogin: false });
    
    //     // Optionally, you can also invalidate the token if you're using token-based authentication
    //     // For example, add the token to a blacklist (implementation depends on your token strategy)
    
    //     res.status(200).json({ message: 'Logged out successfully.' });
    //   } catch (error) {
    //     res.status(500).json({ message: 'An error occurred during logout.', error: error.message });
    //   }
    // };
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// const logoutUser = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     console.log(userId)

//     // Update isLogin status to false
//    await User.findByIdAndUpdate(userId, {
//       isLogin: false,
//       authToken: null,
//       deviceDetails: {}
//     });

//     res.status(200).json({ message: 'Logged out successfully.' });
//   } catch (error) {
//     res.status(500).json({ message: 'An error occurred during logout.', error: error.message });
//   }
// };



const logoutUser = catchAsync(async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Update isLogin status to false, clear authToken, and reset device details
    await User.findByIdAndUpdate(userId, {
      isLogin: false,
      authToken: null,
      deviceDetails: { deviceId: null, brand: null, model: null, version: null }
    });

    res.status(200).json({ message: 'تم تسجيل الخروج بنجاح' });
  } catch (error) {
    next(new AppError('حدث خطاء اثناء تسجيل الخروج', 500));
  }
});





    const deleteUser = async (req, res, next) => {
      const session = await mongoose.startSession();
      session.startTransaction();
    
      try {
        const { phoneNumber } = req.body;
        const { id } = req.params

    
        // Find the user
        const user = await User.findById(id).session(session);
        if (!user) {
          throw new AppError('المستخدم غير موجود', 404);
        }
    
        // Delete bids
        await Bid.deleteMany({ userId: user._id }).session(session);
    
        // Delete deposits
        await Deposit.deleteMany({ userId: user._id }).session(session);
    
        // Delete file bookings
        await FileBooking.deleteMany({ userId: user._id }).session(session);
    
        // Delete winners
        await Winner.deleteMany({ userId: user._id }).session(session);
    
        // Delete subcategory results
        await SubcategoryResult.deleteMany({ userId: user._id }).session(session);
    
        // Delete wallet charges
        await WalletCharger.deleteMany({ userId: user._id }).session(session);
    
        // Delete payments
        await Payment.deleteMany({ userId: user._id }).session(session);
    
        // Delete notifications
        await Notification.deleteMany({ userId: user._id }).session(session);
    
        // Delete the user
        await User.deleteOne({ _id: user._id }).session(session);
    
        // Commit the transaction
        await session.commitTransaction();
        session.endSession();
    
        res.status(200).json({ message: 'تم حذف حسابك بنجاح ' });
    
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(new AppError(`حدث خطاء اثناء حذف الحساب برجاء اعادة المحاولة   ${error}`, 500));
      }
    };
    
    module.exports = deleteUser;
    







module.exports = {
  getallusers,
  logoutUser,
  registerUser,
  verifyOTP,
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
  resendOTP,
  deleteUser,
  verifyOTPAdmin,
  updateProfile,getuser,blockUser,getme,approveUser
};
