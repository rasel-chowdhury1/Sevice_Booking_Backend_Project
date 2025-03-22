import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { reportsService } from "./report.service";
import AppError from "../../error/AppError";
import httpStatus from 'http-status';


const createReport = catchAsync(async (req: Request, res: Response) => {
    
    const {userId} = req.user;
    
    req.body.userId = userId;

    const result = await reportsService.createReport(req.body)
  
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Report created successfully',
      data: result,
    });
  });

const warnedUserByAdmin = catchAsync( async (req: Request, res: Response) => {
  const {id} = req.params;
  req.body.userId = req.user.userId
  await reportsService.warnUserByAdmin(id,req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User has been warned successfully.',
    data: "",
  });
});

const banUserByAdmin = catchAsync(async (req: Request, res: Response) => {
  const {id} = req.params;
  // Ensure admin's ID is included
  req.body.adminId = req.user.userId; // Assuming req.user contains admin details

  const { reportId, comment } = req.body; // Extract reported user ID and comment

  if (!reportId || !comment) {
    throw new AppError(httpStatus.BAD_REQUEST, "Report ID and comment are required.");
  }

  // Call the service to ban the user
  await reportsService.banUserByAdmin(id, req.body);

  // Send response
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User has been banned successfully.",
    data: null, // Use null instead of an empty string for consistency
  });
});


const getAllReports = catchAsync(async (req: Request, res: Response) => {

    const result = await reportsService.getAllReports(req.query)
  
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Reports retrive successfully',
      meta: result.meta,
      data: result.reports,
    });
  });

  export const reportsController = {
    createReport,
    getAllReports,
    warnedUserByAdmin,
    banUserByAdmin
  }