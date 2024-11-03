const express = require('express');
const router = express.Router();
const privacyPolicyController = require('../controllers/privacyPolicyController/privacyPolicyController');
const localization = require('../middleware/localization');
const authMiddleware = require('../middleware/authMiddleware');

router.use(localization);

router.route('/')
  .post(privacyPolicyController.createPrivacyPolicy)
  .get(privacyPolicyController.getAllPrivacyPolicies);

router.route('/:id')
  .get(privacyPolicyController.getPrivacyPolicyById)
  .patch(privacyPolicyController.updatePrivacyPolicy)
  .delete(privacyPolicyController.deletePrivacyPolicy);

module.exports = router;
