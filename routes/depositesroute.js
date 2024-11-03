
const express = require('express');
const depositController = require('../controllers/deposite/depositController');
const validateDeposit = require('../middleware/validateDeposit');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const depositValidator = require('../validationswithexpress/depositValidator');
const userValidator = require('../validationswithexpress/userValidator');
const mult = require('../utils/multer');
const AppError = require('../utils/appError');
const upload = mult('images/billingimage');
const router = express.Router();

function generateValidFilePath(filename) {
    const parts = filename.split(/[\\/]/); // Split the filename by both forward slash (/) and backslash (\)
    const formattedParts = parts.map(part => part.replace(/\\/g, '/')); // Replace backslashes (\) with forward slashes (/)
    const validPath = formattedParts.join('/'); // Join the parts back together with forward slashes (/)
    return validPath;
  }
router.post('/',upload.single('billImage'),authMiddleware,(req,res,next)=>{

  if (req.body.billingmethod == 'wallet') {
    return next();
  }
    if (!req.file) {
      // return ne.status(400).send('No file uploaded.');
      return  next(new AppError('No file uploaded.', 400));
    }
  
  
    req.body.billImage ={name:req.file.originalname,path: generateValidFilePath(req.file.path),pathname:req.file.filename};
  
  
  next()
  
  },depositValidator.createDeposit, validationMiddleware,validateDeposit,depositController.createDeposit);




router.get('/notifications/admin', depositController.getAdminNotifications);
router.get('/', depositController.getAllDeposit);
router.get('/:id', depositController.getDeposit);
router.get('/notifications/user/:userId',authMiddleware, depositController.getUserNotifications);
router.patch('/:depositId/approve', depositController.approveDeposit);
router.patch('/:depositId/reject', depositController.rejectDeposit);
router.delete('/:depositId', depositController.deleteDeposit);

module.exports = router;
