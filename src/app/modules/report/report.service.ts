import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import { createNotification } from "../notification/notification.utils";
import { User } from "../user/user.models";
import { IReport } from "./report.interface";
import Report from "./report.model";
import httpStatus from 'http-status';

const createReport = async (payload: Partial<IReport>) => {

    const { userId, reportId, comment } = payload;

  // Basic validation
    if (!userId || !reportId || !comment) {
        throw new AppError(httpStatus.BAD_REQUEST, 'userId, reportId, and comment are required');
    }
    //Validate if the user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // validate report user if the user exists
    const reportUser = await User.findById(reportId);
    if (!reportUser) {
        throw new AppError(httpStatus.NOT_FOUND, "Report user not found");
    }

    // Create repoort 
    const result = await Report.create(payload);
    if (!result) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Report creation failed');
    }

    // Now send a notification to the admin about the report
    const admin = await User.findOne({ role: 'admin' });  // Assuming 'role' is used to identify admin users

    if (admin) {
        const adminNotificationData = {
            user_id: userId,  // The user who made the report
            recipient_id: admin._id,  // The admin user
            type: "report",
            title: `${user.fullName} reported ${reportUser.fullName}`,
            message: `${user.fullName} has reported ${reportUser.fullName}. Please review the report.`
        };

        await createNotification(adminNotificationData);
    }

    return result;
};

const warnUserByAdmin = async (id: string, payload: {userId:string, recipient_id: string, comment: string}) => {

    await Report.findByIdAndUpdate(id,{isWarned: true}, {new: true});
    const notificationData = {
            user_id: payload.userId,
            recipient_id: payload.recipient_id,
            type: "warning",
            title: "Account Warning: Policy Violation",
            message: `You Have been warned by the admin for ${payload.comment}`,

          };
    await createNotification(notificationData);
}

const banUserByAdmin = async (id:string, payload: { userId: string; reportId: string; comment: string }) => {
    try {
      await Report.findByIdAndUpdate(id,{isBlocked: true}, {new: true});
      // Ban the user

    
      const bannedUser = await User.findByIdAndUpdate(payload.reportId, { isBlocked: true }, { new: true });
  
      if (!bannedUser) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
      }
  
      // Send notification
      const notificationData = {
        user_id: payload.userId, // The admin banning the user
        recipient_id: payload.reportId, // The user getting banned
        type: "warning",
        title: "Account Warning: Policy Violation",
        message: `You have been banned by the admin for: ${payload.comment}.`,
      };
  
      await createNotification(notificationData);
  
      return bannedUser; // Return the updated user info
    } catch (error) {
      console.error("Error banning user:", error);
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to ban user");
    }
  };
  

const getAllReports = async (query: Record<string, unknown>) => {
  try {

     console.log({query})

      let modelQuery = Report.find(); // Base query

      // Use QueryBuilder for advanced filtering, sorting, search, and pagination
      const queryBuilder = new QueryBuilder<IReport>(modelQuery, {})
          .filter()
          .sort()
          .fields()
          .paginate();

      // Apply population separately (since QueryBuilder does not handle population)
      queryBuilder.modelQuery = queryBuilder.modelQuery.populate([
          { path: 'userId', select: 'fullName role email' },
          { path: 'reportId', select: 'fullName role email' }
      ]);

      // Execute the query to fetch filtered reports
      let reports = await queryBuilder.modelQuery.exec();

      // Search for `reportId.fullName` after execution
      if (query.fullName) {
        const searchTerm = query.fullName.toString().toLowerCase();
        console.log("======>>> searchTerm =====  ", searchTerm);

        reports = reports.filter((report: any) => {
          const fullName = report?.reportId?.fullName?.toLowerCase();
          console.log("===>>>>", fullName);
          
          // ✅ Return true if fullName includes the search term
          return fullName.includes(searchTerm);
        });
      }

      // Fetch total count and pagination info
      const meta = await queryBuilder.countTotal();

      // if (!reports || reports.length === 0) {
      //     throw new AppError(httpStatus.NOT_FOUND, 'Oops! Reports not found');
      // }

      return { reports, meta };
  } catch (error) {
      console.error('Error fetching reports:', error);
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch reports.');
  }
};


// Get all reports by admin
// const getAllReports = async () => {
//     const result = await Report.find().populate([
//       {
//         path: 'userId',
//         select: 'fullName role ',
//       },
//       {
//         path: 'reportId',
//         select: 'fullName role ',
//       },
//     ]);
//     if (!result) {
//       throw new AppError(httpStatus.NOT_FOUND, 'Oops! Report not found');
//     }
//     return result;
//   };

export const reportsService = {
    createReport,
    getAllReports,
    warnUserByAdmin,
    banUserByAdmin
}


