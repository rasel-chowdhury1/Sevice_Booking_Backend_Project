export type TReceiverType = 'email' | 'phone';
export type TPurposeType =
  | 'email-verification'
  | 'forget-password'
  | 'reset-password';
export type TStatus = 'pending' | 'verified' | 'expired';

export interface CreateOtpParams {
  name: string;
  sentTo: string;
  receiverType: TReceiverType;
  purpose: TPurposeType;
  otp: string;
  expiredAt: string;
}

export interface TOtp {
  sentTo: string;
  receiverType: TReceiverType;
  purpose: TPurposeType;
  otp: string;
  expiredAt: Date;
  status: TStatus;
}
