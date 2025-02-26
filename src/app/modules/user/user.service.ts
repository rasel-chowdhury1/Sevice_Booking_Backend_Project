/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import config from '../../config';
import AppError from '../../error/AppError';
import { otpSendEmail } from '../../utils/eamilNotifiacation';
import { createToken, verifyToken } from '../../utils/tokenManage';
import { TPurposeType } from '../otp/otp.interface';
import { otpServices } from '../otp/otp.service';
import { generateOptAndExpireTime } from '../otp/otp.utils';
import { USER_ROLE } from './user.constants';
import { DeleteAccountPayload, TUser, TUserCreate } from './user.interface';
import { User } from './user.models';

export type IFilter = {
  searchTerm?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export interface OTPVerifyAndCreateUserProps {
  otp: string;
  token: string;
}

// ====================== create user token start ================================
const createUserToken = async (payload: TUserCreate) => {
  console.log('payload service user');
  const { role, email, fullName, password, phone, about } = payload;

  // user role check
  if (!(role === USER_ROLE.SEEKER || role === USER_ROLE.GUIDE)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User data is not valid !!');
  }

  // user exist check
  const userExist = await userService.getUserByEmail(email);

  if (userExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already exist!!');
  }

  const { isExist, isExpireOtp } = await otpServices.checkOtpByEmail(email);

  const { otp, expiredAt } = generateOptAndExpireTime();

  let otpPurpose: TPurposeType = 'email-verification';

  if (isExist && !isExpireOtp) {
    throw new AppError(httpStatus.BAD_REQUEST, 'otp-exist. Check your email.');
  } else if (isExist && isExpireOtp) {
    const otpUpdateData = {
      otp,
      expiredAt,
    };

    await otpServices.updateOtpByEmail(email, otpUpdateData);
  } else if (!isExist) {
    await otpServices.createOtp({
      name: 'Customer',
      sentTo: email,
      receiverType: 'email',
      purpose: otpPurpose,
      otp,
      expiredAt,
    });
  }

  const otpBody: TUserCreate = {
    email,
    fullName,
    password,
    phone,
    role,
    about, // Include `about` directly

    // Provide default values for required properties
    notificationSettings: {
      generalNotification: true,
      subscription: true,
    },
    privacySettings: {
      profileView: 'public',
      contactPermission: 'anyone',
    },
  };

  if (about) {
    otpBody.about = about;
  }

  // send email
  console.log('before otp send email');
  process.nextTick(async () => {
    await otpSendEmail({
      sentTo: email,
      subject: 'Your one time otp for email  verification',
      name: 'Customer',
      otp,
      expiredAt: expiredAt,
    });
  });
  console.log('after otp send email');

  // crete token
  const createUserToken = createToken({
    payload: otpBody,
    access_secret: config.jwt_access_secret as string,
    expity_time: config.otp_token_expire_time as string | number,
  });

  console.log({ createUserToken });

  return createUserToken;
};
// ====================== create user token end ================================

// ====================== otp verify and create user token start ==========================
const otpVerifyAndCreateUser = async ({
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

  console.log({ decodeData });

  if (!decodeData) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not authorised');
  }

  const { password, email, role } = decodeData;

  console.log({ otp });

  const isOtpMatch = await otpServices.otpMatch(email, otp);

  if (!isOtpMatch) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP did not match');
  }

  process.nextTick(async () => {
    await otpServices.updateOtpByEmail(email, {
      status: 'verified',
    });
  });

  if (!(role === USER_ROLE.SEEKER || role === USER_ROLE.GUIDE)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User data is not valid !!');
  }

  const userData = {
    password,
    email,
    role,
  };

  const isExist = await User.isUserExist(email as string);

  if (isExist) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'User already exists with this email',
    );
  }

  console.log({ userData });
  console.log('user service otp: -> ');
  const user = await User.create(userData);

  console.log('user service otp: -> ', user);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User creation failed');
  }

  const jwtPayload: {
    userId: string;
    role: string;
    email: string;
  } = {
    email: user.email,
    userId: user?._id?.toString() as string,
    role: user?.role,
  };

  // console.log({ jwtPayload });
  console.log('user user', user);

  const accessToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_access_secret as string,
    expity_time: '20m',
  });

  return accessToken;
};
// ====================== otp verify and create user token end ==========================

// ====================== update user without role, email,isActive,isDeleted, password,  start ==========================
const updateUser = async (id: string, payload: Partial<TUser>) => {
  const {
    role,
    email,
    isActive,
    isDeleted,
    password,
    photos,
    deletePhotos,
    adminVerified,
    longitude,
    latitude,
    ...rest
  } = payload;

  if(role === 'guide'){

  }

  let delPhotos = deletePhotos;
  console.log('===== update user ==== ', delPhotos);
  if (longitude !== undefined && latitude !== undefined) {
    rest.location = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    };
  }
  // Fetch the existing user to get current photos
  const existingUser = (await User.findById(id)) as TUser | null;

  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }


  // Ensure `interests` is an array if passed as a string
  if (typeof deletePhotos === 'string') {
    delPhotos = JSON.parse(deletePhotos);
  }

  console.log('===== update user ==== ', delPhotos);
  // Handle deleting photos
  if (deletePhotos && Array.isArray(delPhotos)) {
    (rest as Partial<TUser>).photos = existingUser.photos?.filter(
      (photo) => !delPhotos.includes(photo),
    );
  } else {
    (rest as Partial<TUser>).photos = existingUser.photos;
  }

  // If there are new photos, merge them with the existing ones
  if (photos && Array.isArray(photos)) {
    // rest.photos = [...(existingUser?.photos || []), ...photos]; // Append new photos
    (rest as Partial<TUser>).photos = [
      ...(existingUser?.photos || []),
      ...photos,
    ]; // Append new photos
  }

  // Ensure `interests` is an array if passed as a string
  if (typeof rest.interests === 'string') {
    rest.interests = JSON.parse(rest.interests);
  }

  console.log('update user data ===== ', payload);

  console.log('rest data ===> ', rest);

  const user = await User.findByIdAndUpdate(id, rest, { new: true });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User updating failed');
  }

  return user;
};

// const updateUserSettings = async (id: string, payload: any) => {}

// ============= get Nearest guides functionlity start ================
const getNearestGuides = async (userId: string, projects?: {}) => {
  try {
    // 1️⃣ Check if the seeker exists
    const seeker = await User.findById(userId);

    if (!seeker) {
      throw new AppError(httpStatus.NOT_FOUND, 'Seeker not found');
    }

    // 2️⃣ Extract location & interests
    const { location, interests } = seeker;

    if (
      !location ||
      !location.coordinates ||
      location.coordinates.length !== 2
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Seeker location is missing or invalid',
      );
    }

    const [longitude, latitude] = location.coordinates;

    // ✅ Safe handling of `interests` to prevent `undefined` error
    const seekerInterestsArray =
      Array.isArray(interests) && interests.length > 0 ? interests : [];

    console.log('==== Seeker Location & Interests ===', {
      longitude,
      latitude,
      seekerInterestsArray,
    });

    // 3️⃣ Query nearest guides
    const guides = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          // key: "location",
          distanceField: 'distance',
          maxDistance: 5000, // ✅ 5km max distance filter
          spherical: true,
        },
      },
      {
        $match: {
          role: 'guide', // ✅ Only guides
          isActive: true,
          isDeleted: false,
          isBlocked: false,
          ...(seekerInterestsArray.length > 0 && {
            interests: { $in: seekerInterestsArray },
          }), // ✅ Filter by shared interests
        },
      },
      {
        $sort: { rating: -1 }, // ✅ Sort by highest rating
      },
      {
        $addFields: {
          type: 'user', // ✅ Add `type: user` to each document
        },
      },
      {
        $project: projects || {
          image: 1,
          fullName: 1,
          email: 1,
          phone: 1,
          location: 1,
          address: 1,
          about: 1,
          rating: 1,
          interests: 1,
          distance: 1, // ✅ Return distance in meters
          photos: 1,
          adminVerified: 1,
          myFee: 1,
        },
      },
    ]);

    return guides;
  } catch (error) {
    console.error('Error fetching nearest guides:', error);

    // ✅ Ensure error is properly typed before accessing `message`
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, errorMessage);
  }
};
// ============= get Nearest guides functionlity end ================

// ============= get Nearest Seeker functionlity start ================
const getNearestSeekers = async (userId: string, projects?: {}) => {
  try {
    // 1️⃣ Check if the seeker exists
    const plusone = await User.findById(userId);

    if (!plusone) {
      throw new AppError(httpStatus.NOT_FOUND, 'Seeker not found');
    }

    // 2️⃣ Extract location & interests
    const { location, interests } = plusone;

    if (
      !location ||
      !location.coordinates ||
      location.coordinates.length !== 2
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Seeker location is missing or invalid',
      );
    }

    const [longitude, latitude] = location.coordinates;

    // ✅ Safe handling of `interests` to prevent `undefined` error
    const seekerInterestsArray =
      Array.isArray(interests) && interests.length > 0 ? interests : [];

    console.log('==== Seeker Location & Interests ===', {
      longitude,
      latitude,
      seekerInterestsArray,
    });

    // 3️⃣ Query nearest guides
    const guides = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          // key: "location",
          distanceField: 'distance',
          maxDistance: 5000, // ✅ 5km max distance filter
          spherical: true,
        },
      },
      {
        $match: {
          role: 'seeker', // ✅ Only guides
          isActive: true,
          isDeleted: false,
          isBlocked: false,
          ...(seekerInterestsArray.length > 0 && {
            interests: { $in: seekerInterestsArray },
          }), // ✅ Filter by shared interests
        },
      },
      {
        $sort: { rating: -1 }, // ✅ Sort by highest rating
      },
      {
        $addFields: {
          type: 'user', // ✅ Add `type: user` to each document
        },
      },
      {
        $project: projects || {
          image: 1,
          fullName: 1,
          email: 1,
          phone: 1,
          location: 1,
          address: 1,
          about: 1,
          rating: 1,
          interests: 1,
          distance: 1, // ✅ Return distance in meters
          photos: 1,
          adminVerified: 1,
          myFee: 1,
        },
      },
    ]);

    return guides;
  } catch (error) {
    console.error('Error fetching nearest guides:', error);

    // ✅ Ensure error is properly typed before accessing `message`
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, errorMessage);
  }
};
// ============= get Nearest Seeker functionlity end ================

const getAllUserQuery = async (query: Record<string, unknown>) => {
  console.log('========>>>>>::', typeof query.isSubcription);
  // Convert 'isSubcription' query parameter to a boolean
  if (query.isSubcription !== undefined) {
    query.isSubcription = query.isSubcription === 'true';
  }

  const userQuery = new QueryBuilder(User.find({ isDeleted: false }), query)
    .search(['fullName'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();
  // const result = await User.find({ isSubcription:false} );

  // console.log(result,"-----------<>")
  return { meta, result };
};

const getAllUserCount = async () => {
  const allUserCount = await User.countDocuments();
  return allUserCount;
};

const getAllSeekerCount = async () => {
  const allUserCount = await User.find({
    role: USER_ROLE.SEEKER,
  }).countDocuments();
  return allUserCount;
};

const getAllPlusOneCount = async () => {
  const allUserCount = await User.find({
    role: USER_ROLE.GUIDE,
  }).countDocuments();
  return allUserCount;
};

const getUserOverview = async () => {
  try {
    // Fetch total user count
    const allUserCount = await User.countDocuments();

    // Fetch seekers and plus one users
    const allSeekerCount = await User.countDocuments({
      role: USER_ROLE.SEEKER,
    });
    const allPlusoneCount = await User.countDocuments({
      role: USER_ROLE.GUIDE,
    });

    // Fetch user growth over time (monthly count)
    const userOverview = await User.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fetch income statistics (monthly income)
    // const incomeOverview = await Payment.aggregate([
    //   {
    //     $group: {
    //       _id: { $month: "$createdAt" },
    //       totalIncome: { $sum: "$amount" }
    //     }
    //   },
    //   { $sort: { _id: 1 } }
    // ]);

    // Fetch recent users
    const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(6);
    // .select('fullName gender email phone role userType');

    return {
      totalUsers: allUserCount,
      seekers: allSeekerCount,
      guides: allPlusoneCount,
      userOverview,
      // incomeOverview,
      recentUsers,
    };
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    throw new Error('Error fetching dashboard data.');
  }
};

const getAllUserRatio = async (year: number) => {
  const startOfYear = new Date(year, 0, 1); // January 1st of the given year
  const endOfYear = new Date(year + 1, 0, 1); // January 1st of the next year

  // Create an array with all 12 months to ensure each month appears in the result
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    mentorCount: 0, // Default mentor count
    menteeCount: 0, // Default mentee count
  }));

  // Aggregate mentor and mentee counts by month and role
  const userCounts = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfYear, $lt: endOfYear },
        role: { $in: ['seeker', 'guide'] }, // Filter for mentors and mentees
      },
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' }, // Group by month
          role: '$role', // Group by role (mentor or mentee)
        },
        userCount: { $sum: 1 }, // Count users for each group
      },
    },
    {
      $project: {
        month: '$_id.month', // Extract month from the group
        role: '$_id.role', // Extract role from the group
        userCount: 1, // Include user count
        _id: 0, // Exclude _id from the result
      },
    },
    {
      $sort: { month: 1, role: 1 }, // Sort by month and role
    },
  ]);

  // Merge the result with months array
  userCounts.forEach((count) => {
    const monthData = months.find((m) => m.month === count.month);
    if (monthData) {
      if (count.role === 'mentor') {
        monthData.mentorCount = count.userCount; // Set mentor count
      } else if (count.role === 'mentee') {
        monthData.menteeCount = count.userCount; // Set mentee count
      }
    }
  });

  // Return the result
  return months;
};

const getUserById = async (id: string) => {
  console.log('=== get specific user id ==== ', id);
  const result = await User.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  return result;
};

const getUserByEmail = async (email: string) => {
  const result = await User.findOne({ email });

  return result;
};

const getUserByRole = async (role: string) => {
  console.log('get user by role ====> ', role);
  const result = await User.find({ role });

  return result;
};

const deleteMyAccount = async (id: string, payload: DeleteAccountPayload) => {
  const user: TUser | null = await User.IsUserExistById(id);

  console.log('==== user data =-== ', { user });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user?.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted');
  }

  if (!(await User.isPasswordMatched(payload.password, user.password))) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password does not match');
  }

  const userDeleted = await User.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!userDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'user deleting failed');
  }

  return userDeleted;
};

const verifyUserByAdmin = async (id: string) => {
  const singleUser = await User.IsUserExistById(id);

  if (!singleUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (!singleUser.isActive) {
    throw new AppError(httpStatus.NOT_FOUND, 'User Already Blocked');
  }

  if (singleUser.adminVerified) {
    throw new AppError(httpStatus.NOT_FOUND, 'User Already Verified');
  }

  const user = await User.findByIdAndUpdate(
    id,
    { adminVerified: true },
    { new: true },
  );

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'user verified failed');
  }



  return user;
};

const blockedUser = async (id: string) => {
  const singleUser = await User.IsUserExistById(id);

  if (!singleUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (!singleUser.isActive) {
    throw new AppError(httpStatus.NOT_FOUND, 'User Already Blocked');
  }
  // let status;

  // if (singleUser?.isActive) {
  //   status = false;
  // } else {
  //   status = true;
  // }
  let status = !singleUser.isActive;
  console.log('status', status);
  const user = await User.findByIdAndUpdate(
    id,
    { isActive: status },
    { new: true },
  );

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'user deleting failed');
  }

  return user;
};

export const userService = {
  createUserToken,
  otpVerifyAndCreateUser,
  getUserById,
  getUserByEmail,
  getUserByRole,
  getNearestGuides,
  getNearestSeekers,
  updateUser,
  deleteMyAccount,
  verifyUserByAdmin,
  blockedUser,
  getAllUserQuery,
  getAllUserCount,
  getAllSeekerCount,
  getAllPlusOneCount,
  getAllUserRatio,
  getUserOverview,
};
