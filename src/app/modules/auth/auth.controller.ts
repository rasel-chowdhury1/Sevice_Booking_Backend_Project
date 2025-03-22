import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import { authServices } from './auth.service';
import sendResponse from '../../utils/sendResponse';

import config from '../../config';
import { otpServices } from '../otp/otp.service';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import httpStatus from 'http-status';

const twilio = require('twilio');

// Twilio credentials
const accountSid = config.twilio_account_sid; 
const authToken = config.twilio_auth_token
const twilioPhone = config.twilio_phone_number
// Create a Twilio client
const client = twilio(accountSid, authToken);


// login
const login = catchAsync(async (req: Request, res: Response) => {
  console.log('login-1')
  const result = await authServices.login(req.body);
  console.log('login-2');
  const cookieOptions: any = {
    secure: false,
    httpOnly: true,
    maxAge: 31536000000,
  };

  if (config.NODE_ENV === 'production') {
    cookieOptions.sameSite = 'none';
  }



  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Logged in successfully',
    data: result,
  });
});

// change password
const changePassword = catchAsync(async (req: Request, res: Response) => {
  console.log("exist change password....");
  const { userId } = req?.user;
  const { newPassword, oldPassword } = req.body;
  console.log({userId, newPassword, oldPassword });

  const result = await authServices.changePassword({
    userId,
    newPassword,
    oldPassword,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully',
    data: result,
  });
});

// forgot password
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  // console.log("email");
  // console.log(req?.body?.email);
  const { email, phoneNumber } = req.body;

  console.log({email})
  console.log({phoneNumber})

  let result;
  
  if(email){
    console.log("email if exists")
    result = await authServices.forgotPasswordByEmail(email);
  }
  else{
    result = await authServices.forgotPasswordByNumber(phoneNumber);
  } 

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'An OTP sent to your email!',
    data: result,
  });
});

// forgot password
const forgotPasswordOtpMatch = catchAsync(
  async (req: Request, res: Response) => {
    const token = req?.headers?.token as string;

    const { otp } = req.body;

    const result = await authServices.forgotPasswordOtpMatch({ otp, token });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Otp match successfully',
      data: result,
    });
  },
);

// reset password
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req?.headers?.token as string;

  const { newPassword, confirmPassword } = req.body;

  console.log(newPassword, confirmPassword);

  const result = await authServices.resetPassword({
    token,
    newPassword,
    confirmPassword,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset successfully',
    data: result,
  });
});

// refresh token
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.headers?.refreshToken as string;
  const result = await authServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token retrieved successfully',
    data: result,
  });
});

export const authControllers = {
  login,
  changePassword,
  forgotPassword,
  forgotPasswordOtpMatch,
  resetPassword,
  refreshToken,
};
