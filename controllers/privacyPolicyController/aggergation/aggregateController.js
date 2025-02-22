const PrivacyPolicy = require('../../../models/PrivacyPolicy');
const SocialMediaLink = require('../../../models/SocialMediaLink');
const PhoneNumber = require('../../../models/PhoneNumber');
const AppShareLink = require('../../../models/AppShareLink');
const catchAsync = require('../../../utils/catchAsync');

// exports.getAggregateData = catchAsync(async (req, res) => {
//   const language = req.language;

//   const [privacyPolicy, socialMediaLinks, phoneNumbers, appShareLink] = await Promise.all([
//     PrivacyPolicy.findOne(),
//   SocialMediaLink.find().select(language),
//     PhoneNumber.findOne(),
//     AppShareLink.findOne()
//   ]);

//   const responseData = {
//     privacyPolicy: privacyPolicy ? privacyPolicy[language] : null,
//     socialMediaLinks: socialMediaLinks ? socialMediaLinks : null,
//     phoneNumbers: phoneNumbers ? phoneNumbers[language] : null,
//     appShareLinks: appShareLink ? appShareLink[language] : null
//   };

//   res.status(200).json({ status: 'success', data: responseData });
// });









// exports.getAggregateData = catchAsync(async (req, res) => {
//   const language = req.language;

//   const [privacyPolicy, socialMediaLinks, phoneNumbers, appShareLink] = await Promise.all([
//     PrivacyPolicy.findOne(),
//     SocialMediaLink.find().select(language), // Finds all social media links and selects only the field for the given language
//     PhoneNumber.findOne(),
//     AppShareLink.findOne()
//   ]);

//   // Extract social media links for the specific language
//   const formattedSocialMediaLinks = socialMediaLinks
//     ? socialMediaLinks.map(link => link[language] || [])
//     : null;

//   const responseData = {
//     privacyPolicy: privacyPolicy ? privacyPolicy[language] : null,
//     socialMediaLinks: formattedSocialMediaLinks,
//     phoneNumbers: phoneNumbers ? phoneNumbers[language] : null,
//     appShareLinks: appShareLink ? appShareLink[language] : null
//   };

//   res.status(200).json({ status: 'success', data: responseData });
// });








exports.getAggregateData = catchAsync(async (req, res) => {
  const language = req.language;

  const [privacyPolicy, socialMediaLinks, phoneNumbers, appShareLink] = await Promise.all([
    PrivacyPolicy.findOne(),
    SocialMediaLink.find().select(language), // Finds all social media links and selects only the field for the given language
    PhoneNumber.findOne(),
    AppShareLink.findOne()
  ]);

  // Extract and format social media links for the specific language
  const formattedSocialMediaLinks = socialMediaLinks
    ? socialMediaLinks.flatMap(link => link[language] || []) // Flattens nested arrays and returns a single array of links
    : null;

  const responseData = {
    privacyPolicy: privacyPolicy ? privacyPolicy[language] : null,
    socialMediaLinks: formattedSocialMediaLinks || [], // Return an array or an empty array if null
    phoneNumbers: phoneNumbers ? phoneNumbers[language] : null,
    appShareLinks: appShareLink ? appShareLink[language] : null
  };

  res.status(200).json({ status: 'success', data: responseData });
});
