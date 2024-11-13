const mongoose = require('mongoose');

const SocialMediaLinkSchema = new mongoose.Schema({
  en: { type: [String], required: true },
  ar: { type: [String], required: true }
}, { timestamps: true });

const SocialMediaLink = mongoose.model('SocialMediaLink', SocialMediaLinkSchema);

module.exports = SocialMediaLink;
