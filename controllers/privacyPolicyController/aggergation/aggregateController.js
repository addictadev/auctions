const PrivacyPolicy = require('../../../models/PrivacyPolicy');
const SocialMediaLink = require('../../../models/SocialMediaLink');
const PhoneNumber = require('../../../models/PhoneNumber');
const AppShareLink = require('../../../models/AppShareLink');
const catchAsync = require('../../../utils/catchAsync');

exports.getAggregateData = catchAsync(async (req, res) => {
  const language = req.language;

  const [privacyPolicy, socialMediaLinks, phoneNumbers, appShareLink] = await Promise.all([
    PrivacyPolicy.findOne(),
    SocialMediaLink.find().select(language),
    PhoneNumber.findOne(),
    AppShareLink.findOne()
  ]);

  const responseData = {
    privacyPolicy: privacyPolicy ? privacyPolicy[language] : null,
    socialMediaLinks: socialMediaLinks ? socialMediaLinks : null,
    phoneNumbers: phoneNumbers ? phoneNumbers[language] : null,
    appShareLinks: appShareLink ? appShareLink[language] : null
  };

  res.status(200).json({ status: 'success', data: responseData });
});
