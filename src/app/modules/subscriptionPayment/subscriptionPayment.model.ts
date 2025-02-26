import mongoose, { Schema } from "mongoose";
import { ISubscriptionPayment } from "./subscriptionpayment.interface";

const subcriptioinPaymentSchema: Schema = new Schema<ISubscriptionPayment>(
{
  paymentId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Subscription", 
    required: true 
  },
  paymentType: {
    type: String,
    enum: ["Card", "Paypal", "Bank"],
    required: false
  }
},
{
  timestamps: true, // Automatically adds createdAt and updatedAt fields
}
)


const SubscriptionPayment = mongoose.model<ISubscriptionPayment>("SubscriptionPayment", subcriptioinPaymentSchema);

export default SubscriptionPayment;