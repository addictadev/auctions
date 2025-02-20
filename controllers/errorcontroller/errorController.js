const AppError = require('../../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];




  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

function handlePasswordConfirmValidationError(err) {

  return new AppError('Password confirmation must match password', 400);
}
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);
    if (err.message.includes('المزاد انتهى لا يمكنك شراء كراسة')) {
      return res.status(err.statusCode || 400).json({
        status: 'error',
        message: 'المزاد انتهى لا يمكنك شراء كراسة بعد انتهاء المزاد'
      });
    }
    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {


    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);


      if (error.name === 'ValidationError') {
        // Check for specific validation error messages
        if (error.message.includes('"passwordConfirm" must be [ref:password]')) {
          error = handlePasswordConfirmValidationError(error);
        } else {
          error = handleValidationErrorDB(error);
        }
      }




    sendErrorProd(error, res);
  }
};



// const AppError = require('../../utils/appError');
// const multer = require('multer');

// const handleCastErrorDB = err => {
//   const message = `Invalid ${err.path}: ${err.value}.`;
//   return new AppError(message, 400);
// };

// const handleDuplicateFieldsDB = err => {
//   const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
//   console.log(value);

//   const message = `Duplicate field value: ${value}. Please use another value!`;
//   return new AppError(message, 400);
// };

// const handleValidationErrorDB = err => {
//   const errors = Object.values(err.errors).map(el => el.message);

//   const message = `Invalid input data. ${errors.join('. ')}`;
//   return new AppError(message, 400);
// };

// const sendErrorDev = (err, res) => {
//   res.status(err.statusCode).json({
//     status: err.status,
//     error: err,
//     message: err.message,
//     stack: err.stack
//   });
// };

// const sendErrorProd = (err, res) => {
//   // Operational, trusted error: send message to client
//   if (err.isOperational) {
//     res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message
//     });

//     // Programming or other unknown error: don't leak error details
//   } else {
//     // 1) Log error
//     console.error('ERROR 💥', err);

//     // 2) Send generic message
//     res.status(500).json({
//       status: 'error',
//       message: 'Something went very wrong!'
//     });
//   }
// };

// const handleMulterErrors = (err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     const message = `Multer error: ${err.message}`;
//     const error = new AppError(message, 400);
//     sendErrorDev(error, res);
//   } else {
//     next(err);
//   }
// };

// module.exports = (err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   if (process.env.NODE_ENV === 'development') {
//     sendErrorDev(err, res);
//   } else if (process.env.NODE_ENV === 'production') {
//     let error = { ...err };

//     if (error.name === 'CastError') error = handleCastErrorDB(error);
//     if (error.code === 11000) error = handleDuplicateFieldsDB(error);
//     if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

//    if (err.code === 'LIMIT_FILE_SIZE') {
//       // Handle Multer file size limit exceeded error
//       const fileSizeError = new AppError('File size limit exceeded. Please upload a smaller image less than 5MB', 400);
//       res.status(fileSizeError.statusCode).json({
//         status: fileSizeError.status,
//         message: fileSizeError.message,
//       });
//     }




//     sendErrorProd(error, res);
//   }
// };
