import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { userService } from './user.service';

import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { storeFiles } from '../../utils/fileHelper';
import { eventService } from '../event/event.service';
import { User } from './user.models';
import Notification from '../notification/notification.model';

const createUser = catchAsync(async (req: Request, res: Response) => {
  console.log(req.body);
  const createUserToken = await userService.createUserToken(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Check email for OTP',
    data: { createUserToken },
  });
});

const createUserAdmin = catchAsync(async (req: Request, res: Response) => {
  console.log(req.body);
  req.body.role = 'admin';
  const createUserToken = await userService.createUserToken(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Check email for OTP',
    data: { createUserToken },
  });
});


const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  console.log('====== req files data ======', req.files);
  console.log('====== req body data ======', req.body);

  // Check if there are uploaded files
  if (req.files) {
    try {
      // Use storeFiles to process all uploaded files
      const filePaths = storeFiles(
        'profile',
        req.files as { [fieldName: string]: Express.Multer.File[] },
      );

      console.log('==== file paths =====', filePaths);

      // Set image (single file)
      if (filePaths.image && filePaths.image.length > 0) {
        req.body.image = filePaths.image[0]; // Assign first image
      }

      // Set photos (multiple files)
      if (filePaths.document && filePaths.document.length > 0) {
        req.body.document = filePaths.document[0]; // Assign full array of photos
      }

      // Set photos (multiple files)
      if (filePaths.photos && filePaths.photos.length > 0) {
        req.body.photos = filePaths.photos; // Assign full array of photos
      }

      console.log('body data =>>> ', req.body);
    } catch (error: any) {
      console.error('Error processing files:', error.message);
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: 'Failed to process uploaded files',
        data: null,
      });
    }
  }

  const result = await userService.updateUser(req?.user?.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'profile updated successfully',
    data: result,
  });
});

const isUserEmailExist = catchAsync(async (req, res) => {
  // const as = await User.findById('674db0fb690c8d666f6c3a1c');
  console.log(req);
  const { email } = req.query;
  console.log({ email });

  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Please provide Email ...');
  }

  const result = await User.findOne({ email }).select('email phone');
  console.log({ result });
  // const result = await User.find('674db0fb690c8d666f6c3a1c').populate(
  //   'mentorRegistrationId',
  // );

  if (result) {
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      // meta: result.meta,
      data: result,
      message: 'User email is exist!!',
    });
  } else {
    throw new AppError(httpStatus.BAD_REQUEST, 'Email does not exits ...');
  }
});

const userCreateVarification = catchAsync(async (req, res) => {
  console.log('..........1..........');
  const token = req.headers?.token as string;
  console.log('======= token ======', token);
  const { otp } = req.body;
  console.log('otp', otp);
  const newUser = await userService.otpVerifyAndCreateUser({ otp, token });

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User create successfully',
    data: newUser,
  });
});

const getUsersByRole = catchAsync(async (req: Request, res: Response) => {
  const { role } = req.params;
  console.log({ role });
  const result = await userService.getUserByRole(role);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${role} fetched successfully`,
    data: result,
  });
});

const getUserWallet = catchAsync(async (req: Request, res: Response) => {
  const {userId} = req.user;

  console.log("user id ->>>>>> ",{userId})
  const result = await userService.getUserWallet(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User wallet fetched successfully`,
    data: result,
  });
});

const verifyUserByAdmin = catchAsync(async (req: Request, res: Response) => {
  
  const adminId = req.user.userId;
  const { userId } = req.params;
  console.log({ userId });

  const result = await userService.verifyUserByAdmin(userId);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User verified successfully`,
    data: result,
  });
});

const blockUserByAdmin = catchAsync(async (req: Request, res: Response) => {
  
  const { userId } = req.params;
  console.log({ userId });

  const result = await userService.blockedUser(userId);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User verified successfully`,
    data: result,
  });
});

const unBlockUserByAdmin = catchAsync(async (req: Request, res: Response) => {
  
  const { userId } = req.params;

  const result = await userService.unBlockedUser(userId);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User unBlocked successfully`,
    data: result,
  });
});

const getNearestGuides = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  
  console.log("req.query ===>>>> ", req.query)
  // Destructure lat and long from query parameters
  const { lat, long } = req.query;

  // Prepare data with latitude and longitude
  const data: { latitude?: number, longitude?: number } = {};

  // If lat and long are provided, convert them to numbers and assign to data
  if (lat && long) {
    data.latitude = parseFloat(lat as string);
    data.longitude = parseFloat(long as string);
  }

  console.log(" data ===>>> ", data)

  // Call the service to get nearest guides
  const result = await userService.getNearestGuides(userId, data);

  // Send the response with the fetched data
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Guides fetched successfully',
    data: result,
  });
});


const getNearestGuidesAndEvents = catchAsync(
  async (req: Request, res: Response) => {
    console.log('======= user data ====>>>>>> ', req.user);
    const { userId, role } = req.user;
    let users;
    let seekers = null;
    let events;

    // Destructure lat and long from query parameters
  const { lat, long } = req.query;

  // Prepare data with latitude and longitude
  const data: { latitude?: number, longitude?: number } = {};

  // If lat and long are provided, convert them to numbers and assign to data
  if (lat && long) {
    data.latitude = parseFloat(lat as string);
    data.longitude = parseFloat(long as string);
  }

  console.log(" data ===>>> ", data)

    if (role === 'seeker') {
      users = await userService.getNearestGuides(userId,data, {
        image: 1,
        fullName: 1,
        address: 1,
        location: 1,
        role: 1,
        type: 1,
      });
      seekers = await userService.getNearestSeekers(userId,data, {
        image: 1,
        fullName: 1,
        address: 1,
        location: 1,
        role: 1,
        type: 1,
      });
      events = await eventService.getNearestEvents(userId,data, {
        title: 1,
        bannerImage: 1,
        address: 1,
        location: 1,
        type: 1,
      });
    } else {
      users = await userService.getNearestSeekers(userId, data, {
        image: 1,
        fullName: 1,
        address: 1,
        location: 1,
        role: 1,
        type: 1,
      });
      events = await eventService.getNearestEvents(userId, data, {
        title: 1,
        bannerImage: 1,
        address: 1,
        location: 1,
        type: 1,
      });
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Nearest users and events fetched successfully`,
      data: { users, seekers, events },
    });
  },
);

const getIsLookingForGuide  = catchAsync(async (req: Request, res: Response) => {
  const {userId} = req.user
  const result = await User.findById(userId).select("isLookingGuide");
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User fetched successfully`,
    data: result,
  });
});

const getIslookingGuideOfSeekers  = catchAsync(async (req: Request, res: Response) => {
  const {userId} = req.user
  const result = await userService.getIslookingGuideOfSeekers(userId)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `IsLookingGuide seekers fetched successfully`,
    data: result,
  });
});

const updateIsLookingForGuide = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { isLookingGuide } = req.body; // Extract the isLookingForGuide value from the request body

  // Update the user's isLookingForGuide field
  const result = await User.findByIdAndUpdate(
    userId,
    { isLookingGuide: isLookingGuide }, // Ensure the field name matches
    { new: true } // Return the updated user document
  ).select("isLookingGuide"); // Select only the field you're updating

  // Send the response with the updated field
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `IsLookingForGuide status updated successfully`,
    data: result,
  });
});


// rest >...............

const getMentor = catchAsync(async (req, res) => {
  // const as = await User.findById('674db0fb690c8d666f6c3a1c');

  const result = await User.findById('674db0fb690c8d666f6c3a1c').populate(
    'mentorRegistrationId',
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    // meta: result.meta,
    data: result,
    message: 'Users All are requered successful!!',
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await userService.getAllUserQuery(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: result.meta,
    data: result.result,
    message: 'Users All are requered successful!!',
  });
});

const getAllUserCount = catchAsync(async (req, res) => {
  const result = await userService.getAllUserCount();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Users All Count successful!!',
  });
});

const getAllSeekerCount = catchAsync(async (req, res) => {
  const result = await userService.getAllSeekerCount();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Mentors All Count successful!!',
  });
});

const getAllPlusOneCount = catchAsync(async (req, res) => {
  const result = await userService.getAllPlusOneCount();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Mentees All Count successful!!',
  });
});


const getUserStatistics = catchAsync(async (req, res) => {
  console.log("get all user overviewo _>>>> ");
  const {userId} = req.user;
  const result = await userService.getUserStatistics();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'All User Count successful!!',
  });
});

const getYearlyUserOverview = catchAsync(async (req, res) => {
  console.log("get all user overviewo _>>>> ");

  // Default to the current year if the 'year' query parameter is not provided
  const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
  
  // Ensure the year is valid
  if (isNaN(year)) {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Invalid year parameter.',
      data: null,
    });
  }

  const result = await userService.getYearlyUserOverview(year);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'All user overview...',
  });
});

const getAllUserRasio = catchAsync(async (req, res) => {
  const yearQuery = req.query.year;

  // Safely extract year as string
  const year = typeof yearQuery === 'string' ? parseInt(yearQuery) : undefined;

  if (!year || isNaN(year)) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Invalid year provided!',
      data: {},
    });
  }

  const result = await userService.getAllUserRatio(year);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Users All Ratio successful!!',
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getUserById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User fetched successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {

  console.log("get my profile -=->>>> ", req?.user?.userId)
  const result = await userService.getUserById(req?.user?.userId);

  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'profile fetched successfully',
    data: {result, support:{email:"support@gmail.com", phone: "01855859847"}},
  });
});


const blockedUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.blockedUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User Blocked successfully',
    data: result,
  });
});

const deleteMyAccount = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.deleteMyAccount(req.user?.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

export const userController = {
  createUser,
  getNearestGuidesAndEvents,
  isUserEmailExist,
  userCreateVarification,
  getUsersByRole,
  verifyUserByAdmin,
  getUserById,
  getMyProfile,
  getNearestGuides,
  updateMyProfile,
  blockedUser,
  deleteMyAccount,
  getAllUsers,
  getAllUserCount,
  getAllSeekerCount,
  getAllPlusOneCount,
  getAllUserRasio,
  getMentor,
  getUserStatistics,
  getYearlyUserOverview,
  getIsLookingForGuide,
  updateIsLookingForGuide,
  getIslookingGuideOfSeekers,
  getUserWallet,
  blockUserByAdmin,
  unBlockUserByAdmin
};
