import mongoose, { Schema } from "mongoose";
import { IReview } from "./review.interface";

const reviewSchema: Schema = new Schema<IReview>({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    }, // Refers to User model
    review_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    }, // Refers to User model
    rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 
    }, // Rating between 1 and 5
    comment: { 
        type: String, 
        required: false, 
        default: "" 
    }, // Optional comment with a default empty string
    imageUrl: {
        type: String,
        required: false,
        default: ""
    }
});

const Review = mongoose.model<IReview>("Review", reviewSchema);

export default Review;
