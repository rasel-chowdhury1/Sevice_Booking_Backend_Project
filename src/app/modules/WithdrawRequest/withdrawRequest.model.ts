import mongoose, { Schema } from 'mongoose';
import { IWithdrawRequest, PaymentGateway, RequestStatus } from './WithdrawRequest.interface';



// Withdraw Request Schema
const withdrawRequestSchema = new Schema<IWithdrawRequest>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: Object.values(RequestStatus),default: RequestStatus.Pending },
    paymentGateway: { type: String, enum: Object.values(PaymentGateway),default: PaymentGateway.Bank },
    bankInfo: {
      bankName: { type: String },
      accountNumber: { type: String },
      accountName: { type: String },
      accountType: { type: String },
    },
    paypalInfo: {
      accountName: { type: String },
      bsbNumber: { type: String },
      accountNumber: { type: String },
      bicCode: { type: String },
      recipientAddress: { type: String },
    },
  },
  { timestamps: true }
);

// Withdraw Request Model
const WithdrawRequest = mongoose.model<IWithdrawRequest>('WithdrawRequest', withdrawRequestSchema);

export default WithdrawRequest;
