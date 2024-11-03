const express = require('express');

const router = express.Router();
const { processPayment ,approvePayment,getprocessPayment} = require('../controllers/paymentcontroller/processPayment ');
const mult = require('../utils/multer');
const AppError = require('../utils/appError');
const upload = mult('images/lastpayforauctions');
const authMiddleware = require('../middleware/authMiddleware');

function generateValidFilePath(filename) {
    const parts = filename.split(/[\\/]/); // Split the filename by both forward slash (/) and backslash (\)
    const formattedParts = parts.map(part => part.replace(/\\/g, '/')); // Replace backslashes (\) with forward slashes (/)
    const validPath = formattedParts.join('/'); // Join the parts back together with forward slashes (/)
    return validPath;
  }
const ensureWinner = require('../middleware/ensureWinner');
const ensureSubcategoryEnded = require('../middleware/ensureSubcategoryEnded ');
 // Ensure only admins can approve/reject payments
router.get('/getprocessPayment',getprocessPayment);
router.post('/pay',upload.single('billImage'),authMiddleware,(req,res,next)=>{
    if (req.body.billingMethod == 'wallet') {
        return next();
      }
    if (!req.file) {
      // return ne.status(400).send('No file uploaded.');
      return  next(new AppError('No file uploaded.', 400));
    }
  
  
    req.body.billImage ={name:req.file.originalname,path: generateValidFilePath(req.file.path),pathname:req.file.filename};
  
  
  next()
  
  } ,ensureWinner, processPayment);
router.post('/admin/approve-payment', approvePayment);

module.exports = router;
