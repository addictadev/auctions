const { body } = require('express-validator');

const userValidator = {
   register : [
    body('name').notEmpty().withMessage('برجاء ادخال الاسم'),
    body('email'),
    // body('birthdate').isISO8601().withMessage('Valid birthdate is required'),
    body('phoneNumber')
        .notEmpty().withMessage(' برجاء ادخل رقم الهاتف')
        .isLength({ min: 11, max:11 }).withMessage('رقم الهاتف يجب أن يتكون من 10 أرقام على الأقل'),
    body('password').isLength({ min: 6 }).withMessage(' برجاء ادخال الرقم السري'),
    body('idNumber').notEmpty().withMessage('برجاء ادخال الرقم القومي').isLength({ min: 14, max:14 }).withMessage('رقم القومى يجب أن يتكون من 14 أرقام على الأقل'),
    // body('companyname').notEmpty().withMessage('Company name is required'),
    // body('adress').notEmpty().withMessage('Address is required'),
    // body('specialist').notEmpty().withMessage('Specialist field is required')
],

  // register : [
  //   body('name').notEmpty().withMessage('برجاء ادخال الاسم'),
  //   body('email'),
  //   // body('birthdate').isISO8601().withMessage('Valid birthdate is required'),
  //   body('phoneNumber').notEmpty().withMessage(' برجاء ادخل رقم الهاتف'),
  //   body('password').isLength({ min: 6 }).withMessage(' برجاء ادخال الرقم السري'),
  //   body('idNumber').notEmpty().withMessage('برجاء ادخال الرقم القومي'),
  //   // body('companyname').notEmpty().withMessage('Company name is required'),
  //   // body('adress').notEmpty().withMessage('Address is required'),
  //   // body('specialist').notEmpty().withMessage('Specialist field is required')
  // ],

login : [
    body('phoneNumber')
      .optional()
      .isMobilePhone()
      .withMessage('ادخل رقم هاتف صحيح'),
    body('idNumber')
      .optional()
      .isLength({ max: 14 })
      .withMessage('الرقم القومى يجب ان يكون 14 رقم'),
    body('password')
      .notEmpty()
      .withMessage(' برجاء ادخال الرقم السري')
  ],
  forgotPassword: [
    body('email').isEmail().withMessage('برجاء ادخال بريد الكترونى صحيح')
  ],
  resetPassword: [
    body('userId').notEmpty().withMessage('رقم المستخدم مطلوب'),
    body('otpCode').notEmpty().withMessage(' برجاء ادخال كود التفعيل'),
    body('newPassword').isLength({ min: 6 }).withMessage(' برجاء ادخال الرقم السري')
  ],
  changePassword: [
    body('currentPassword').notEmpty().withMessage('برجاء ادخال الرقم السري الحالى'),
    body('newPassword').isLength({ min: 6 }).withMessage('برجاء ادخال الرقم السري الجديد')
  ],
  updateProfile: [
    // body('name').optional().notEmpty().withMessage('Name is required'),
    // body('birthdate').optional().isDate().withMessage('Invalid birthdate'),
    // body('phoneNumber').optional().notEmpty().withMessage('Phone number is required'),
    // body('idNumber').optional().notEmpty().withMessage('ID number is required')
  ]
};

module.exports = userValidator;
