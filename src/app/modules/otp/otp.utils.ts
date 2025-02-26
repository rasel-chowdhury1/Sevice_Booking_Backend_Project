import moment from 'moment';
import config from '../../config';
import { generateOtp } from '../../utils/otpGenerator';

const generateOptAndExpireTime = () => {
  const otp = generateOtp();

  const otpExpiryTime = parseInt(config.otp_expire_time as string) || 1;

  const expiredAt = moment().add(otpExpiryTime, 'minute').toISOString();

  return {
    otp,
    expiredAt,
  };
};

export { generateOptAndExpireTime };
