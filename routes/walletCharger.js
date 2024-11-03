const express = require('express');
const { chargeWallet, reviewWalletCharger, getUserChargingHistory,getChargingRequests ,getChargingRequestdetails} = require('../controllers/WalletChargerController/WalletChargerController');
const mult = require('../utils/multer');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const upload = mult('images/lastpayforauctions');
function generateValidFilePath(filename) {
    const parts = filename.split(/[\\/]/); // Split the filename by both forward slash (/) and backslash (\)
    const formattedParts = parts.map(part => part.replace(/\\/g, '/')); // Replace backslashes (\) with forward slashes (/)
    const validPath = formattedParts.join('/'); // Join the parts back together with forward slashes (/)
    return validPath;
  }
// Route to create a wallet charging request
router.post('/charge-wallet',upload.single('billImage'),authMiddleware 
,(req,res,next)=>{

    if (!req.file) {
      // return ne.status(400).send('No file uploaded.');
      return  next(new AppError('No file uploaded.', 400));
    }
  
  
    req.body.billImage ={name:req.file.originalname,path: generateValidFilePath(req.file.path),pathname:req.file.filename};
  
  
  next()
  
  },authMiddleware,chargeWallet);

// Route for admin to review wallet charging request
router.post('/review-wallet-charger',authMiddleware, reviewWalletCharger);

router.get('/charging-history',authMiddleware, getChargingRequests);
router.get('/charging-history/getdetails/:id',authMiddleware, getChargingRequestdetails);
// Route for user to get their charging history
router.get('/charging-history/:userId',authMiddleware, getUserChargingHistory);



module.exports = router;
