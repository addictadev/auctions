const express = require('express');
const router = express.Router();
// const categoryvalidation = require('../validations/Categoryvalidation/Categoryvalidations');
const joifunctions = require('../validations/mainjoivalidations');
const winnercontroller = require('../controllers/testcontroller/test');
const authMiddleware = require('../middleware/authMiddleware');

// router.post('/',DepositController.createDeposit);
router.get('/:id',authMiddleware, winnercontroller.aggregateSubcategoryResults);

// router.get('/:userId',authMiddleware, winnercontroller.getUserBidHistory);
// router.get('/:userId/:itemId', winnercontroller.getItemBidDetails);
router.get('/details/:userId/:subcategoryResultId',authMiddleware, winnercontroller.getItemBidDetails2);
router.get('/a/:subcategoryId',authMiddleware, winnercontroller.SubcategoryResult);








module.exports = router;







