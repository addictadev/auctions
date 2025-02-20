const multer = require('multer');
const AppError = require('./appError');

const createMulterUpload = (filePath) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, filePath); // Set the destination folder for uploads
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + '-' + file.originalname); // Set the file name
    },
  });

  const fileFilter = (req, file, cb) => {
    // if (file.mimetype.startsWith('image/')) {
    //   cb(null, true); // Accept only image files
    // } else {
    //   cb(new AppError('Invalid file type please provide image file', 400), false);
    // }
  };

  // const limits = {
  //   fileSize: 1024 * 1024 * 1000, // 5MB file size limit
  // };

  // return multer({ storage, fileFilter, limits });
  return multer({ storage});

};

module.exports = createMulterUpload;
