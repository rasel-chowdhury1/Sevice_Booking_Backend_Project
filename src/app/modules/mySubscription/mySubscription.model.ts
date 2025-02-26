import mongoose, { Schema } from "mongoose";
import { IMySubscription } from "./mySubscription.interface";


const mySubscriptionSchema = new Schema<IMySubscription>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expiryDate: { type: Date, required: true },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
    required: true,
  }
});


const MySubscription = mongoose.model<IMySubscription>("MySubcription", mySubscriptionSchema);

export default MySubscription;
