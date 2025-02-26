import { Document } from "mongoose";

// Interface for the FAQ schema
export interface IFAQ {
    _id?: string;
    question: string;
    answer: string;
  }
  
  // Interface for the FAQ document
export interface IFAQDocument extends Document {
    faqs: IFAQ[];
  }
  
  