import mongoose, { Schema } from 'mongoose';
import { IPayment } from './payment.interface';

const paymentSchema: Schema = new Schema<IPayment>(
    {
    user_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true
    },
    guide_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    commission: { 
        type: Number, 
        required: true 
    },
    netAmount: { 
        type: Number, 
        required: true 
    }, // Amount to be sent to guide
    paymentStatus: { 
        type: String, 
        enum: ["pending", "completed", "refunded"], default: "pending" 
    },
    transactionId: { 
        type: String, 
        required: true 
    },
    paymentMethod: { 
        type: String, 
        enum: ["paypal"], 
        required: true 
    },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

const Payment  = mongoose.model<IPayment>(
    'Payment',
    paymentSchema,
);
export default Payment;
