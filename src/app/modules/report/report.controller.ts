import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { reportsService } from "./report.service";



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
    getAllReports
  }