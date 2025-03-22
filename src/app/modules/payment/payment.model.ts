import mongoose, { Schema, Document } from 'mongoose';
import { IPayment } from './payment.interface';

const paymentSchema: Schema = new Schema<IPayment>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function (this: Document & IPayment): boolean {
        return this.paymentType === "booking"; // user_id is only required for one-time payments
      },
      default: null, // Set default to null for subscriptions
    },
    guide_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // guide_id is always required
    },
    amount: {
      type: Number,
      required: true,
    },
    commission: {
      type: Number,
      required: true,
    },
    netAmount: {
      type: Number,
      required: function (this: Document & IPayment): boolean {
        return this.paymentType === "booking"; // Only required for subscription payments
      },
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "paid", "refund"],
      default: "pending",
    },
    transactionId: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["paypal", "stripe","Stripe", "Card", "Bank"],
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["booking", "subscription"],
      required: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: function (this: Document & IPayment): boolean {
        return this.paymentType === "subscription"; // Only required for subscription payments
      },
    }
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model<IPayment & Document>("Payment", paymentSchema);

export default Payment;
