import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from 'http-status';
import { ContactUsService } from "./contactUs.service";

const getContactUs = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactUsService.getContactUs();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Contact us fetched successfully!',
    data: result,
  });
});



const updateContactUs = catchAsync(
  async (req: Request, res: Response) => {
    const updateData = req.body;
    console.log('====== Contact us update request ==== >>> ', updateData);

    const result = await ContactUsService.updateContactUs(updateData);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Contact us updated successfully!',
      data: result,
    });
  },
);



export const ContactUsController = {
    getContactUs,
    updateContactUs
}