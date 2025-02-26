import mongoose, { Schema, Document } from "mongoose";

// Interface for Privacy Policy
export interface IPrivacyPolicy extends Document {
  content: string;
}

// Privacy Policy Schema
const privacyPolicySchema = new Schema<IPrivacyPolicy>(
  {
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);


const PrivacyPolicy = mongoose.model<IPrivacyPolicy>("PrivacyPolicy", privacyPolicySchema);

export default PrivacyPolicy;
