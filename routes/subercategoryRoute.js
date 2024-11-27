const express = require('express');
const {
createCategory,deleteCategory,getAllCategory,getCategory,updateCategory,getSubcategories
} = require('../controllers/subercategory/subercategorycontroller');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const userValidator = require('../validationswithexpress/userValidator');
const mult = require('../utils/multer');
const AppError = require('../utils/appError');
const upload = mult('images/parentcategory');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const subcategoryValidator = require('../validationswithexpress/subcategoryvalidation');

// const {deleteFileIfExists} =require('../utils/deleteimages');
function generateValidFilePath(filename) {
    const parts = filename.split(/[\\/]/); // Split the filename by both forward slash (/) and backslash (\)
    const formattedParts = parts.map(part => part.replace(/\\/g, '/')); // Replace backslashes (\) with forward slashes (/)
    const validPath = formattedParts.join('/'); // Join the parts back together with forward slashes (/)
    return validPath;
  }

router.get('/',getSubcategories );
router.get('/:id',catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
if (!req.headers.authorization) {
  return next()
}
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
console.log(req.headers)
  if (!token) {
    return next()
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  req.user = currentUser;

next();
}), getCategory);
// router.post('/',upload.fields([
//   { name: 'imagecover', maxCount: 1 },
//   { name: 'files', maxCount: 1 }

// ]),(req,res,next)=>{
  
//   console.log(req.file)
//   if (!req.file) {
//     // return ne.status(400).send('No file uploaded.');
//     return  next(new AppError('No file uploaded.', 400));
//   }


//   req.body.imagecover ={name:req.file.originalname,path: generateValidFilePath(req.file.path),pathname:req.file.filename};


// next()

// }, createCategory);











router.post('/', upload.fields([
  { name: 'imagecover', maxCount: 1 },
  { name: 'files', maxCount: 1 }
]), (req, res, next) => {
  console.log(req.files)
  if (!req.files || !req.files.imagecover || !req.files.files) {
    return next(new AppError('No file uploaded.', 400));
  }

  req.body.imagecover = {
    name: req.files.imagecover[0].originalname,
    path: generateValidFilePath(req.files.imagecover[0].path),
    pathname: req.files.imagecover[0].filename
  };
  req.body.files = {
    name: req.files.files[0].originalname,
    path: generateValidFilePath(req.files.files[0].path),
    pathname: req.files.files[0].filename
  };

  next();
}, subcategoryValidator.createSubcategory,validationMiddleware,async (req, res, next) => {
  try {
    await createCategory(req, res,next);
  } catch (error) {
    // Cleanup the uploaded file if there's an error
    // console.log(error)
    // if (req.body.imagecover && req.body.imagecover.path || req.body.files && req.body.files.path) {
    //   fs.unlink(path.resolve(req.body.imagecover.path), (err) => {
    //     if (err) console.error('Failed to delete file:', err);
    //   });
// console.log(path.join(__dirname, '../images/parentcategory',  req.body.imagecover.pathname))
// console.log(path.resolve(req.body.imagecover.path))


      // deleteFileIfExists(path.join(__dirname, '../images/parentcategory',  req.body.imagecover.pathname))
      // deleteFileIfExists(path.join(__dirname, '../images/parentcategory',  req.body.files.pathname))

    // }
    // next(error);
  }
});





















router.put('/:id',upload.fields([
  { name: 'imagecover', maxCount: 1 },
  { name: 'files', maxCount: 1 }
]), (req,res,next)=>{
  
  // console.log(req.files.imagecover[0])
    if (req.files && req.files.imagecover && req.files.imagecover.length>0) {
  
     
      req.body.imagecover = {
        name: req.files.imagecover[0].originalname,
        path: generateValidFilePath(req.files.imagecover[0].path),
        pathname: req.files.imagecover[0].filename
      };
      // req.body.imagecover ={name:req.file.originalname,path: generateValidFilePath(req.file.path),pathname:req.file.filename};
    }

    if (req.files && req.files.files && req.files.files.length>0) {
      req.body.files = {
        name: req.files.files[0].originalname,
        path: generateValidFilePath(req.files.files[0].path),
        pathname: req.files.files[0].filename
      };
    }

  
  

  
  next()
  
  },updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
