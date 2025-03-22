import mongoose, { Document, ObjectId, Types } from 'mongoose';

// Enum for Payment Gateway
export enum PaymentGateway {
  Bank = 'Bank',
  Paypal = 'Paypal',
}

// Enum for Request Status
export enum RequestStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

// Interface for Withdraw Request, extending Document for Mongoose methods
export interface IWithdrawRequest extends Document {
  user: Types.ObjectId; // Reference to User model
  amount: number;
  status: RequestStatus;
  paymentGateway: PaymentGateway;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    accountType: string;
  };
  paypalInfo?: {
    accountName: string;
    bsbNumber: string;
    accountNumber: string;
    bicCode: string;
    recipientAddress: string;
  };
}

// Assuming you have the following types for IWalletTransaction
export interface IWalletTransaction {
  type: 'deposit' | 'payment' | 'withdrawal' | 'refund';  // The valid types
  amount: number;
  referenceId: Types.ObjectId;  // You can use ObjectId or string depending on how you reference
  date: Date;
}

