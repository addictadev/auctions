const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
// const authMiddleware = async (req, res, next) => {
//   if (!req.header('Authorization')) {
//     return res.status(401).json({ message: 'No token provided' });
//   }
//   const token = req.header('Authorization').replace('Bearer ', '');

//   console.log(token)
//   if (!token) {
//     return res.status(401).json({ message: 'No token provided' });
//   }

//   try {
  
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log(decoded)

//     const user = await User.findById(decoded.id);
//     if (!user) {
//         return next(new AppError('Invalid token', 401));
 
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//   return  res.status(401).json({ message: 'Unauthorized' });
//   }
// };

// module.exports = authMiddleware;

//////////////////////////////////////////////////////////////////////////////////////////



// const authMiddleware = catchAsync(async (req, res, next) => {
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
// console.log(decoded)
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

//   req.user = currentUser;

// next();
// })
// module.exports = authMiddleware;
///////////////////////////////////////////////////////////////////

// const authMiddleware = catchAsync(async (req, res, next) => {
//   // 1) Getting token and check if it's there
//   let token;
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     token = req.headers.authorization.split(' ')[1];
//   } else if (req.cookies.jwt) {
//     token = req.cookies.jwt;
//   }

//   if (!token) {
//     return next(new AppError('You are not logged in! Please log in to get access.', 401));
//   }
  
//   // 2) Verification token
//   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  
//   // 3) Check if user still exists
//   const currentUser = await User.findById(decoded.id);
//   console.log('currentUser', currentUser);

//   console.log('authToken', currentUser.authToken,"token",token);
//   if (!currentUser) {
//     return next(new AppError('The user belonging to this token does no longer exist.', 401));
//   }

//   // 4) Check if the token is the same as the one stored in the database
//   // if (currentUser?.authToken !== token) {
//   //   return next(new AppError('Token is invalid or has been logged out from metawea.', 401));
//   // }

//   // Grant access to the protected route
//   req.user = currentUser;
//   next();
// });

const authMiddleware = catchAsync(async (req, res, next) => {
  console.log('token', req.headers.role);
  let token;
  if (req.headers.role && req.headers.role === 'admin') {
    return next(); // Skip further checks for admins
  }
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError('User not found.', 401));
  }

  // Check if authToken matches the stored token
  // if (currentUser.authToken !== token) {
  //   return next(new AppError('Session expired or logged in from another device.', 401));
  // }

  // Verify `deviceId` header matches stored device ID
  const headerDeviceId = req.headers.deviceid;
  if (currentUser.deviceDetails.deviceId !== headerDeviceId) {
    return next(new AppError('تم تسجيل الخروج , بسبب تسجيل الدخول من جهاز اخر ', 401));
  }
  if (currentUser.blocked) {
    return next(new AppError('تم حظر حسابك يرجى التواصل مع المسئول', 401));
  }
  req.user = currentUser; // Grant access to the protected route
  next();
});



module.exports = authMiddleware;