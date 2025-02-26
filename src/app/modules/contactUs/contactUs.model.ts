import { Schema, model } from 'mongoose';

const ContactUsSchema = new Schema(
  {
    customerService: {type: String, default: ''},
    youtubeUrl: { type: String, default: '' },
    facebookUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    twitterUrl: { type: String, default: '' },
    instagramUrl: { type: String, default: '' },
  },
  { timestamps: true },
);

export const ContactUs = model('ContactUs', ContactUsSchema);