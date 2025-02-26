import { Document, ObjectId } from "mongoose";

export interface IReview extends Document {
    fullName?:string;
    user_id: ObjectId;   // Refers to User model
    review_id: ObjectId;  // Refers to Event model
    rating: number;      // Rating value (e.g., 1-5)
    comment: string;  
    imageUrl: string;   // Review comment
}
