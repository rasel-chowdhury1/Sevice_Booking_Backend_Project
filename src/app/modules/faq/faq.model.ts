import mongoose, { Schema } from "mongoose";
import { IFAQDocument } from "./faq.interface";

// FAQ Schema
const faqSchema = new Schema<IFAQDocument>({
    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
  }, { timestamps: true });
  
  const FAQ = mongoose.model<IFAQDocument>("FAQ", faqSchema);
  
  export default FAQ;