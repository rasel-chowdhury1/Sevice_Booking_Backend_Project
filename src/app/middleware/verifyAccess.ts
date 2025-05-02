import AppError from "../error/AppError";
import { User } from "../modules/user/user.models";
import catchAsync from "../utils/catchAsync";
import httpStatus from 'http-status';

const verifyAccess = (...userRoles: string[]) => {
    return catchAsync(async (req, res, next) => {
        // console.log("====== req body data ====== ", req)
        // console.log("======= headers data ===== ",req.headers)
        const decodeData = req?.user;

        const userId = decodeData?.userId;

        const userData = await User.findById(userId);

        if (!userData) {
            throw new AppError(httpStatus.NOT_FOUND, 'The requested user does not exist. The user may have been removed or the ID provided is incorrect.');
          }

        const {adminVerified, isBlocked, role } = userData;

        console.log({userData})

        
        if (!adminVerified) {
          throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Your account has not been verified by the admin yet. Please contact support for assistance.');
        }

        if(!isBlocked){
            throw new AppError(httpStatus.FORBIDDEN, "Your account has been blocked by the admin. Please contact support to resolve this issue.")
        }

        if (userRoles && !userRoles.includes(role)) {
            throw new AppError(httpStatus.UNAUTHORIZED, 'You do not have the required permissions to access this resource. Please contact the admin if you believe this is a mistake.');
          }
    
        
        next();
      });
}

export default verifyAccess;