import { Router } from 'express';
import auth from '../../middleware/auth';
import fileUpload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
import validateRequest from '../../middleware/validateRequest';
import { resentOtpValidations } from '../otp/otp.validation';
import { USER_ROLE } from './user.constants';
import { userController } from './user.controller';
import { userValidation } from './user.validation';
const upload = fileUpload('./public/uploads/profile');

export const userRoutes = Router();

userRoutes
  .post(
    '/create',
    validateRequest(userValidation?.userValidationSchema),
    userController.createUser,
  )

  // crate user verify otp
  .post(
    '/create-user-verify-otp',
    validateRequest(resentOtpValidations.verifyOtpZodSchema),
    userController.userCreateVarification,
  )

  // check email is exist route
  .get('/email-exist', userController.isUserEmailExist)

  // my profile route
  .get(
    '/my-profile',
    auth(USER_ROLE.SEEKER, USER_ROLE.ADMIN, USER_ROLE.GUIDE),
    userController.getMyProfile,
  )

  // nearest guide of user
  .get(
    '/nearest-guides',
    auth(USER_ROLE.SEEKER),
    userController.getNearestGuides,
  )

  // nearest users and event data of  user
  .get(
    '/nearest-users-events',
    auth(USER_ROLE.SEEKER, USER_ROLE.GUIDE),
    userController.getNearestGuidesAndEvents,
  )

  .get("/isLookingForGuide", 
    auth(USER_ROLE.SEEKER),
    userController.getIsLookingForGuide
  )

  .get("/isLookingGuideSeekers",
    auth(USER_ROLE.GUIDE),
    userController.getIslookingGuideOfSeekers
  )

  .patch("/updateIsLookingForGuide",
    auth(USER_ROLE.SEEKER),
    userController.updateIsLookingForGuide
  )
  // ============= [ dashboard routes access only admin start ] ==============

  // all users route
  .get('/all-users', auth(USER_ROLE.ADMIN), userController.getAllUsers)

  // all users overview ddat of seeker, GUIDE and recent users
  .get(
    '/all-user-Statistics',
    auth(USER_ROLE.ADMIN),
    userController.getUserStatistics,
  )
  // all users overview ddat of seeker, GUIDE and recent users
  .get(
    '/all-year-user-overview',
    auth(USER_ROLE.ADMIN),
    userController.getYearlyUserOverview,
  )

  // verify user by admin
  .patch(
    '/verifyUser/:userId',
    auth(USER_ROLE.ADMIN),
    userController.verifyUserByAdmin,
  )

   // block user by admin
   .patch(
    '/block/:userId',
    auth(USER_ROLE.ADMIN),
    userController.blockUserByAdmin,
  )

  // block user by admin
  .patch(
    '/unBlock/:userId',
    auth(USER_ROLE.ADMIN),
    userController.unBlockUserByAdmin,
  )



  .get('/role/:role', userController.getUsersByRole)
  .get('/all-plusone-count', userController.getAllPlusOneCount)

  .get('/all-users-rasio', userController.getAllUserRasio)

  
  .get(
    "/wallet", 
    auth(USER_ROLE.SEEKER, USER_ROLE.GUIDE, USER_ROLE.ADMIN), 
    userController.getUserWallet
  )
  
  .get('/:id', userController.getUserById)


  // .patch(
  //   '/update-my-profile',
  //   auth(
  //     USER_ROLE.SEEKER,
  //     USER_ROLE.ADMIN,
  //     USER_ROLE.GUIDE,
  //   ),
  //   upload.single('image'),
  //   parseData(),
  //   userController.updateMyProfile,
  // )

  .patch(
    '/update-my-profile',
    auth(USER_ROLE.SEEKER, USER_ROLE.ADMIN, USER_ROLE.GUIDE),

    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'document', maxCount: 1 },
      { name: 'photos', maxCount: 10 },
    ]),

    parseData(),
    userController.updateMyProfile,
  )

  .put('/block/:id', auth(USER_ROLE.ADMIN), userController.blockedUser)

  .delete(
    '/delete-my-account',
    auth(USER_ROLE.SEEKER, USER_ROLE.ADMIN, USER_ROLE.GUIDE),
    userController.deleteMyAccount,
  );

// export default userRoutes;








// .get('/all-users-count', userController.getAllUserCount)
// .get('/all-seekers-count', userController.getAllSeekerCount)