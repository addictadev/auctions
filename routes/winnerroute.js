const express = require('express');
const router = express.Router();
// const categoryvalidation = require('../validations/Categoryvalidation/Categoryvalidations');
const joifunctions = require('../validations/mainjoivalidations');
const winnercontroller = require('../controllers/testcontroller/test');
const authMiddleware = require('../middleware/authMiddleware');

// router.post('/',DepositController.createDeposit);
router.get('/:id', winnercontroller.aggregateSubcategoryResults);

// router.get('/:userId',authMiddleware, winnercontroller.getUserBidHistory);
// router.get('/:userId/:itemId', winnercontroller.getItemBidDetails);
router.get('/details/:userId/:subcategoryResultId', winnercontroller.getItemBidDetails2);
router.get('/a/:subcategoryId', winnercontroller.SubcategoryResult);








module.exports = router;







