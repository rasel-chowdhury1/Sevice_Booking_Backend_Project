import httpStatus from 'http-status';
import config from '../../config';
import AppError from '../../error/AppError';
import { otpSendEmail } from '../../utils/eamilNotifiacation';
import { verifyToken } from '../../utils/tokenManage';
import { CreateOtpParams } from './otp.interface';
import Otp from './otp.model';
import { generateOptAndExpireTime } from './otp.utils';

const createOtp = async ({
  name,
  sentTo,
  receiverType,
  purpose,
  otp,
  expiredAt,
}: CreateOtpParams) => {
  // const expiredAtDate = new Date(expiredAt);
  const newOTP = new Otp({
    sentTo,
    receiverType,
    purpose,
    otp,
    expiredAt,
  });

  await newOTP.save();

  return newOTP;
};

const checkOtpByEmail = async (email: string) => {
  const isExist = await Otp.findOne({
    sentTo: email,
  });



  const isExpireOtp = await Otp.findOne({
    sentTo: email,
    expiredAt: { $lt: new Date() }, // Use the `$gt` operator for comparison
  });


  return { isExist, isExpireOtp };
};

const checkOtpByNumber = async (phone: string) => {
  const isExist = await Otp.findOne({
    sentTo: phone,
  });



  const isExpireOtp = await Otp.findOne({
    sentTo: phone,
    expiredAt: { $lt: new Date() }, // Use the `$gt` operator for comparison
  });


  return { isExist, isExpireOtp };
};

const otpMatch = async (email: string, otp: string) => {

  const isOtpMatch = await Otp.findOne({
    sentTo: email,
    otp,
    status: 'pending',
    expiredAt: { $gt: new Date() },
  });


  return isOtpMatch;
};

const updateOtpByEmail = async (
  email: string,
  payload: Record<string, any>,
) => {

  const otpUpdate = await Otp.findOneAndUpdate(
    {
      sentTo: email,
    },
    payload,
    { new: true },
  );

  return otpUpdate;
};

const resendOtpEmail = async ({ token }: { token: string }) => {
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token not found');
  }


  const decodeData = verifyToken({
    token,
    access_secret: config.jwt_access_secret as string,
  });

  const { email } = decodeData;



  const { isExist, isExpireOtp } = await checkOtpByEmail(email);

  const { otp, expiredAt } = generateOptAndExpireTime();

  if (!isExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token data is not valid !!');
  } else if (isExist && !isExpireOtp) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Otp exist. Please check email.',
    );
  } else if (isExist && isExpireOtp) {
    const otpUpdateData = {
      otp,
      expiredAt,
    };

    await updateOtpByEmail(email, otpUpdateData);
  }

  process.nextTick(async () => {
    await otpSendEmail({
      sentTo: email,
      subject: 'Re-send your one time otp for email  verification',
      name: '',
      otp,
      expiredAt: expiredAt,
    });
  });
};

export const otpServices = {
  createOtp,
  checkOtpByEmail,
  checkOtpByNumber,
  otpMatch,
  updateOtpByEmail,
  resendOtpEmail,
};
