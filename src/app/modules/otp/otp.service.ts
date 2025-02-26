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

  console.log({ email });

  console.log({ isExist });

  const isExpireOtp = await Otp.findOne({
    sentTo: email,
    expiredAt: { $lt: new Date() }, // Use the `$gt` operator for comparison
  });

  console.log({ isExpireOtp });

  console.log('.........');

  return { isExist, isExpireOtp };
};

const checkOtpByNumber = async (phone: string) => {
  const isExist = await Otp.findOne({
    sentTo: phone,
  });

  console.log({ phone });

  console.log({ isExist });

  const isExpireOtp = await Otp.findOne({
    sentTo: phone,
    expiredAt: { $lt: new Date() }, // Use the `$gt` operator for comparison
  });

  console.log({ isExpireOtp });

  console.log('.........');

  return { isExist, isExpireOtp };
};

const otpMatch = async (email: string, otp: string) => {
  console.log(email, otp);
  const isOtpMatch = await Otp.findOne({
    sentTo: email,
    otp,
    status: 'pending',
    expiredAt: { $gt: new Date() },
  });

  console.log({ isOtpMatch });

  return isOtpMatch;
};

const updateOtpByEmail = async (
  email: string,
  payload: Record<string, any>,
) => {
  console.log(payload);
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

  console.log('========  before verify token ======', token);
  const decodeData = verifyToken({
    token,
    access_secret: config.jwt_access_secret as string,
  });
  console.log('========  before verify token ======');
  const { email } = decodeData;

  console.log('resend otp email => ', { email });

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
