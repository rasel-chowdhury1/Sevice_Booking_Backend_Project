import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import config from '../../config';
import AppError from '../../error/AppError';
import { otpSendEmail } from '../../utils/eamilNotifiacation';
import { createToken, verifyToken } from '../../utils/tokenManage';
import { otpServices } from '../otp/otp.service';
import { generateOptAndExpireTime } from '../otp/otp.utils';
import { TUser } from '../user/user.interface';
import { User } from '../user/user.models';
import { OTPVerifyAndCreateUserProps } from '../user/user.service';
import { TLogin } from './auth.interface';
import { emitWarning } from 'process';

const twilio = require('twilio');

// Twilio credentials
const accountSid = config.twilio_account_sid;
const authToken = config.twilio_auth_token;
const twilioPhone = config.twilio_phone_number;
const supportEmail = config.support_email;
const supportPhone = config.support_phone;
// Create a Twilio client
const client = twilio(accountSid, authToken);
// Login
const login = async (payload: TLogin) => {
  const user = await User.isUserActive(payload?.email);


  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  if (!(await User.isPasswordMatched(payload.password, user.password))) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password does not match');
  }

  const jwtPayload: {
    userId: string;
    role: string;
    fullName?: string;
    email: string;
    phone?: string;
  } = {
    fullName: user?.fullName,
    email: user.email,
    phone: user.phone,
    userId: user?._id?.toString() as string,
    role: user?.role,
  };


  const accessToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_access_secret as string,
    expity_time: config.jwt_access_expires_in as string,
  });

  const refreshToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_refresh_secret as string,
    expity_time: config.jwt_refresh_expires_in as string,
  });

  return {
    user,
    accessToken,
    refreshToken,
    support: {
      email: supportEmail,
      phone: supportPhone
    }
  };
};

// forgot Password by email
const forgotPasswordByEmail = async (email: string) => {
  const user: TUser | null = await User.isUserActive(email);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  const { isExist, isExpireOtp } = await otpServices.checkOtpByEmail(email);

  const { otp, expiredAt } = generateOptAndExpireTime();

  if (isExist && !isExpireOtp) {
    throw new AppError(httpStatus.BAD_REQUEST, 'otp-exist. Check your email.');
  } else if (isExist && isExpireOtp) {
    const otpUpdateData = {
      otp,
      expiredAt,
      status: 'pending',
    };

    await otpServices.updateOtpByEmail(email, otpUpdateData);
  }

  const jwtPayload = {
    email: email,
    userId: user?._id,
  };

  const forgetToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_access_secret as string,
    expity_time: config.otp_token_expire_time as string | number,
  });

  process.nextTick(async () => {
    await otpSendEmail({
      sentTo: email,
      subject: 'Your one time otp for forget password',
      name: '',
      otp,
      expiredAt: expiredAt,
    });
  });

  return { forgetToken };
};

// forgot Password by number
const forgotPasswordByNumber = async (phoneNumber: string) => {
  if (!phoneNumber) {
    throw new AppError(httpStatus.BAD_REQUEST, 'phone number is required');
  }


  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    // // Send the SMS
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: twilioPhone,
      to: phoneNumber,
    });

    return { message: 'OTP sent successfully', otp };
    // res.status(200).json({ message: "OTP sent successfully", otp }); // For dev, include OTP (remove in prod)
  } catch (error: any) {
    console.log(error)
    return { message: 'Failed to send OTP', error: error.message };
    // res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};

// forgot  Password Otp Match
const forgotPasswordOtpMatch = async ({
  otp,
  token,
}: OTPVerifyAndCreateUserProps) => {
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token not found');
  }

  const decodeData = verifyToken({
    token,
    access_secret: config.jwt_access_secret as string,
  });

  if (!decodeData) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not authorised');
  }

  const { email } = decodeData;

  const isOtpMatch = await otpServices.otpMatch(email, otp);

  if (!isOtpMatch) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP did not match');
  }

  process.nextTick(async () => {
    await otpServices.updateOtpByEmail(email, {
      status: 'verified',
    });
  });

  const user: TUser | null = await User.isUserActive(email);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  const jwtPayload = {
    email: email,
    userId: user?._id,
  };

  const forgetOtpMatchToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_access_secret as string,
    expity_time: config.otp_token_expire_time as string | number,
  });

  return { forgetOtpMatchToken };
};

// Reset password
const resetPassword = async ({
  token,
  newPassword,
  confirmPassword,
}: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  if (newPassword !== confirmPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password does not match');
  }

  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token not found');
  }

  const decodeData = verifyToken({
    token,
    access_secret: config.jwt_access_secret as string,
  });

  if (!decodeData) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not authorised');
  }

  const { email, userId } = decodeData;

  const user: TUser | null = await User.isUserActive(email);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const result = await User.findByIdAndUpdate(
    userId,
    { password: hashedPassword },
    { new: true },
  );

  return result;
};

// Change password
const changePassword = async ({
  userId,
  newPassword,
  oldPassword,
}: {
  userId: string;
  newPassword: string;
  oldPassword: string;
}) => {
  const user = await User.IsUserExistById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!(await User.isPasswordMatched(oldPassword, user.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Old password does not match');
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const result = await User.findByIdAndUpdate(
    userId,
    { password: hashedPassword },
    { new: true },
  );

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User updating failed');
  }

  return result;
};

// rest ..............................

// Forgot password

// Refresh token
const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token not found');
  }

  const decoded = verifyToken({
    token,
    access_secret: config.jwt_refresh_secret as string,
  });

  const { email } = decoded;

  const activeUser = await User.isUserActive(email);

  if (!activeUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const jwtPayload: {
    userId: string;
    role: string;
    fullName?: string;
    email: string;
    phone?: string;
  } = {
    fullName: activeUser?.fullName,
    email: activeUser.email,
    phone: activeUser.phone,
    userId: activeUser?._id?.toString() as string,
    role: activeUser?.role,
  };

  const accessToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_access_secret as string,
    expity_time: config.jwt_access_expires_in as string,
  });

  return {
    accessToken,
  };
};

export const authServices = {
  login,
  forgotPasswordOtpMatch,
  changePassword,
  forgotPasswordByEmail,
  forgotPasswordByNumber,
  resetPassword,
  refreshToken,
};

// <Table
//   dataSource={mappedOrders}
//   columns={[
//     {
//       title: "Order ID",
//       dataIndex: "orderId",
//       render: (text, record) => (
//         <Link
//           to={{
//             pathname: `/orders-received-details/${record.orderId}`, // Pass the product ID
//             state: { order: record }, // Pass the order object as state
//           }}
//         >
//           {text}
//         </Link>
//       ),
//     },
//     // other columns
//   ]}
// />
