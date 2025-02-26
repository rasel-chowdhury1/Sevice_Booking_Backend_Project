import mongoose, { Schema } from 'mongoose';
import { TOtp } from './otp.interface';

const otpSchema: Schema = new Schema<TOtp>(
    {
        sentTo: {
            type: String,
            required: [true, "Receiver source is required"],
        },
        receiverType: {
            type: String,
            enum: ["email", "phone"],
            default: "email",
        },
        purpose: {
            type: String,
            enum: ["email-verification", "reset-password", "forget-password"],
            default: "email-verification",
        },
        otp: {
            type: String,
            required: [true, "OTP must be provided"],
            trim: true,
        },
        expiredAt: {
            type: Date,
            required: [true, "Expiration date must be provided"],
        },
        status: {
            type: String,
            enum: ["pending", "verified", "expired"],
            default: "pending",
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

const Otp = mongoose.model<TOtp>(
    'Otp',
    otpSchema,
);
export default Otp;
